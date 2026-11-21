import { useEffect, useRef, useState } from 'react';
import type { JumpGame } from '../content';
import { sounds } from '../lib/sound';
import { BigButton } from '../components/ui';
import { DoneNote } from './GameView';

const EARTH_CM = 30; // a child's jump on Earth, roughly
const EARTH_PX = 34;
const EARTH_T = 0.6; // seconds in the air on Earth

/** Same push from the legs → height and time in the air grow by 1/gravity. */
export function jumpHeightCm(gravity: number): number {
  return Math.round(EARTH_CM / gravity);
}

export function JumpGameView({ game, onDone }: { game: JumpGame; onDone: () => void }) {
  const [t, setT] = useState<number | null>(null);
  const [jumps, setJumps] = useState(0);
  const raf = useRef(0);
  const placeT = EARTH_T / game.gravity;
  const placePx = EARTH_PX / game.gravity;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function jump() {
    if (t !== null) return;
    sounds.tap();
    const start = performance.now();
    const step = (now: number) => {
      const s = (now - start) / 1000;
      if (s >= placeT) {
        setT(null);
        setJumps((j) => {
          if (j === 0) {
            sounds.good();
            onDone();
          }
          return j + 1;
        });
        return;
      }
      setT(s);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  const y = (H: number, T: number) => {
    if (t === null || t >= T) return 0;
    const f = t / T;
    return 4 * H * f * (1 - f);
  };

  const boxH = Math.min(320, placePx + 90);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Column title="כדור הארץ" ground="#16a34a" sky="#bae6fd" height={boxH} lift={y(EARTH_PX, EARTH_T)} cm={EARTH_CM} />
        <Column title={game.placeName} ground="#a8a29e" sky="#1e1b4b" height={boxH} lift={y(placePx, placeT)} cm={jumpHeightCm(game.gravity)} dark />
      </div>
      <BigButton className="w-full" onClick={jump} disabled={t !== null}>
        🦘 קפיצה!
      </BigButton>
      {jumps > 0 && <DoneNote text={game.doneText} />}
    </div>
  );
}

function Column({ title, ground, sky, height, lift, cm, dark = false }: { title: string; ground: string; sky: string; height: number; lift: number; cm: number; dark?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl shadow ring-2 ring-white">
      <div className={`py-1 text-center text-lg font-bold ${dark ? 'bg-indigo-950 text-white' : 'bg-sky-200'}`}>{title}</div>
      <div className="relative" style={{ height, background: sky }}>
        {dark && <div className="absolute inset-0 text-xs text-white/70" aria-hidden="true">✦ &nbsp; ✧ &nbsp;&nbsp; ✦<br />&nbsp;&nbsp; ✧ &nbsp;&nbsp;&nbsp; ✦</div>}
        <div className="absolute bottom-0 h-6 w-full" style={{ background: ground }} />
        <div className="absolute left-1/2 text-5xl" style={{ bottom: 20 + lift, transform: 'translateX(-50%)' }}>
          🧑‍🚀
        </div>
      </div>
      <div className={`py-1 text-center text-base ${dark ? 'bg-indigo-950 text-white' : 'bg-green-100'}`}>בערך {cm} ס״מ</div>
    </div>
  );
}
