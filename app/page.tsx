"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Mic, Pause, Play, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type RecordState = "idle" | "recording" | "paused";

export default function Home() {
  const router = useRouter();
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [permissionError, setPermissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [elapsed, setElapsed] = useState(0); // seconds

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setElapsed(0);
  }, [pauseTimer]);

  // ── Volume analyser ────────────────────────────────────────────────────────
  const startAnalyser = (stream: MediaStream) => {
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
    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setVolume(avg / 128);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stopAnalyser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVolume(0);
  };

  // ── Recording lifecycle ────────────────────────────────────────────────────
  const requestMicrophone = async () => {
    try {
      setPermissionError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionModalOpen(false);
      beginRecording(stream);
    } catch (err) {
      console.error(err);
      setPermissionError(
        "Microphone access was denied. Please allow it in your browser settings and try again.",
      );
      setPermissionModalOpen(true);
    }
  };

  const beginRecording = (stream: MediaStream) => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    resetTimer();

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();

    startAnalyser(stream);
    startTimer();
    setRecordState("recording");
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    stopAnalyser();
    pauseTimer();
    setRecordState("paused");
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    if (streamRef.current) startAnalyser(streamRef.current);
    startTimer();
    setRecordState("recording");
  };

  const finaliseRecording = () => {
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
    pauseTimer();
    // keep elapsed for display; blob is set via onstop
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitRecording = async () => {
    // Finalise first (stop recorder so onstop fires and blob is ready)
    finaliseRecording();

    // Wait a tick for onstop to fire
    await new Promise((r) => setTimeout(r, 100));

    const blob = audioChunksRef.current.length
      ? new Blob(audioChunksRef.current, { type: "audio/webm" })
      : audioBlob;

    if (!blob) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/process-voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      sessionStorage.setItem("voiceResult", JSON.stringify(data));
      router.push("/result");
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      // Reset so user can try again
      setRecordState("idle");
      resetTimer();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      finaliseRecording();
      resetTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = recordState === "recording" || recordState === "paused";

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 px-4 py-6">
        <CardHeader className="text-center pb-6 border-b border-white/5 mb-6">
          <CardTitle className="text-4xl font-light mb-2 text-white tracking-tight">
            Voice Interface{" "}
            <span className="text-indigo-400 font-medium italic">Active</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm tracking-widest uppercase">
            Session ID: #0x442B
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center space-y-12 pb-6 relative">
          {/* Recording status badge */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                key="badge"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute -bottom-12 flex flex-col items-center w-full"
              >
                <div className="px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase backdrop-blur-md flex items-center gap-2">
                  {recordState === "recording" ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      Recording — {formatTime(elapsed)}
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 text-yellow-400" />
                      Paused — {formatTime(elapsed)}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mic orb ──────────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 p-1">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {recordState === "recording" && (
                    <motion.div
                      key="recording"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        className="absolute inset-0 bg-indigo-500/20 rounded-full"
                        animate={{
                          scale: 1 + volume * 0.5,
                          opacity: Math.max(0.2, 1 - volume * 0.2),
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-purple-500/30 rounded-full"
                        animate={{
                          scale: 1 + volume * 1.5,
                          opacity: Math.max(0, 1 - volume * 0.5),
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                      />
                      <div className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                        <Mic className="h-12 w-12 animate-pulse text-indigo-400" />
                      </div>
                    </motion.div>
                  )}
                  {recordState === "paused" && (
                    <motion.div
                      key="paused"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                    >
                      <Pause className="h-12 w-12" />
                    </motion.div>
                  )}
                  {recordState === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 text-slate-500"
                    >
                      <Mic className="h-12 w-12 opacity-80" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Buttons ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 w-full items-center min-h-[120px] justify-center">
            {/* IDLE: single Start button */}
            <AnimatePresence>
              {recordState === "idle" && !submitting && (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="w-full flex justify-center"
                >
                  <Button
                    id="btn-start-recording"
                    onClick={requestMicrophone}
                    className="px-12 py-6 h-auto bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest text-sm w-full max-w-[280px]"
                  >
                    Start Recording
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RECORDING or PAUSED: Pause/Resume + Submit */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  key="active-controls"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex gap-3 w-full"
                >
                  {/* Pause / Resume */}
                  {recordState === "recording" ? (
                    <Button
                      id="btn-pause-recording"
                      onClick={pauseRecording}
                      className="flex-1 px-6 py-6 h-auto bg-yellow-500/10 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/20 hover:text-white font-bold rounded-full transition-all uppercase tracking-widest text-sm"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      id="btn-resume-recording"
                      onClick={resumeRecording}
                      className="flex-1 px-6 py-6 h-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/20 hover:text-white font-bold rounded-full transition-all uppercase tracking-widest text-sm"
                    >
                      <Play className="h-4 w-4 mr-2 fill-current" />
                      Resume
                    </Button>
                  )}

                  {/* Submit with timer */}
                  <Button
                    id="btn-submit-recording"
                    onClick={submitRecording}
                    disabled={submitting}
                    className="flex-1 px-6 py-6 h-auto bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all disabled:opacity-70 disabled:hover:shadow-none flex flex-col items-center gap-0.5"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span className="flex items-center gap-1 uppercase tracking-widest text-xs font-bold">
                          <Send className="h-3.5 w-3.5" />
                          Submit
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submitting state (after final submit) */}
            <AnimatePresence>
              {submitting && (
                <motion.div
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-400 text-sm"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading your recording…
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Permission Dialog */}
      <Dialog
        open={permissionModalOpen}
        onOpenChange={(open) => {
          if (!open) setPermissionModalOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#05060a] border-white/10 text-slate-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">
              Microphone Access Required
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              We need access to your microphone to record your voice.
            </DialogDescription>
          </DialogHeader>
          {permissionError && (
            <div className="flex items-start gap-2 p-3 text-sm text-rose-400 bg-rose-500/10 rounded-md border border-rose-500/20 mt-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{permissionError}</p>
            </div>
          )}
          <DialogFooter className="sm:justify-end mt-4">
            <Button
              onClick={() => setPermissionModalOpen(false)}
              variant="ghost"
              className="mr-2 text-slate-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={requestMicrophone}
              autoFocus
              className="bg-white text-black hover:bg-slate-200"
            >
              Grant Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
