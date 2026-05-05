"use client";

import { motion, AnimatePresence } from "motion/react";
import { Send, Pause, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordState } from "@/hooks/use-voice-recorder";

interface ControlsProps {
  recordState: RecordState;
  submitting: boolean;
  onRequestMicrophone: () => void;
  onPause: () => void;
  onResume: () => void;
  onSubmit: () => void;
}

export function Controls({
  recordState,
  submitting,
  onRequestMicrophone,
  onPause,
  onResume,
  onSubmit,
}: ControlsProps) {
  const isActive = recordState === "recording" || recordState === "paused";

  return (
    <div className="flex flex-col gap-3 w-full items-center">
      <AnimatePresence mode="wait">
        {recordState === "idle" && !submitting ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full flex justify-center"
          >
            <Button
              onClick={onRequestMicrophone}
              className="h-14 sm:h-auto sm:py-6 px-8 sm:px-12 bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest text-sm w-full max-w-xs"
            >
              Start Recording
            </Button>
          </motion.div>
        ) : isActive ? (
          <motion.div
            key="active-controls"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex gap-3 w-full"
          >
            {recordState === "recording" ? (
              <Button
                onClick={onPause}
                className="flex-1 h-14 sm:h-auto sm:py-6 px-4 sm:px-6 bg-yellow-500/10 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/20 hover:text-white font-bold rounded-full transition-all uppercase tracking-widest text-xs sm:text-sm"
              >
                <Pause className="h-4 w-4 mr-1.5 sm:mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={onResume}
                className="flex-1 h-14 sm:h-auto sm:py-6 px-4 sm:px-6 bg-indigo-500/10 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/20 hover:text-white font-bold rounded-full transition-all uppercase tracking-widest text-xs sm:text-sm"
              >
                <Play className="h-4 w-4 mr-1.5 sm:mr-2 fill-current" />
                Resume
              </Button>
            )}

            <Button
              onClick={onSubmit}
              disabled={submitting}
              className="flex-1 h-14 sm:h-auto sm:py-6 px-4 sm:px-6 bg-white text-black font-bold rounded-full hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all disabled:opacity-70 disabled:hover:shadow-none flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="uppercase tracking-widest text-xs sm:text-sm font-bold">Submit</span>
                </>
              )}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {submitting && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading your recording…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
