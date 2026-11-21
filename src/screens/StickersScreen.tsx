import { WORLDS, activityKey } from '../content';
import { TopBar } from '../components/TopBar';
import { Companion } from '../components/Companion';
import { navigate } from '../lib/router';
import { useProgress } from '../lib/store';
import { isWorldComplete } from '../lib/progress';

export function StickersScreen() {
  const p = useProgress();
  const total = WORLDS.reduce((n, w) => n + w.activities.length, 0);
  const have = p.stickers.length;
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-50 pb-12">
      <TopBar title="🌟 המדבקות שלי" back={{ name: 'map' }} />
      <main className="mx-auto max-w-3xl space-y-6 p-4">
        <Companion text={have === 0 ? 'עוד אין מדבקות. כל פעילות שתסיימי תיתן לך מדבקה!' : `אספת ${have} מדבקות מתוך ${total}. איזה אוסף!`} mood="cheer" />
        <section className="space-y-2">
          <h2 className="text-2xl font-bold">🏅 תעודות</h2>
          <div className="flex flex-wrap gap-3">
            {WORLDS.map((w) => {
              const ok = isWorldComplete(p, w);
              return (
                <button
                  key={w.id}
                  type="button"
                  disabled={!ok}
                  onClick={() => navigate({ name: 'certificate', worldId: w.id })}
                  className={`flex min-h-[64px] items-center gap-2 rounded-2xl px-4 text-lg font-bold shadow ${ok ? 'bg-white ring-4 ring-yellow-300' : 'bg-stone-100 text-stone-400'}`}
                >
                  <span className="text-3xl">{ok ? '🏅' : '🔒'}</span>
                  {w.title}
                </button>
              );
            })}
          </div>
        </section>
        {WORLDS.map((w) => (
          <section key={w.id} className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: w.color }}>
              {w.emoji} {w.title}
            </h2>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {w.activities.map((a) => {
                const got = p.stickers.includes(activityKey(w.id, a.id));
                return (
                  <li
                    key={a.id}
                    className={`flex aspect-square flex-col items-center justify-center rounded-full text-center shadow ${got ? 'bg-white ring-4' : 'bg-stone-200/70'}`}
                    style={got ? { ['--tw-ring-color' as string]: w.color } : undefined}
                    aria-label={got ? `מדבקה: ${a.sticker}` : 'מדבקה שעוד לא נאספה'}
                  >
                    <span className={`text-4xl ${got ? '' : 'opacity-30 grayscale'}`}>{got ? a.emoji : '❔'}</span>
                    <span className="px-1 text-xs font-semibold leading-tight">{got ? a.sticker : ''}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
