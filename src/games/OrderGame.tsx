import { useEffect, useMemo, useState } from 'react';
import type { OrderGame } from '../content';
import { shuffleDifferent } from '../lib/shuffle';
import { sounds } from '../lib/sound';
import { DoneNote, GentleNote } from './GameView';

export function OrderGameView({ game, onDone }: { game: OrderGame; onDone: () => void }) {
  const shuffled = useMemo(() => shuffleDifferent(game.items), [game]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const done = placed.length === game.items.length;
  const expected = game.items[placed.length];

  useEffect(() => {
    if (done) {
      sounds.good();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function tap(id: string) {
    if (done || placed.includes(id)) return;
    if (id === expected.id) {
      sounds.tap();
      setPlaced((p) => [...p, id]);
      setMistakes(0);
    } else {
      sounds.soft();
      setMistakes((m) => m + 1);
      setShake(id);
      setTimeout(() => setShake(null), 500);
    }
  }

  return (
    <div className="space-y-4">
      <ol className="flex min-h-[72px] flex-wrap items-center gap-2 rounded-2xl bg-orange-50 p-3 border-2 border-dashed border-orange-300" aria-label="הסדר שלך">
        {placed.length === 0 && <li className="text-stone-400">לחצי על התחנה הראשונה…</li>}
        {placed.map((id, i) => {
          const it = game.items.find((x) => x.id === id)!;
          return (
            <li key={id} className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-lg font-semibold shadow animate-pop">
              <span className="text-stone-400">{i + 1}.</span> {it.emoji} {it.text}
            </li>
          );
        })}
      </ol>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shuffled
          .filter((it) => !placed.includes(it.id))
          .map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => tap(it.id)}
              className={`flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-white p-3 text-xl font-semibold shadow ring-2 ring-orange-200 active:scale-95 ${
                shake === it.id ? 'animate-wiggle bg-amber-50' : ''
              } ${mistakes >= 2 && it.id === expected?.id ? 'ring-4 ring-green-400' : ''}`}
            >
              <span className="text-3xl">{it.emoji}</span>
              {it.text}
            </button>
          ))}
      </div>
      {!done && mistakes === 1 && <GentleNote text="עוד לא. מה בא קודם? נסי שוב 🙂" />}
      {!done && mistakes >= 2 && <GentleNote text={`רמז: עכשיו מגיע "${expected.text}" (מסומן בירוק)`} />}
      {done && <DoneNote text={game.doneText} />}
    </div>
  );
}
