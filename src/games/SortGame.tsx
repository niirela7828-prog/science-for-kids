import { useEffect, useMemo, useState } from 'react';
import type { SortGame } from '../content';
import { shuffle } from '../lib/shuffle';
import { sounds } from '../lib/sound';
import { DoneNote, GentleNote } from './GameView';

export function SortGameView({ game, onDone }: { game: SortGame; onDone: () => void }) {
  const order = useMemo(() => shuffle(game.items), [game]);
  const [idx, setIdx] = useState(0);
  const [sorted, setSorted] = useState<Record<string, string[]>>({});
  const [wrong, setWrong] = useState(false);
  const done = idx >= order.length;
  const item = order[idx];

  useEffect(() => {
    if (done) {
      sounds.good();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function drop(binId: string) {
    if (done) return;
    if (binId === item.bin) {
      sounds.tap();
      setSorted((s) => ({ ...s, [binId]: [...(s[binId] ?? []), item.emoji] }));
      setIdx((i) => i + 1);
      setWrong(false);
    } else {
      sounds.soft();
      setWrong(true);
    }
  }

  return (
    <div className="space-y-4">
      {!done && (
        <div key={item.id} className="mx-auto flex w-fit items-center gap-3 rounded-3xl bg-white px-6 py-4 text-2xl font-bold shadow-lg ring-2 ring-orange-200 animate-pop">
          <span className="text-5xl">{item.emoji}</span>
          {item.text}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {game.bins.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => drop(b.id)}
            disabled={done}
            className="flex min-h-[140px] flex-col items-center gap-2 rounded-3xl bg-orange-50 p-3 ring-2 ring-orange-200 active:scale-95"
          >
            <span className="text-4xl">{b.emoji}</span>
            <span className="text-xl font-bold">{b.text}</span>
            <span className="flex flex-wrap justify-center gap-1 text-2xl">{(sorted[b.id] ?? []).map((e, i) => <span key={i}>{e}</span>)}</span>
          </button>
        ))}
      </div>
      {wrong && !done && <GentleNote text="הממ, כדאי לחשוב שוב. נסי את הסל השני 🙂" />}
      {done && <DoneNote text={game.doneText} />}
    </div>
  );
}
