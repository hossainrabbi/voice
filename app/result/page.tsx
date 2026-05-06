"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, AudioWaveform, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MOCK_DATA = [
  {
    id: 1,
    question: "What is Next.js and why should I use it?",
    answer:
      "Next.js is a React framework that provides hybrid static and server rendering, TypeScript support, smart bundling, route pre-fetching, and more. It simplifies building fast, SEO-friendly web applications by providing a convention-based routing system and powerful rendering options out of the box.",
  },
  {
    id: 2,
    question: "How does the App Router differ from the Pages Router?",
    answer:
      "The App Router uses React Server Components by default, allowing for better performance by reducing client-side JavaScript. It also supports nested layouts, simplified data fetching, and improved routing primitives compared to the legacy Pages Router.",
  },
];

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("voiceResult");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const transcription = data?.transcription || MOCK_DATA;
  const metadata = data?.metadata || { confidence: 0.982, duration: "4.2s" };
  const id = data?.id || "#0x442B";

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-50 p-4 pb-20 md:p-8 flex relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto w-full space-y-8 flex flex-col pt-8 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-light tracking-tight">
              Voice Interface{" "}
              <span className="text-indigo-400 font-medium italic">Active</span>
            </h1>
          </div>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded border border-green-500/20 uppercase tracking-widest font-bold hidden sm:inline-block">
            Success
          </span>
        </div>

        <div className="bg-black/60 backdrop-blur-xl p-6 md:p-10 flex flex-col border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <AudioWaveform className="h-4 w-4 text-indigo-400" />
              Latest Result
            </h2>
            <p className="text-slate-400 text-xs tracking-widest uppercase font-mono hidden sm:inline-block">
              ID: {id}
            </p>
          </div>

          <div className="space-y-8">
            {transcription.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 + 0.1 }}
                className="space-y-4 relative"
              >
                <div className="p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-indigo-400 text-[10px] font-bold uppercase mb-3 tracking-tighter">
                    Question
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed text-slate-200 font-light">
                    {item.question}
                  </p>
                </div>
                <div className="p-5 md:p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 ml-4 md:ml-8 relative">
                  {/* Decorative connector */}
                  <div className="absolute -left-[17px] md:-left-[33px] top-8 w-4 md:w-8 border-t border-dashed border-indigo-500/30"></div>
                  <div className="absolute -left-[29px] md:-left-[45px] -top-6 bottom-auto h-14 w-px border-l border-dashed border-indigo-500/30"></div>

                  <p className="text-indigo-400 text-[10px] font-bold uppercase mb-3 tracking-tighter flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Converted Answer
                  </p>
                  <p className="text-sm md:text-base leading-relaxed text-slate-400">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-4 border border-dashed border-white/10 rounded-xl flex items-center justify-between gap-3 bg-white/5 opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] text-slate-500 font-mono italic hover:text-slate-400 transition-colors cursor-pointer">
                Listening for context triggers...
              </span>
            </div>
            <div className="flex gap-4">
              <div className="text-xs font-mono text-slate-500 hidden sm:block">
                <span className="text-slate-600">CONF:</span>{" "}
                <span className="text-green-400">{metadata.confidence}</span>
              </div>
              <div className="text-xs font-mono text-slate-500 hidden sm:block">
                <span className="text-slate-600">DUR:</span> {metadata.duration}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 pb-12">
          <Button
            onClick={() => router.push("/")}
            className="px-8 py-4 h-auto bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold rounded-full transition-all uppercase tracking-widest text-xs"
          >
            Record Another Audio
          </Button>
        </div>
      </div>
    </div>
  );
}
