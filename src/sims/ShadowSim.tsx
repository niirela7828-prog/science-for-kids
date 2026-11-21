import { useEffect, useRef, useState } from 'react';
import { Slider, type SimProps } from './SimView';

const TREE_H = 60;

/** Sun height above the horizon (degrees) for an hour between 6 and 18 */
export function sunElevation(hour: number): number {
  const f = Math.sin((Math.PI * (hour - 6)) / 12);
  return Math.max(4, 65 * f);
}

/** Shadow length of the tree: the lower the sun, the longer the shadow */
export function shadowLength(hour: number): number {
  const e = (sunElevation(hour) * Math.PI) / 180;
  return Math.min(220, TREE_H / Math.tan(e));
}

export function ShadowSim({ onDone }: SimProps) {
  const [hour, setHour] = useState(7);
  const seen = useRef({ morning: false, evening: false, done: false });

  useEffect(() => {
    if (hour <= 9) seen.current.morning = true;
    if (hour >= 15) seen.current.evening = true;
    if (seen.current.morning && seen.current.evening && !seen.current.done) {
      seen.current.done = true;
      onDone();
    }
  }, [hour, onDone]);

  const a = (Math.PI * (hour - 6)) / 12;
  const sunX = 150 - Math.cos(a) * 130;
  const sunY = 150 - Math.sin(a) * 120;
  const len = shadowLength(hour);
  const dir = sunX < 150 ? 1 : -1; // shadow goes away from the sun
  const label = hour < 11 ? 'בוקר' : hour <= 13 ? 'צהריים' : hour < 17 ? 'אחר הצהריים' : 'ערב';
  const sky = hour < 8 || hour > 16.5 ? '#fdba74' : '#bae6fd';

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 300 180" className="w-full rounded-2xl" style={{ background: sky }} aria-label={`שעה ${hour}, ${label}`}>
        <circle cx={sunX} cy={sunY} r="14" fill="#facc15" stroke="#f59e0b" strokeWidth="3" />
        <rect x="0" y="150" width="300" height="30" fill="#86efac" />
        <polygon points={`146,150 154,150 ${150 + dir * len},158 ${150 + dir * len},150`} fill="#1e293b" opacity="0.45" />
        <ellipse cx={150 + (dir * len) / 2} cy="153" rx={Math.max(10, len / 2)} ry="4" fill="#1e293b" opacity="0.35" />
        <rect x="146" y={150 - TREE_H + 25} width="8" height={TREE_H - 25} fill="#92400e" />
        <circle cx="150" cy={150 - TREE_H + 15} r="20" fill="#16a34a" />
      </svg>
      <p className="text-center text-xl font-semibold" aria-live="polite">
        שעה {hour}:00 – {label}. הצל {len > 90 ? 'ארוך מאוד' : len > 45 ? 'ארוך' : 'קצר'}.
      </p>
      <Slider label="הזיזי את השמש במשך היום" value={hour} min={6} max={18} step={0.5} onChange={setHour} />
    </div>
  );
}
