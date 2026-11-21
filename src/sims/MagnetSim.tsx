import { useEffect, useState } from 'react';
import { sounds } from '../lib/sound';
import type { SimProps } from './SimView';

export const MAGNET_ITEMS = [
  { id: 'clip', text: 'מהדק ברזל', emoji: '📎', magnetic: true },
  { id: 'nail', text: 'מסמר', emoji: '🔩', magnetic: true },
  { id: 'can', text: 'פחית אלומיניום', emoji: '🥫', magnetic: false },
  { id: 'pencil', text: 'עיפרון', emoji: '✏️', magnetic: false },
  { id: 'spoon', text: 'כפית פלסטיק', emoji: '🥄', magnetic: false },
  { id: 'cork', text: 'פקק שעם', emoji: '🍾', magnetic: false },
  { id: 'pin', text: 'סיכה מברזל', emoji: '📌', magnetic: true },
  { id: 'paper', text: 'דף נייר', emoji: '📄', magnetic: false },
];

export function MagnetSim({ onDone }: SimProps) {
  const [tested, setTested] = useState<string[]>([]);
  const [last, setLast] = useState<{ id: string; ok: boolean } | null>(null);
  const stuck = MAGNET_ITEMS.filter((i) => i.magnetic && tested.includes(i.id));

  useEffect(() => {
    if (tested.length === MAGNET_ITEMS.length) onDone();
  }, [tested, onDone]);

  function test(id: string) {
    const item = MAGNET_ITEMS.find((i) => i.id === id)!;
    if (item.magnetic) sounds.good();
    else sounds.soft();
    setLast({ id, ok: item.magnetic });
    setTested((t) => (t.includes(id) ? t : [...t, id]));
  }

  const lastItem = last && MAGNET_ITEMS.find((i) => i.id === last.id);
  return (
    <div className="space-y-4">
      <div className="flex min-h-[120px] items-center justify-center gap-1 rounded-2xl bg-violet-50 p-3">
        <span className="text-6xl" aria-hidden="true">🧲</span>
        <div className="flex flex-wrap gap-1 text-4xl">
          {stuck.map((i) => (
            <span key={i.id} className="animate-pop" title={i.text}>
              {i.emoji}
            </span>
          ))}
        </div>
      </div>
      {lastItem && (
        <p key={last!.id + tested.length} className="text-center text-xl font-semibold animate-fadein" aria-live="polite">
          {last!.ok ? `${lastItem.text}: נדבק למגנט! 🧲` : `${lastItem.text}: לא נמשך למגנט.`}
        </p>
      )}
      <p className="text-center text-lg text-stone-600">לחצי על חפץ כדי לקרב אותו למגנט ({tested.length} מתוך {MAGNET_ITEMS.length})</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MAGNET_ITEMS.map((i) => {
          const done = tested.includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => test(i.id)}
              className={`flex min-h-[90px] flex-col items-center justify-center rounded-2xl p-2 text-lg font-semibold shadow ring-2 active:scale-95 ${
                done ? (i.magnetic ? 'bg-green-50 ring-green-400' : 'bg-stone-100 ring-stone-300') : 'bg-white ring-violet-200'
              }`}
            >
              <span className="text-4xl">{i.emoji}</span>
              {i.text}
              {done && <span className="text-sm">{i.magnetic ? 'נמשך ✔' : 'לא נמשך'}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
