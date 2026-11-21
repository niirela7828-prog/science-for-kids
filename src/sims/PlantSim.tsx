import { useState } from 'react';
import { BigButton } from '../components/ui';
import { sounds } from '../lib/sound';
import { Toggle, type SimProps } from './SimView';

export interface PlantInput {
  water: boolean;
  light: boolean;
  soil: boolean;
}

export type PlantResult = 'wilted' | 'pale' | 'small' | 'healthy';

/** Simple, truthful model: water is a must; without light a plant grows pale and weak; poor soil → small plant. */
export function growPlant({ water, light, soil }: PlantInput): PlantResult {
  if (!water) return 'wilted';
  if (!light) return 'pale';
  if (!soil) return 'small';
  return 'healthy';
}

const RESULT_TEXT: Record<PlantResult, string> = {
  wilted: 'בלי מים הצמח נבל והתייבש 🥀',
  pale: 'בלי אור הצמח גדל חיוור, דק וחלש',
  small: 'בחול בלי חומרים מזינים, הצמח נשאר קטן',
  healthy: 'הצמח גדל ירוק וחזק, ואפילו פרח! 🌼',
};

export function PlantSim({ onDone }: SimProps) {
  const [pots, setPots] = useState<PlantInput[]>([
    { water: true, light: true, soil: true },
    { water: false, light: true, soil: true },
    { water: true, light: false, soil: true },
  ]);
  const [grown, setGrown] = useState(false);

  function set(i: number, k: keyof PlantInput, v: boolean) {
    setGrown(false);
    setPots((ps) => ps.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pots.map((p, i) => {
          const r = growPlant(p);
          return (
            <div key={i} className="space-y-2 rounded-2xl bg-white p-3 shadow ring-2 ring-violet-100">
              <div className="text-center text-lg font-bold">עציץ {i + 1}</div>
              <PlantPicture result={grown ? r : null} soil={p.soil} light={p.light} />
              <div className="flex flex-wrap justify-center gap-2">
                <Toggle on={p.water} onChange={(v) => set(i, 'water', v)} label="מים" emoji="💧" />
                <Toggle on={p.light} onChange={(v) => set(i, 'light', v)} label="אור" emoji="☀️" />
                <Toggle on={p.soil} onChange={(v) => set(i, 'soil', v)} label="אדמה טובה" emoji="🟫" />
              </div>
              {grown && <p className="text-center text-base font-semibold animate-fadein" data-testid="plant-result">{RESULT_TEXT[r]}</p>}
            </div>
          );
        })}
      </div>
      <BigButton
        className="w-full"
        onClick={() => {
          setGrown(true);
          sounds.good();
          onDone();
        }}
      >
        ⏩ עוברים שבועיים
      </BigButton>
    </div>
  );
}

function PlantPicture({ result, soil, light }: { result: PlantResult | null; soil: boolean; light: boolean }) {
  const stem = { wilted: '#a16207', pale: '#d9f99d', small: '#22c55e', healthy: '#16a34a' };
  const h = result === null ? 10 : { wilted: 40, pale: 85, small: 35, healthy: 70 }[result];
  const leaf = result === null ? '#22c55e' : stem[result];
  return (
    <svg viewBox="0 0 120 130" className="mx-auto h-36 w-full" aria-hidden="true" style={{ background: light ? '#fef9c3' : '#334155', borderRadius: 16 }}>
      {light && <circle cx="100" cy="18" r="10" fill="#facc15" />}
      {result === null ? (
        <circle cx="60" cy="95" r="4" fill="#78350f" />
      ) : result === 'wilted' ? (
        <path d="M60 100 Q62 75 75 72" stroke={stem.wilted} strokeWidth="4" fill="none" />
      ) : (
        <>
          <line x1="60" y1="100" x2="60" y2={100 - h} stroke={stem[result]} strokeWidth={result === 'pale' ? 2 : 4} />
          <ellipse cx="50" cy={100 - h * 0.5} rx={result === 'pale' ? 6 : 10} ry="5" fill={leaf} />
          <ellipse cx="70" cy={100 - h * 0.7} rx={result === 'pale' ? 6 : 10} ry="5" fill={leaf} />
          {result === 'healthy' && <text x="60" y={100 - h} textAnchor="middle" fontSize="20">🌼</text>}
        </>
      )}
      {result === 'wilted' && <ellipse cx="78" cy="74" rx="8" ry="4" fill="#a16207" />}
      <path d="M30 100 H90 L84 128 H36 Z" fill="#c2410c" />
      <rect x="30" y="98" width="60" height="6" fill={soil ? '#57311a' : '#fde68a'} />
    </svg>
  );
}
