import { useState, useRef, useCallback, useEffect } from "react";

export type RecordState = "idle" | "recording" | "paused";

interface UseVoiceRecorderProps {
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: (blob: Blob) => void;
}

/**
 * A custom hook to handle audio recording and volume analysis.
 */
export function useVoiceRecorder({
  onStart,
  onPause,
  onResume,
  onStop,
}: UseVoiceRecorderProps = {}) {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [volume, setVolume] = useState(0);
  const [wavePoints, setWavePoints] = useState<number[]>(Array(64).fill(0));
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const stopAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVolume(0);
    setWavePoints(Array(64).fill(0));
  }, []);

  const startAnalyser = useCallback((stream: MediaStream) => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const POINTS = 64;

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setVolume(avg / 128);

      const pts: number[] = [];
      for (let i = 0; i < POINTS; i++) {
        const binIdx = Math.floor((i / POINTS) * dataArray.length);
        pts.push(dataArray[binIdx] / 255);
      }
      setWavePoints(pts);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const beginRecording = useCallback((stream: MediaStream) => {
    audioChunksRef.current = [];
    setAudioBlob(null);

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      onStop?.(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();

    startAnalyser(stream);
    setRecordState("recording");
    onStart?.();
  }, [onStart, onStop, startAnalyser]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    stopAnalyser();
    setRecordState("paused");
    onPause?.();
  }, [onPause, stopAnalyser]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    if (streamRef.current) startAnalyser(streamRef.current);
    setRecordState("recording");
    onResume?.();
  }, [onResume, startAnalyser]);

  const finaliseRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    stopAnalyser();
  }, [stopAnalyser]);

  // Handle cleanup
  useEffect(() => {
    return () => {
      finaliseRecording();
    };
  }, [finaliseRecording]);

  return {
    recordState,
    volume,
    wavePoints,
    audioBlob,
    beginRecording,
    pauseRecording,
    resumeRecording,
    finaliseRecording,
    setRecordState,
    audioChunksRef,
  };
}
