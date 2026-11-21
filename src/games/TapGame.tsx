import { useEffect, useState } from 'react';
import type { TapGame } from '../content';
import { sounds } from '../lib/sound';
import { DoneNote } from './GameView';

export function TapGameView({ game, onDone }: { game: TapGame; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(0);
  const done = count >= game.target;
  useEffect(() => {
    if (done) {
      sounds.good();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        aria-label="הקישי"
        disabled={done}
        onClick={() => {
          sounds.tap();
          setCount((c) => c + 1);
          setBump((b) => b + 1);
        }}
        className="flex h-44 w-44 select-none items-center justify-center rounded-full bg-gradient-to-br from-white to-orange-100 text-8xl shadow-lg ring-4 ring-orange-200 active:scale-90"
      >
        <span key={bump} className="inline-block animate-pop">
          {game.emoji}
        </span>
      </button>
      <div className="h-5 w-full max-w-xs overflow-hidden rounded-full bg-stone-200">
        <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${Math.min(100, (count / game.target) * 100)}%` }} />
      </div>
      <p className="text-lg text-stone-600">
        {Math.min(count, game.target)} מתוך {game.target}
      </p>
      {done && <DoneNote text={game.doneText} />}
    </div>
  );
}
