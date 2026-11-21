import { useEffect, useRef, useState } from 'react';
import { BigButton } from '../components/ui';
import { Slider, type SimProps } from './SimView';

/** How much ice melts (negative = freezes back) per tick at a temperature, in fraction of a cube */
export function meltRate(tempC: number): number {
  if (tempC > 0) return tempC * 0.0006;
  if (tempC < 0) return tempC * 0.0004; // water freezes back below 0
  return 0;
}

export function IceSim({ onDone }: SimProps) {
  const [temp, setTemp] = useState(-5);
  const [ice, setIce] = useState(1); // 1 = whole cube, 0 = all water
  const doneRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setIce((v) => Math.max(0, Math.min(1, v - meltRate(temp)))), 50);
    return () => clearInterval(id);
  }, [temp]);

  useEffect(() => {
    if (ice < 0.4 && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [ice, onDone]);

  const state = temp < 0 ? (ice < 1 ? 'קר מתחת ל-0: המים קופאים חזרה לקרח ❄️' : 'קר מתחת ל-0: הקרח נשאר קרח ❄️') : temp === 0 ? 'בדיוק 0 מעלות: כמעט שום דבר לא משתנה' : temp < 15 ? 'מעל 0: הקרח נמס לאט 💧' : 'חם! הקרח נמס מהר 💦';
  const size = 30 + ice * 60;
  const water = 1 - ice;
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-6 rounded-2xl p-4" style={{ background: temp > 15 ? '#fee2e2' : temp > 0 ? '#fef9c3' : '#e0f2fe' }}>
        <Thermometer temp={temp} />
        <svg viewBox="0 0 200 150" className="h-44 w-60" aria-label={`קרח: ${Math.round(ice * 100)} אחוז`}>
          <ellipse cx="100" cy="135" rx={20 + water * 75} ry={4 + water * 8} fill="#7dd3fc" opacity="0.8" />
          {ice > 0.01 && (
            <rect x={100 - size / 2} y={130 - size} width={size} height={size} rx={8 + (1 - ice) * 14} fill="#e0f2fe" stroke="#38bdf8" strokeWidth="3" />
          )}
          {ice > 0.01 && <rect x={100 - size / 2 + 8} y={130 - size + 8} width={size / 4} height={size / 4} rx="3" fill="#fff" opacity="0.8" />}
        </svg>
      </div>
      <p className="text-center text-xl font-semibold" aria-live="polite">{state}</p>
      <Slider label={`מד חום: ${temp} מעלות`} value={temp} min={-20} max={40} onChange={setTemp} />
      <BigButton variant="secondary" className="w-full" onClick={() => setIce(1)}>
        🧊 קוביית קרח חדשה
      </BigButton>
    </div>
  );
}

function Thermometer({ temp }: { temp: number }) {
  const h = ((temp + 20) / 60) * 100;
  return (
    <svg viewBox="0 0 40 150" className="h-40 w-10" aria-hidden="true">
      <rect x="14" y="5" width="12" height="115" rx="6" fill="#fff" stroke="#78716c" strokeWidth="2" />
      <rect x="17" y={117 - h} width="6" height={h} fill={temp > 0 ? '#ef4444' : '#3b82f6'} />
      <circle cx="20" cy="130" r="12" fill={temp > 0 ? '#ef4444' : '#3b82f6'} stroke="#78716c" strokeWidth="2" />
      <line x1="8" y1={117 - (20 / 60) * 100} x2="32" y2={117 - (20 / 60) * 100} stroke="#1c1917" strokeWidth="1.5" />
    </svg>
  );
}
