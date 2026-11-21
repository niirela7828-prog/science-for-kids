import { useEffect, useState } from 'react';
import { BigButton } from '../components/ui';
import { sounds } from '../lib/sound';
import type { SimProps } from './SimView';

export type EggState = 'sinks' | 'middle' | 'floats';

/** More salt → water pushes up harder. In this model: 0–3 spoons sink, 4–5 hover, 6+ float. */
export function eggState(spoons: number): EggState {
  if (spoons >= 6) return 'floats';
  if (spoons >= 4) return 'middle';
  return 'sinks';
}

const TEXT: Record<EggState, string> = {
  sinks: 'הביצה בתחתית הכוס',
  middle: 'הביצה מתחילה לעלות…',
  floats: 'הביצה צפה! 🎉',
};

export function SaltEggSim({ onDone }: SimProps) {
  const [spoons, setSpoons] = useState(0);
  const st = eggState(spoons);
  useEffect(() => {
    if (st === 'floats') {
      sounds.good();
      onDone();
    }
  }, [st, onDone]);
  const eggY = { sinks: 150, middle: 105, floats: 52 }[st];
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 200 190" className="mx-auto h-60 w-full" aria-label={TEXT[st]}>
        <path d="M45 30 L55 180 H145 L155 30" fill="none" stroke="#94a3b8" strokeWidth="4" />
        <path d="M47 50 L56 178 H144 L153 50 Z" fill="#7dd3fc" opacity={0.45 + Math.min(spoons, 8) * 0.04} />
        {Array.from({ length: Math.min(spoons, 10) }, (_, i) => (
          <circle key={i} cx={65 + ((i * 37) % 70)} cy={70 + ((i * 53) % 100)} r="2" fill="#fff" />
        ))}
        <ellipse cx="100" cy={eggY} rx="17" ry="22" fill="#fef3c7" stroke="#d6d3d1" strokeWidth="2" style={{ transition: 'cy 0.8s ease' }} />
      </svg>
      <p className="text-center text-xl font-semibold" aria-live="polite">
        {spoons} כפות מלח – {TEXT[st]}
      </p>
      <div className="flex gap-3">
        <BigButton className="flex-1" onClick={() => setSpoons((s) => Math.min(10, s + 1))}>
          🧂 עוד כף מלח
        </BigButton>
        <BigButton variant="secondary" onClick={() => setSpoons(0)}>
          🔄 מים רגילים
        </BigButton>
      </div>
    </div>
  );
}
