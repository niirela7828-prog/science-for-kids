import { useEffect, useRef, useState } from 'react';
import type { BreathGame } from '../content';
import { sounds } from '../lib/sound';
import { DoneNote, GentleNote } from './GameView';

const MIN_INHALE_MS = 1500;

export function BreathGameView({ game, onDone }: { game: BreathGame; onDone: () => void }) {
  const [holding, setHolding] = useState(false);
  const [fill, setFill] = useState(0); // 0..1 lungs fullness
  const [cycles, setCycles] = useState(0);
  const [tooShort, setTooShort] = useState(false);
  const start = useRef(0);
  const raf = useRef(0);
  const done = cycles >= game.cycles;

  useEffect(() => {
    if (done) {
      sounds.good();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    const tick = () => {
      setFill((f) => (holding ? Math.min(1, f + 0.012) : Math.max(0, f - 0.02)));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [holding]);

  function down() {
    if (done) return;
    start.current = Date.now();
    setTooShort(false);
    setHolding(true);
  }
  function up() {
    if (!holding) return;
    setHolding(false);
    if (Date.now() - start.current >= MIN_INHALE_MS) setCycles((c) => c + 1);
    else setTooShort(true);
  }

  const scale = 0.8 + fill * 0.45;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-56 items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: `scale(${scale})`, transition: 'transform 60ms linear' }} aria-hidden="true">
          <path d="M100 20 V80" stroke="#be185d" strokeWidth="10" strokeLinecap="round" />
          <path d="M100 80 Q80 90 70 100 M100 80 Q120 90 130 100" stroke="#be185d" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M88 70 C40 60 20 120 30 170 C40 190 80 190 90 170 C95 140 95 100 88 70 Z" fill="#fb7185" />
          <path d="M112 70 C160 60 180 120 170 170 C160 190 120 190 110 170 C105 140 105 100 112 70 Z" fill="#fb7185" />
        </svg>
      </div>
      <p className="text-2xl font-bold text-rose-700" aria-live="polite">
        {done ? 'סיימנו!' : holding ? 'שואפים… 🌬️' : fill > 0.05 ? 'נושפים… 💨' : 'לחצי והחזיקי'}
      </p>
      <button
        type="button"
        disabled={done}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        onContextMenu={(e) => e.preventDefault()}
        className="h-24 w-64 select-none rounded-full bg-rose-500 text-2xl font-bold text-white shadow-[0_6px_0_#9f1239] active:translate-y-1 active:shadow-[0_2px_0_#9f1239] disabled:opacity-40"
        style={{ touchAction: 'none' }}
      >
        {holding ? 'מחזיקה…' : 'לחצי והחזיקי'}
      </button>
      <p className="text-lg">
        נשימות: {Math.min(cycles, game.cycles)} מתוך {game.cycles}
      </p>
      {tooShort && !done && <GentleNote text="נסי לשאוף קצת יותר לאט ולאורך זמן, כמו להריח פרח 🌸" />}
      {done && <DoneNote text={game.doneText} />}
    </div>
  );
}
