// Tiny happy sounds made with Web Audio (no audio files, works offline).
import { getProgress } from './store';

let ctx: AudioContext | null = null;

export function audioCtx(): AudioContext | null {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function tone(freq: number, duration = 0.15, delay = 0, type: OscillatorType = 'sine', volume = 0.15) {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + duration + 0.05);
}

const on = () => getProgress().settings.sound;

export const sounds = {
  good: () => {
    if (!on()) return;
    tone(660, 0.12);
    tone(880, 0.18, 0.1);
  },
  soft: () => on() && tone(330, 0.15, 0, 'triangle', 0.08),
  win: () => on() && [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, i * 0.12)),
  tap: () => on() && tone(500, 0.06, 0, 'triangle', 0.08),
};
