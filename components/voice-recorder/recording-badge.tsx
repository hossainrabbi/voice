"use client";

import { motion } from "motion/react";
import { Pause } from "lucide-react";
import { formatTime } from "@/lib/format-time";
import { RecordState } from "@/hooks/use-voice-recorder";

interface RecordingBadgeProps {
  recordState: RecordState;
  elapsed: number;
}

export function RecordingBadge({ recordState, elapsed }: RecordingBadgeProps) {
  if (recordState === "idle") return null;

  return (
    <motion.div
      key="badge"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex flex-col items-center w-full"
    >
      <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono uppercase backdrop-blur-md flex items-center gap-2">
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
  );
}
