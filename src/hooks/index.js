import { useState, useEffect, useRef, useCallback } from 'react';

// ─── REST TIMER HOOK ─────────────────────────────────────
export function useRestTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef(null);

  const start = useCallback((seconds) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    setTotalTime(0);
  }, []);

  const addTime = useCallback((seconds) => {
    setTimeLeft(prev => prev + seconds);
    setTotalTime(prev => prev + seconds);
  }, []);

  useEffect(() => {
    if (!isRunning) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setIsRunning(false); clearInterval(intervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const progress = totalTime > 0 ? (1 - timeLeft / totalTime) : 0;
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return { timeLeft, isRunning, progress, start, stop, addTime, format: formatTime(timeLeft) };
}

// ─── WORKOUT TIMER HOOK ──────────────────────────────────
export function useWorkoutTimer(startTime) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const update = () => setElapsed(Math.floor((Date.now() - new Date(startTime)) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const format = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return { elapsed, format };
}

// ─── LOCAL STORAGE HOOK ──────────────────────────────────
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    setValue(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* quota */ }
  }, [key]);
  return [value, set];
}
