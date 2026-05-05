import { useState, useRef, useCallback, useEffect } from "react";
import { encodeWav } from "@/lib/wav-encoder";

export type RecordState = "idle" | "recording" | "paused";

interface UseVoiceRecorderProps {
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: (blob: Blob) => void;
}

/**
 * A custom hook to handle audio recording via ScriptProcessorNode,
 * volume analysis, and WAV encoding on finalisation.
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

  // Audio graph refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);

  // PCM collection
  const pcmSamplesRef = useRef<Float32Array[]>([]);
  const isPausedRef = useRef(false);
  const sampleRateRef = useRef(44100);

  // ─── Analyser loop ────────────────────────────────────────────────────────
  const stopAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      audioContextRef.current.suspend().catch(() => {});
    }
    setVolume(0);
    setWavePoints(Array(64).fill(0));
  }, []);

  const startAnalyserLoop = useCallback(
    (audioContext: AudioContext, analyser: AnalyserNode) => {
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

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
    },
    [],
  );

  // ─── Begin recording ──────────────────────────────────────────────────────
  const beginRecording = useCallback(
    (stream: MediaStream) => {
      pcmSamplesRef.current = [];
      isPausedRef.current = false;
      setAudioBlob(null);
      streamRef.current = stream;

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass() as AudioContext;
      sampleRateRef.current = audioContext.sampleRate;

      // Analyser for visualisation
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      // ScriptProcessorNode for raw PCM capture (bufferSize 4096)
      const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
      scriptNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!isPausedRef.current) {
          // Copy buffer (the underlying data is reused by the browser)
          pcmSamplesRef.current.push(
            new Float32Array(e.inputBuffer.getChannelData(0)),
          );
        }
      };

      // Silent gain so ScriptProcessorNode output doesn't play through speakers
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      source.connect(scriptNode);
      scriptNode.connect(silentGain);
      silentGain.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      scriptNodeRef.current = scriptNode;

      startAnalyserLoop(audioContext, analyser);
      setRecordState("recording");
      onStart?.();
    },
    [onStart, startAnalyserLoop],
  );

  // ─── Pause ────────────────────────────────────────────────────────────────
  const pauseRecording = useCallback(() => {
    isPausedRef.current = true;
    stopAnalyser();
    setRecordState("paused");
    onPause?.();
  }, [onPause, stopAnalyser]);

  // ─── Resume ───────────────────────────────────────────────────────────────
  const resumeRecording = useCallback(() => {
    isPausedRef.current = false;
    if (audioContextRef.current && analyserRef.current) {
      startAnalyserLoop(audioContextRef.current, analyserRef.current);
    }
    setRecordState("recording");
    onResume?.();
  }, [onResume, startAnalyserLoop]);

  // ─── Finalise: encode WAV & clean up ─────────────────────────────────────
  const finaliseRecording = useCallback((): Blob | null => {
    isPausedRef.current = true; // Stop collecting new samples

    // Stop microphone tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Tear down audio graph
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    // Encode collected PCM samples → WAV
    const chunks = pcmSamplesRef.current;
    let wavBlob: Blob | null = null;

    if (chunks.length > 0) {
      const totalLength = chunks.reduce((acc, arr) => acc + arr.length, 0);
      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      wavBlob = encodeWav(merged, sampleRateRef.current);
      setAudioBlob(wavBlob);
      onStop?.(wavBlob);
    }

    pcmSamplesRef.current = [];
    setVolume(0);
    setWavePoints(Array(64).fill(0));

    return wavBlob;
  }, [onStop]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
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
  };
}
