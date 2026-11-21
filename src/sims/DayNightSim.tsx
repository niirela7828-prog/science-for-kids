import { useEffect, useRef, useState } from 'react';
import { BigButton } from '../components/ui';
import type { SimProps } from './SimView';

/** Sun is on the left. The marker is in daylight when it faces the sun. angle 0 = facing the sun (noon). */
export function isDay(angleDeg: number): boolean {
  const a = ((angleDeg % 360) + 360) % 360;
  return a < 90 || a > 270;
}

export function DayNightSim({ onDone }: SimProps) {
  const [angle, setAngle] = useState(0);
  const total = useRef(0);
  const doneRef = useRef(false);

  function turn(by: number) {
    setAngle((a) => a + by);
    total.current += Math.abs(by);
    if (total.current >= 360 && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }

  // hold to keep turning
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => turn(6), 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  const day = isDay(angle);
  const rad = (angle * Math.PI) / 180;
  // marker on the globe; at angle 0 it points left toward the sun
  const mx = 200 - Math.cos(rad) * 62;
  const my = 100 - Math.sin(rad) * 62;
  const hour = Math.round((((angle % 360) + 360) % 360) / 15 + 12) % 24;

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 300 200" className="w-full rounded-2xl bg-indigo-950" aria-label={day ? 'יום בישראל' : 'לילה בישראל'}>
        <circle cx="30" cy="100" r="34" fill="#facc15" />
        <text x="30" y="150" textAnchor="middle" fill="#fde68a" fontSize="12">השמש</text>
        {[0, 1, 2].map((i) => (
          <line key={i} x1="70" y1={70 + i * 30} x2="130" y2={70 + i * 30} stroke="#fde68a" strokeWidth="2" strokeDasharray="6 6" />
        ))}
        <circle cx="200" cy="100" r="62" fill="#2563eb" />
        <path d="M200 38 A62 62 0 0 1 200 162 Z" fill="#0f172a" opacity="0.65" />
        <circle cx={mx} cy={my} r="9" fill={day ? '#facc15' : '#e2e8f0'} stroke="#fff" strokeWidth="2" />
        <text x={mx} y={my - 13} textAnchor="middle" fill="#fff" fontSize="11">ישראל</text>
      </svg>
      <p className="text-center text-2xl font-bold" aria-live="polite">
        {day ? '☀️ עכשיו יום בישראל' : '🌙 עכשיו לילה בישראל'}
        <span className="block text-base font-normal text-stone-600">בערך שעה {hour}:00</span>
      </p>
      <BigButton
        className="w-full"
        onPointerDown={() => setSpinning(true)}
        onPointerUp={() => setSpinning(false)}
        onPointerLeave={() => setSpinning(false)}
        onClick={() => turn(30)}
        style={{ touchAction: 'none' }}
      >
        🔄 סובבי את כדור הארץ
      </BigButton>
    </div>
  );
}
