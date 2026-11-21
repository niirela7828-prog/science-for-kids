import { useEffect, useMemo, useState } from 'react';
import type { MemoryGame } from '../content';
import { shuffle } from '../lib/shuffle';
import { sounds } from '../lib/sound';
import { DoneNote } from './GameView';

interface Card {
  key: number;
  pair: number;
  emoji: string;
  label: string;
}

export function MemoryGameView({ game, onDone }: { game: MemoryGame; onDone: () => void }) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        game.pairs.flatMap((p, i) => [
          { key: i * 2, pair: i, ...p },
          { key: i * 2 + 1, pair: i, ...p },
        ]),
      ),
    [game],
  );
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const done = matched.length === game.pairs.length;

  useEffect(() => {
    if (done) {
      sounds.good();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function flip(c: Card) {
    if (open.length === 2 || open.includes(c.key) || matched.includes(c.pair)) return;
    sounds.tap();
    const next = [...open, c.key];
    setOpen(next);
    if (next.length === 2) {
      const [a, b] = next.map((k) => cards.find((x) => x.key === k)!);
      if (a.pair === b.pair) {
        setTimeout(() => {
          setMatched((m) => [...m, a.pair]);
          setOpen([]);
        }, 400);
      } else {
        setTimeout(() => setOpen([]), 900);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {cards.map((c) => {
          const shown = open.includes(c.key) || matched.includes(c.pair);
          return (
            <button
              key={c.key}
              type="button"
              aria-label={shown ? c.label : 'קלף הפוך'}
              onClick={() => flip(c)}
              className={`flex aspect-square items-center justify-center rounded-2xl text-4xl shadow transition ${
                shown ? 'bg-white ring-2 ring-orange-300' : 'bg-gradient-to-br from-orange-400 to-rose-400'
              } ${matched.includes(c.pair) ? 'opacity-70' : ''}`}
            >
              {shown ? <span className="animate-pop">{c.emoji}</span> : <span className="text-2xl text-white/80">?</span>}
            </button>
          );
        })}
      </div>
      {done && <DoneNote text={game.doneText} />}
    </div>
  );
}
