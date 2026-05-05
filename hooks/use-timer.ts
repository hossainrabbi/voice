import { useState, useRef, useCallback } from "react";

/**
 * A custom hook to manage a simple seconds timer.
 * Provides start, pause, and reset functionality.
 */
export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setElapsed(0);
  }, [pauseTimer]);

  return {
    elapsed,
    startTimer,
    pauseTimer,
    resetTimer,
    setElapsed,
  };
}
