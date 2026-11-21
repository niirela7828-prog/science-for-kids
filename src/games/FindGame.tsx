import { useEffect, useMemo, useState } from 'react';
import type { FindGame } from '../content';
import { shuffle } from '../lib/shuffle';
import { sounds } from '../lib/sound';
import { DoneNote, GentleNote } from './GameView';

export function FindGameView({ game, onDone }: { game: FindGame; onDone: () => void }) {
  const items = useMemo(() => shuffle(game.items), [game]);
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const total = game.items.filter((i) => i.correct).length;
  const done = found.length === total;

  useEffect(() => {
    if (done) {
      sounds.good();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function tap(id: string, correct: boolean) {
    if (done || found.includes(id)) return;
    if (correct) {
      sounds.tap();
      setFound((f) => [...f, id]);
      setMiss(null);
    } else {
      sounds.soft();
      setMiss(id);
    }
  }

  const missed = items.find((i) => i.id === miss);
  return (
    <div className="space-y-4">
      <p className="text-center text-lg text-stone-600">
        מצאת {found.length} מתוך {total}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => {
          const ok = found.includes(it.id);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => tap(it.id, it.correct)}
              className={`flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-2xl p-2 text-lg font-semibold shadow ring-2 transition active:scale-95 ${
                ok ? 'bg-green-100 ring-green-500' : miss === it.id ? 'bg-amber-50 ring-amber-300 animate-wiggle' : 'bg-white ring-orange-200'
              }`}
            >
              <span className="text-4xl">{it.emoji}</span>
              <span className="text-center leading-tight">{it.text}</span>
              {ok && <span>✅</span>}
            </button>
          );
        })}
      </div>
      {missed && !done && <GentleNote text={`"${missed.text}" לא מתאים הפעם. נסי לחפש עוד 🙂`} />}
      {done && <DoneNote text={game.doneText} />}
    </div>
  );
}
