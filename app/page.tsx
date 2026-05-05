"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controls } from "@/components/voice-recorder/controls";
import { MicOrb } from "@/components/voice-recorder/mic-orb";
import { PermissionDialog } from "@/components/voice-recorder/permission-dialog";
import { RecordingBadge } from "@/components/voice-recorder/recording-badge";
import { UserNameDialog } from "@/components/voice-recorder/username-dialog";
import { useTimer } from "@/hooks/use-timer";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const UPLOAD_URL = "https://staging-chatbot-api.pmxbd.com/audio/upload";
const ADMIN_NAME = "Admin";

export default function VoiceRecorderPage() {
  const router = useRouter();

  const { elapsed, startTimer, pauseTimer, resetTimer } = useTimer();

  const [submitting, setSubmitting] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [userNameDialogOpen, setUserNameDialogOpen] = useState(false);

  // Holds the WAV blob between "Submit" click and username confirmation
  const pendingBlobRef = useRef<Blob | null>(null);

  const {
    recordState,
    volume,
    wavePoints,
    beginRecording,
    pauseRecording,
    resumeRecording,
    finaliseRecording,
  } = useVoiceRecorder({
    onStart: startTimer,
    onPause: pauseTimer,
    onResume: startTimer,
  });

  // ─── Microphone permission ────────────────────────────────────────────────
  const handleRequestMicrophone = async () => {
    try {
      setPermissionError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionModalOpen(false);
      beginRecording(stream);
    } catch (err) {
      console.error(err);
      setPermissionError(
        "Microphone access was denied. Please check your browser settings.",
      );
      setPermissionModalOpen(true);
    }
  };

  // ─── Step 1: Stop recording, store WAV blob, open username modal ──────────
  const handleSubmit = () => {
    const blob = finaliseRecording();
    pauseTimer();

    if (!blob || blob.size === 0) {
      console.warn("No audio data captured.");
      return;
    }

    pendingBlobRef.current = blob;
    setUserNameDialogOpen(true);
  };

  // ─── Step 2: User enters name → POST multipart/form-data to real API ─────
  const handleConfirmSubmit = async (userName: string) => {
    const blob = pendingBlobRef.current;
    if (!blob || blob.size === 0) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("user_name", userName);
      formData.append("admin_name", ADMIN_NAME);
      formData.append("audio_file", blob, "recording.wav");

      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed — HTTP ${response.status}`);
      }

      const data = await response.json();
      sessionStorage.setItem("voiceResult", JSON.stringify(data));
      router.push("/result");
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setUserNameDialogOpen(false);
      pendingBlobRef.current = null;
      resetTimer();
    }
  };

  return (
    <main className="min-h-dvh bg-[#05060a] text-slate-50 flex items-center justify-center px-4 py-6 safe-area-inset relative overflow-hidden font-sans">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-purple-900/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 px-3 py-4 sm:px-6 sm:py-6 overflow-hidden">
        <CardHeader className="text-center pb-4 sm:pb-6 border-b border-white/5 px-2 sm:px-4">
          <CardTitle className="text-2xl sm:text-4xl font-light mb-1 sm:mb-2 text-white tracking-tight">
            Voice Interface{" "}
            <span className="text-indigo-400 font-medium italic">Active</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase">
            Session ID: #0x442B
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center gap-5 sm:gap-6 pt-5 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4 relative">
          <RecordingBadge recordState={recordState} elapsed={elapsed} />

          <MicOrb
            recordState={recordState}
            volume={volume}
            wavePoints={wavePoints}
          />

          <Controls
            recordState={recordState}
            submitting={submitting}
            onRequestMicrophone={handleRequestMicrophone}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      <PermissionDialog
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        error={permissionError}
        onGrant={handleRequestMicrophone}
      />

      <UserNameDialog
        open={userNameDialogOpen}
        onOpenChange={setUserNameDialogOpen}
        onConfirm={handleConfirmSubmit}
        submitting={submitting}
      />
    </main>
  );
}
