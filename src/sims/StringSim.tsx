import { useEffect, useState } from 'react';
import { BigButton } from '../components/ui';
import { tone } from '../lib/sound';
import { Toggle, type SimProps } from './SimView';

/** Thin and tight strings vibrate faster → higher sound */
export function stringFrequency(thin: boolean, tight: boolean): number {
  return (thin ? 2 : 1) * (tight ? 2 : 1) * 130;
}

export function StringSim({ onDone }: SimProps) {
  const [thin, setThin] = useState(true);
  const [tight, setTight] = useState(true);
  const [plucks, setPlucks] = useState(0);
  const [tried, setTried] = useState<string[]>([]);

  useEffect(() => {
    if (tried.length >= 3) onDone();
  }, [tried, onDone]);

  const freq = stringFrequency(thin, tight);
  function pluck() {
    tone(freq, 1.0, 0, 'triangle', 0.25);
    setPlucks((p) => p + 1);
    const k = `${thin}-${tight}`;
    setTried((t) => (t.includes(k) ? t : [...t, k]));
  }
  const speed = 0.4 / (freq / 130); // vibration animation period
  const label = freq >= 500 ? 'גבוה מאוד 🐦' : freq >= 260 ? 'בינוני 🎵' : 'נמוך 🐻';
  return (
    <div className="space-y-4">
      <style>{`@keyframes vib { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(-1) } }`}</style>
      <button type="button" onClick={pluck} className="block w-full rounded-2xl bg-amber-100 p-4 active:scale-[0.99]" aria-label="לפרוט על המיתר">
        <svg viewBox="0 0 300 80" className="w-full" aria-hidden="true">
          <rect x="5" y="20" width="14" height="40" rx="3" fill="#92400e" />
          <rect x="281" y="20" width="14" height="40" rx="3" fill="#92400e" />
          <g key={plucks} style={{ transformOrigin: '150px 40px', animation: plucks ? `vib ${speed}s linear 6` : undefined }}>
            <path d={`M19 40 Q150 ${tight ? 30 : 18} 281 40`} stroke="#57534e" strokeWidth={thin ? 2 : 7} fill="none" />
          </g>
        </svg>
        <span className="text-xl font-bold">👆 לחצי כאן כדי לפרוט</span>
      </button>
      <div className="flex flex-wrap justify-center gap-2">
        <Toggle on={thin} onChange={setThin} label={thin ? 'מיתר דק' : 'מיתר עבה'} emoji={thin ? '〰️' : '➰'} choice />
        <Toggle on={tight} onChange={setTight} label={tight ? 'מתוח' : 'רפוי'} emoji={tight ? '📏' : '🪢'} choice />
      </div>
      <p className="text-center text-xl font-semibold" aria-live="polite">
        הצליל: {label}
      </p>
      <BigButton variant="secondary" className="w-full" onClick={pluck}>
        🎸 לפרוט
      </BigButton>
      <p className="text-center text-stone-600">נסי לפחות 3 מיתרים שונים ({Math.min(tried.length, 3)} מתוך 3)</p>
    </div>
  );
}
