import { useEffect, useState } from 'preact/hooks';
import { wakeLock } from './wakeLock';

export interface RestTimerState {
  active: boolean;
  remainingSec: number;
  totalSec: number;
}

let endTime = 0;
let intervalId: number | null = null;
let audioCtx: AudioContext | null = null;
const listeners = new Set<(s: RestTimerState) => void>();
let state: RestTimerState = { active: false, remainingSec: 0, totalSec: 0 };

function notify(): void {
  for (const cb of listeners) cb(state);
}

function ensureAudio(): void {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch {
    /* AudioContext not available */
  }
}

function playBeep(): void {
  if (!audioCtx) return;
  const ctx = audioCtx;
  const playTone = (offset: number, freq: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    const t0 = ctx.currentTime + offset;
    gain.gain.setValueAtTime(0.3, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration);
  };
  try {
    playTone(0, 880, 0.25);
    playTone(0.3, 880, 0.4);
  } catch (e) {
    console.warn('beep failed:', e);
  }
}

function vibrate(): void {
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    /* not supported */
  }
}

function tick(): void {
  if (!state.active && state.remainingSec === 0) return;
  const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  state = { ...state, remainingSec: remaining };
  notify();
  if (remaining === 0 && state.active) {
    playBeep();
    vibrate();
    state = { ...state, active: false };
    notify();
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    void wakeLock.release();
  }
}

export const restTimer = {
  start(seconds: number): void {
    ensureAudio();
    endTime = Date.now() + seconds * 1000;
    state = { active: true, remainingSec: seconds, totalSec: seconds };
    notify();
    void wakeLock.acquire();
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = window.setInterval(tick, 250);
  },
  stop(): void {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    void wakeLock.release();
    state = { active: false, remainingSec: 0, totalSec: 0 };
    notify();
  },
  addSec(sec: number): void {
    if (!state.active) return;
    endTime += sec * 1000;
    tick();
  },
};

export function useRestTimer(): RestTimerState {
  const [s, setS] = useState<RestTimerState>(state);
  useEffect(() => {
    const cb = (next: RestTimerState) => setS(next);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return s;
}
