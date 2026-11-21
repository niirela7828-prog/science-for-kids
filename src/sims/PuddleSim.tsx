import { useEffect, useRef, useState } from 'react';
import { BigButton } from '../components/ui';
import { Toggle, type SimProps } from './SimView';

export interface PuddleConditions {
  sun: boolean;
  wind: boolean;
}

/** Fraction of the puddle that evaporates in one hour */
export function evaporationPerHour({ sun, wind }: PuddleConditions): number {
  return 0.04 * (sun ? 3 : 1) * (wind ? 2 : 1);
}

export function PuddleSim({ onDone }: SimProps) {
  const [conds, setConds] = useState<PuddleConditions[]>([
    { sun: true, wind: false },
    { sun: false, wind: false },
  ]);
  const [water, setWater] = useState([1, 1]);
  const [hours, setHours] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!doneRef.current && water.some((w) => w <= 0)) {
      doneRef.current = true;
      onDone();
    }
  }, [water, onDone]);

  function passTime() {
    setHours((h) => h + 1);
    setWater((ws) => ws.map((w, i) => Math.max(0, w - evaporationPerHour(conds[i]))));
  }
  function reset() {
    setHours(0);
    setWater([1, 1]);
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-xl font-semibold">עברו {hours} שעות</p>
      <div className="grid grid-cols-2 gap-3">
        {conds.map((c, i) => (
          <div key={i} className="space-y-2 rounded-2xl p-3 shadow ring-2 ring-violet-100" style={{ background: c.sun ? '#fef9c3' : '#e2e8f0' }}>
            <div className="text-center text-lg font-bold">שלולית {i === 0 ? 'א' : 'ב'}</div>
            <svg viewBox="0 0 120 70" className="h-24 w-full" aria-label={`נשארו ${Math.round(water[i] * 100)} אחוז מים`}>
              {c.sun && <circle cx="105" cy="12" r="9" fill="#facc15" />}
              {c.wind && <text x="8" y="20" fontSize="16">🌬️</text>}
              <rect x="0" y="50" width="120" height="20" fill="#a8a29e" />
              {water[i] > 0 && <ellipse cx="60" cy="55" rx={8 + water[i] * 45} ry={2 + water[i] * 7} fill="#38bdf8" />}
              {water[i] > 0 && water[i] < 1 && c.sun && (
                <text x="60" y="38" fontSize="12" textAnchor="middle" opacity="0.6">♨️</text>
              )}
            </svg>
            <p className="text-center">{water[i] <= 0 ? 'התייבשה!' : `${Math.round(water[i] * 100)}% מים`}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Toggle on={c.sun} onChange={(v) => { reset(); setConds((cs) => cs.map((x, j) => (j === i ? { ...x, sun: v } : x))); }} label={c.sun ? 'שמש' : 'צל'} emoji={c.sun ? '☀️' : '⛱️'} choice />
              <Toggle on={c.wind} onChange={(v) => { reset(); setConds((cs) => cs.map((x, j) => (j === i ? { ...x, wind: v } : x))); }} label="רוח" emoji="🌬️" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <BigButton className="flex-1" onClick={passTime}>
          ⏰ עוברת שעה
        </BigButton>
        <BigButton variant="secondary" onClick={reset}>
          🌧️ שוב גשם
        </BigButton>
      </div>
    </div>
  );
}
