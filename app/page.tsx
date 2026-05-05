"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Send, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "motion/react";

export default function Home() {
  const router = useRouter();
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [volume, setVolume] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);

  const requestMicrophone = async () => {
    try {
      setPermissionError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionModalOpen(false);
      startRecording(stream);
    } catch (err) {
      console.error(err);
      setPermissionError("Microphone access was denied. Please allow it in your browser settings and try again.");
      setPermissionModalOpen(true);
    }
  };

  const startRecording = (stream: MediaStream) => {
    setRecording(true);
    setHasRecorded(false);

    // Set up audio visualizer
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return; // Fallback if not supported
    
    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((b, a) => a + b, 0);
      const average = sum / dataArray.length;
      // Volume is 0-255. Normalize to roughly 0-1 for animation scale.
      setVolume(average / 128); // 128 makes it a bit more sensitive
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      // Ignore errors if context is already closed
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    setRecording(false);
    setHasRecorded(true);
    setVolume(0);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const submitRecording = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmitting(false);
    router.push("/result");
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 px-4 py-6">
        <CardHeader className="text-center pb-6 border-b border-white/5 mb-6">
          <CardTitle className="text-4xl font-light mb-2 text-white tracking-tight">Voice Interface <span className="text-indigo-400 font-medium italic">Active</span></CardTitle>
          <CardDescription className="text-slate-400 text-sm tracking-widest uppercase">Session ID: #0x442B</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-12 pb-6">
          
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 p-1">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                {recording ? (
                  <>
                    <motion.div 
                      className="absolute inset-0 bg-indigo-500/20 rounded-full"
                      animate={{
                        scale: 1 + volume * 0.5,
                        opacity: Math.max(0.2, 1 - volume * 0.2)
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-purple-500/30 rounded-full"
                      animate={{
                        scale: 1 + volume * 1.5,
                        opacity: Math.max(0, 1 - volume * 0.5)
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    />
                    <div className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]">
                       <Mic className="h-12 w-12 animate-pulse text-indigo-400" />
                    </div>
                  </>
                ) : hasRecorded ? (
                   <div className="relative z-10 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                       <Mic className="h-12 w-12" />
                   </div>
                ) : (
                    <div className="relative z-10 text-slate-500 hidden-when-js-off">
                       <Mic className="h-12 w-12 opacity-80" />
                   </div>
                )}
              </div>
            </div>
            
            {recording && (
              <div className="absolute -bottom-16 flex flex-col items-center w-full">
                <div className="px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase backdrop-blur-md">
                  Processing Input...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 min-h-[56px] w-full justify-center">
             {!recording && !hasRecorded && (
                <Button onClick={requestMicrophone} className="px-12 py-6 h-auto bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest text-sm w-full max-w-[280px]">
                  Start Recording
                </Button>
             )}
             
             {recording && (
                <Button onClick={stopRecording} className="px-12 py-6 h-auto bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30 hover:text-white font-bold rounded-full transition-all uppercase tracking-widest text-sm w-full max-w-[280px]">
                  <Square className="h-4 w-4 mr-2 fill-current" /> Stop
                </Button>
             )}
             
             {hasRecorded && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-3 w-full"
                >
                   <Button onClick={submitRecording} disabled={submitting} className="px-12 py-6 h-auto bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest text-sm disabled:opacity-70 disabled:hover:shadow-none w-full">
                     {submitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                     Submit Voice
                   </Button>
                   <Button onClick={requestMicrophone} variant="ghost" className="px-8 py-4 h-auto bg-transparent border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold rounded-full transition-all uppercase tracking-widest text-xs w-full">
                     Retake Recording
                   </Button>
                </motion.div>
             )}
          </div>
          
        </CardContent>
      </Card>

      <Dialog open={permissionModalOpen} onOpenChange={(open) => {
          if (!open) {
              setPermissionModalOpen(false);
          }
      }}>
        <DialogContent className="sm:max-w-md bg-[#05060a] border-white/10 text-slate-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-light">Microphone Access Required</DialogTitle>
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
            <Button onClick={() => setPermissionModalOpen(false)} variant="ghost" className="mr-2 text-slate-400 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={requestMicrophone} autoFocus className="bg-white text-black hover:bg-slate-200">
              Grant Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
