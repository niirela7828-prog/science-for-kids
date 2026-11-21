import { useEffect, useRef, useState } from 'react';
import { BigButton } from '../components/ui';
import { sounds } from '../lib/sound';
import { Slider, type SimProps } from './SimView';

/** With the same floor, the distance rolled after the ramp grows with the start height */
export function rollDistance(height: number): number {
  return height * 40;
}

export function RampSim({ onDone }: SimProps) {
  const [height, setHeight] = useState(2);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [marks, setMarks] = useState<{ h: number; x: number }[]>([]);
  const raf = useRef(0);
  const rampTop = 140 - height * 22;
  const rampEnd = 110;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    if (new Set(marks.map((m) => m.h)).size >= 2) onDone();
  }, [marks, onDone]);

  function go() {
    if (pos) return;
    sounds.tap();
    const dist = rollDistance(height);
    const start = performance.now();
    const downT = 0.5 + 0.15 * (5 - height);
    const floorT = 0.4 + height * 0.25;
    const step = (now: number) => {
      const t = (now - start) / 1000;
      if (t < downT) {
        const f = (t / downT) ** 2; // speeds up on the way down
        setPos({ x: 10 + f * (rampEnd - 10), y: rampTop + f * (140 - rampTop) });
      } else if (t < downT + floorT) {
        const f = (t - downT) / floorT;
        const eased = 1 - (1 - f) ** 2; // slows down on the floor
        setPos({ x: rampEnd + eased * dist, y: 140 });
      } else {
        setPos(null);
        setMarks((m) => [...m.filter((x) => x.h !== height), { h: height, x: rampEnd + dist }]);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  const car = pos ?? { x: 10, y: rampTop };
  const angle = pos && pos.y >= 140 ? 0 : (Math.atan2(140 - rampTop, rampEnd - 10) * 180) / Math.PI;
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 330 170" className="w-full rounded-2xl bg-sky-100" aria-label="מדרון ומכונית">
        <rect x="0" y="148" width="330" height="22" fill="#d6d3d1" />
        <polygon points={`0,148 ${rampEnd},148 0,${rampTop + 8}`} fill="#a16207" />
        {marks.map((m) => (
          <g key={m.h}>
            <line x1={m.x} y1="140" x2={m.x} y2="160" stroke="#7c3aed" strokeWidth="3" />
            <text x={m.x} y="168" fontSize="9" textAnchor="middle" fill="#4c1d95">
              גובה {m.h}
            </text>
          </g>
        ))}
        <text x={car.x} y={car.y} fontSize="22" textAnchor="middle" transform={`rotate(${angle} ${car.x} ${car.y}) scale(-1 1) translate(${-2 * car.x} 0)`}>
          🚗
        </text>
      </svg>
      <Slider label={`גובה המדרון: ${height}`} value={height} min={1} max={5} onChange={(v) => !pos && setHeight(v)} />
      <BigButton className="w-full" onClick={go} disabled={!!pos}>
        🏁 שחררי את המכונית
      </BigButton>
      <p className="text-center text-lg text-stone-600">הקווים הסגולים מראים עד לאן הגיעה המכונית מכל גובה.</p>
    </div>
  );
}
