"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: string;
  onGrant: () => void;
}

export function PermissionDialog({
  open,
  onOpenChange,
  error,
  onGrant,
}: PermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md bg-[#05060a] border-white/10 text-slate-50 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-light">
            Microphone Access Required
          </DialogTitle>
          <DialogDescription className="text-slate-400 pt-2 text-sm">
            We need microphone access to record your voice.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20 mt-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed">{error}</p>
          </div>
        )}
        <DialogFooter className="flex-row gap-2 sm:justify-end mt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="flex-1 sm:flex-initial h-11 text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={onGrant}
            autoFocus
            className="flex-1 sm:flex-initial h-11 bg-white text-black hover:bg-slate-200 rounded-full font-bold"
          >
            Grant Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
