"use client";

import { motion, AnimatePresence } from "motion/react";
import { Mic, Pause } from "lucide-react";
import { WaveOrb } from "./wave-orb";
import { RecordState } from "@/hooks/use-voice-recorder";

interface MicOrbProps {
  recordState: RecordState;
  volume: number;
  wavePoints: number[];
}

export function MicOrb({ recordState, volume, wavePoints }: MicOrbProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute w-40 h-40 sm:w-64 sm:h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Gradient ring */}
      <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 p-[3px]">
        <div className="w-full h-full rounded-full bg-[#05060a] flex items-center justify-center overflow-hidden relative">
          <WaveOrb
            wavePoints={wavePoints}
            volume={volume}
            recordState={recordState}
          />

          <AnimatePresence mode="wait">
            {recordState === "recording" && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative z-10 text-white drop-shadow-[0_0_15px_rgba(167,139,250,0.9)]"
              >
                <Mic className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-300" />
              </motion.div>
            )}
            {recordState === "paused" && (
              <motion.div
                key="paused"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative z-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
              >
                <Pause className="h-10 w-10 sm:h-12 sm:w-12" />
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
                <Mic className="h-10 w-10 sm:h-12 sm:w-12 opacity-80" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
