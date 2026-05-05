"use client";

import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userName: string) => void;
  submitting: boolean;
}

export function UserNameDialog({
  open,
  onOpenChange,
  onConfirm,
  submitting,
}: UserNameDialogProps) {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = userName.trim();
    if (!trimmed) {
      setError("Please enter your name before submitting.");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  const handleOpenChange = (val: boolean) => {
    if (!submitting) {
      setUserName("");
      setError("");
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm bg-[#05060a] border-white/10 text-slate-50 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-light flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            Who&apos;s Speaking?
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-1 text-sm">
            Enter your name so we can personalise the response.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          <div className="relative">
            <input
              id="user-name-input"
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              disabled={submitting}
              placeholder="e.g. John"
              autoFocus
              className="
                w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                text-slate-50 placeholder-slate-600 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                disabled:opacity-50 transition-all
              "
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 pl-1">{error}</p>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end mt-4">
          <Button
            onClick={() => handleOpenChange(false)}
            variant="ghost"
            disabled={submitting}
            className="flex-1 sm:flex-initial h-11 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            Cancel
          </Button>
          <Button
            id="user-name-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-initial h-11 bg-white text-black hover:bg-slate-200 rounded-full font-bold disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              "Submit Recording"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
