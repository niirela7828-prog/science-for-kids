import { useSyncExternalStore } from 'react';
import { STORAGE_KEY, normalize, defaultProgress, type Progress } from './progress';

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(JSON.parse(raw)) : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

let state: Progress = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked – the app keeps working for this session
  }
}

export function getProgress(): Progress {
  return state;
}

export function setProgress(update: Progress | ((p: Progress) => Progress)) {
  state = typeof update === 'function' ? update(state) : update;
  save();
  listeners.forEach((l) => l());
}

/** Re-read from storage (used by tests) */
export function reloadProgress() {
  state = load();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}
