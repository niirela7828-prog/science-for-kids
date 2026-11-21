import { useEffect } from 'react';
import { setProgress } from './store';
import { addUsage } from './progress';

const TICK = 15; // seconds

/** Counts screen time while the app is visible on screen. */
export function useUsageTimer(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') setProgress((p) => addUsage(p, TICK));
    }, TICK * 1000);
    return () => clearInterval(id);
  }, [active]);
}
