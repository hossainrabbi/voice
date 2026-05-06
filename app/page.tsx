/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Logo from "@/components/common/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToastContainer } from "@/components/ui/toast";
import { Controls } from "@/components/voice-recorder/controls";
import { MicOrb } from "@/components/voice-recorder/mic-orb";
import { PermissionDialog } from "@/components/voice-recorder/permission-dialog";
import { RecordingBadge } from "@/components/voice-recorder/recording-badge";
import { UserNameDialog } from "@/components/voice-recorder/username-dialog";
import { useTimer } from "@/hooks/use-timer";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UPLOAD_URL = "https://staging-chatbot-api.pmxbd.com/audio/upload";
const ADMIN_NAME = "admin";

interface UploadResponse {
  success: boolean;
  name?: string;
  message?: string;
  comparison_id?: string;
  similarity_percentage?: number;
  error?: string;
}

export default function VoiceRecorderPage() {
  const router = useRouter();
  const { toast, toasts, removeToast } = useToast();

  const { elapsed, startTimer, pauseTimer, resetTimer } = useTimer();

  const [submitting, setSubmitting] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [userNameDialogOpen, setUserNameDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("user_id");
    const storedUserName = sessionStorage.getItem("user_name");
    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
    } else {
      setUserNameDialogOpen(true);
    }
    setIsCheckingSession(false);
  }, []);

  const {
    recordState,
    volume,
    wavePoints,
    beginRecording,
    pauseRecording,
    resumeRecording,
    getAudioBlob,
    clearRecording,
  } = useVoiceRecorder({
    onStart: startTimer,
    onPause: pauseTimer,
    onResume: startTimer,
  });

  // ─── Microphone permission ────────────────────────────────────────────────
  const handleRequestMicrophone = async () => {
    if (!userId) {
      setUserNameDialogOpen(true);
      return;
    }

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

  // ─── Step 1: Confirm Username → Create User ───────────────────────────────
  const handleUserCreate = async (name: string) => {
    setIsCreatingUser(true);
    try {
      const response = await fetch(
        "https://staging-chatbot-api.pmxbd.com/audio/user/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_name: name }),
        },
      );
      const data = await response.json().catch(() => ({}));

      const newUserId =
        data.user_id ||
        data.id ||
        data._id ||
        data.data?.id ||
        data.data?.user_id;

      if (response.ok && newUserId) {
        setUserId(newUserId);
        setUserName(name);
        sessionStorage.setItem("user_id", newUserId);
        sessionStorage.setItem("user_name", name);
        setUserNameDialogOpen(false);
        toast.success("User profile created!");
      } else {
        throw new Error(data.message || data.error || "Failed to create user");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("user_name");
    setUserId("");
    setUserName("");
    setIsDropdownOpen(false);
    setUserNameDialogOpen(true);
  };

  // ─── Step 2: Stop recording → POST multipart/form-data to API ─────────────
  const handleSubmit = async () => {
    if (recordState !== "paused") {
      pauseRecording();
    }
    const blob = getAudioBlob();
    pauseTimer();

    if (!blob || blob.size === 0) {
      toast.error("No audio data captured. Please try recording again.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("admin_name", ADMIN_NAME);
      formData.append("audio_file", blob, "recording.wav");

      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json().catch(() => ({}));

      // ── Success path ──────────────────────────────────────────────────────
      if (response.ok && data.success) {
        toast.success(data.message || "Recording submitted successfully!");
        setSubmitting(false);
        clearRecording();
        resetTimer();
        return;
      }

      // ── API-level failure (HTTP ok but success: false, or non-2xx) ────────
      throw new Error(
        data.error || data.message || "Upload failed. Please try again.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(message);
      setSubmitting(false);
      // We purposefully DO NOT call clearRecording() here so the user can
      // try submitting again or resume recording.
    }
  };

  return (
    <main className="min-h-dvh bg-[#05060a] text-slate-50 flex items-center justify-center px-4 py-6 safe-area-inset relative overflow-hidden font-sans">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-purple-900/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 h-16 border-b border-white/5 bg-black/20 backdrop-blur-md z-50 flex items-center justify-between px-4 sm:px-6">
        <Logo type="light" />
        <div className="flex items-center gap-3">
          {isCheckingSession ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse" />
            </div>
          ) : userId ? (
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium">{userName}</span>
                <UserCircle className="h-8 w-8 text-indigo-400" />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl bg-[#05060a]/90 backdrop-blur-xl border border-white/10 z-50 overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:bg-white/5 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setUserNameDialogOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {isCheckingSession ? (
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 px-3 py-4 sm:px-6 sm:py-6 overflow-hidden mt-16">
          <CardHeader className="text-center pb-4 sm:pb-6 border-b border-white/5 px-2 sm:px-4">
            <div className="h-10 w-48 bg-white/10 rounded mx-auto animate-pulse mb-2" />
            <div className="h-4 w-32 bg-white/10 rounded mx-auto animate-pulse" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-5 sm:gap-6 pt-5 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4 relative min-h-[300px]">
            <div className="w-48 h-48 bg-white/10 rounded-full animate-pulse" />
            <div className="h-12 w-full max-w-xs bg-white/10 rounded-full animate-pulse mt-4" />
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 px-3 py-4 sm:px-6 sm:py-6 overflow-hidden mt-16">
          <CardHeader className="text-center pb-4 sm:pb-6 border-b border-white/5 px-2 sm:px-4">
            <CardTitle className="text-2xl sm:text-4xl font-light mb-1 sm:mb-2 text-white tracking-tight">
              Start Survey
              {/* <span className="text-indigo-400 font-medium italic">Active</span> */}
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2">
              {/* <span>Session ID: #0x442B</span> */}
              {userName && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span className="text-indigo-300 font-medium">
                    {userName}
                  </span>
                </>
              )}
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
      )}

      <PermissionDialog
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        error={permissionError}
        onGrant={handleRequestMicrophone}
      />

      <UserNameDialog
        open={userNameDialogOpen}
        onOpenChange={setUserNameDialogOpen}
        onConfirm={handleUserCreate}
        submitting={isCreatingUser}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
