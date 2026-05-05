"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AudioWaveform,
  Calendar,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = "https://staging-chatbot-api.pmxbd.com";

interface ResultData {
  success: boolean;
  name?: string;
  comparison_id?: string;
  similarity_percentage?: number;
  created_at?: string;
  error?: string;
}

function SimilarityRing({ percent }: { percent: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 75
      ? "#34d399" // emerald
      : percent >= 50
        ? "#facc15" // yellow
        : "#f87171"; // red

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="10"
        />
        {/* Progress */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      {/* Label */}
      <div className="flex flex-col items-center z-10">
        <motion.span
          className="text-3xl font-bold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {percent}%
        </motion.span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
          Match
        </span>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const comparisonId = params?.id as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!comparisonId) return;
    const fetchResult = async () => {
      try {
        const res = await fetch(`${API_BASE}/audio/result/${comparisonId}`);
        const json: ResultData = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load result.");
        }
        setData(json);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load result.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [comparisonId]);

  const similarity = data?.similarity_percentage ?? 0;
  const isSuccess = data?.success ?? false;
  const name = data?.name || "—";
  const createdAt = data?.created_at
    ? new Date(data.created_at).toLocaleString()
    : "—";

  return (
    <main className="min-h-dvh bg-[#05060a] text-slate-50 flex items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-purple-900/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-light tracking-tight">
              Voice Interface{" "}
              <span className="text-indigo-400 font-medium italic">Result</span>
            </h1>
            {comparisonId && (
              <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                ID: {comparisonId}
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <motion.div
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-14 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading result…</p>
          </motion.div>
        )}

        {/* ── Fetch error ── */}
        {!loading && fetchError && (
          <motion.div
            className="bg-black/40 backdrop-blur-xl border border-rose-500/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <XCircle className="h-10 w-10 text-rose-400" />
            <p className="text-rose-300 text-sm">{fetchError}</p>
            <Button
              onClick={() => router.push("/")}
              className="mt-2 px-6 h-10 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-full text-xs uppercase tracking-widest"
            >
              Go Back
            </Button>
          </motion.div>
        )}

        {/* ── Result card ── */}
        {!loading && !fetchError && data && (
          <motion.div
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Status bar */}
            <div
              className={`px-6 py-3 flex items-center gap-2 border-b border-white/5 ${
                isSuccess ? "bg-emerald-500/10" : "bg-rose-500/10"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400" />
              )}
              <span
                className={`text-xs font-bold uppercase tracking-widest ${
                  isSuccess ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isSuccess ? "Verified" : "Not Verified"}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Similarity ring */}
              <div className="flex flex-col items-center gap-3">
                <SimilarityRing percent={similarity} />
                <p className="text-xs text-slate-500 uppercase tracking-widest">
                  Voice Similarity Score
                </p>
              </div>

              <div className="border-t border-white/5" />

              {/* Info rows */}
              <div className="space-y-3">
                {/* Speaker */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Speaker</p>
                    <p className="text-sm text-slate-200 font-medium truncate">{name}</p>
                  </div>
                </div>

                {/* Verified by */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Verified By</p>
                    <p className="text-sm text-slate-200 font-medium">Admin</p>
                  </div>
                </div>

                {/* Analysed at */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/[0.08]">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Analysed At</p>
                    <p className="text-sm text-slate-200 font-medium">{createdAt}</p>
                  </div>
                </div>

                {/* Error message if any */}
                {data.error && (
                  <div className="flex items-start gap-3 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-300 leading-relaxed">{data.error}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Record again */}
        {!loading && (
          <motion.div
            className="flex justify-center pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => router.push("/")}
              className="px-8 h-11 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold rounded-full transition-all uppercase tracking-widest text-xs"
            >
              Record Another
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
