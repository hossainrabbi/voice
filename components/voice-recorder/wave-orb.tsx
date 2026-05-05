"use client";

import { useRef, useEffect } from "react";
import { RecordState } from "@/hooks/use-voice-recorder";

interface WaveOrbProps {
  wavePoints: number[];
  volume: number;
  recordState: RecordState;
}

export function WaveOrb({ wavePoints, volume, recordState }: WaveOrbProps) {
  const idleAmp = 8;
  const voiceAmp = volume * 48;
  const totalAmp = idleAmp + voiceAmp;

  const W = 200;
  const H = 200;
  const POINTS = 64;

  const isRecording = recordState === "recording";
  const isPaused = recordState === "paused";

  const buildPath = (phaseOffset: number, ampScale: number) => {
    const now = Date.now();
    const pts: [number, number][] = [];
    for (let i = 0; i <= POINTS; i++) {
      const x = (i / POINTS) * W;
      const t = (i / POINTS) * Math.PI * 4 + phaseOffset + now / 800;
      const binAmp = wavePoints[Math.floor((i / POINTS) * wavePoints.length)] ?? 0;
      const y = H * 0.62 - Math.sin(t) * totalAmp * ampScale * (0.5 + binAmp * 0.5);
      pts.push([x, y]);
    }
    return (
      `M ${pts[0][0]} ${pts[0][1]} ` +
      pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(" ") +
      ` L ${W} ${H} L 0 ${H} Z`
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 w-full h-full"
      style={{ borderRadius: "50%" }}
      aria-hidden
    >
      <defs>
        <clipPath id="circle-clip">
          <circle cx={W / 2} cy={H / 2} r={W / 2} />
        </clipPath>
        <linearGradient id="wave1" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isRecording ? "#6366f1" : isPaused ? "#eab308" : "#334155"}
            stopOpacity="0.7"
          />
          <stop
            offset="100%"
            stopColor={isRecording ? "#4f46e5" : isPaused ? "#ca8a04" : "#1e293b"}
            stopOpacity="0.4"
          />
        </linearGradient>
        <linearGradient id="wave2" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isRecording ? "#a855f7" : isPaused ? "#fbbf24" : "#475569"}
            stopOpacity="0.5"
          />
          <stop
            offset="100%"
            stopColor={isRecording ? "#7c3aed" : isPaused ? "#f59e0b" : "#334155"}
            stopOpacity="0.3"
          />
        </linearGradient>
      </defs>

      <g clipPath="url(#circle-clip)">
        <AnimatedWavePath buildPath={() => buildPath(Math.PI * 0.6, 0.7)} fill="url(#wave2)" />
        <AnimatedWavePath buildPath={() => buildPath(0, 1)} fill="url(#wave1)" />
      </g>
    </svg>
  );
}

function AnimatedWavePath({ buildPath, fill }: { buildPath: () => string; fill: string }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const loop = () => {
      if (pathRef.current) {
        pathRef.current.setAttribute("d", buildPath());
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [buildPath]);

  return <path ref={pathRef} fill={fill} />;
}
