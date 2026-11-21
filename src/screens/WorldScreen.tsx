import { getWorld } from '../content';
import { Companion } from '../components/Companion';
import { TopBar } from '../components/TopBar';
import { BigButton } from '../components/ui';
import { navigate } from '../lib/router';
import { useProgress } from '../lib/store';
import { isCompleted, isUnlocked, isWorldComplete, worldCompletedCount } from '../lib/progress';
import { NotFound } from './NotFound';

export function WorldScreen({ worldId }: { worldId: string }) {
  const p = useProgress();
  const world = getWorld(worldId);
  if (!world) return <NotFound />;
  const done = worldCompletedCount(p, world);
  const complete = isWorldComplete(p, world);
  return (
    <div className="min-h-screen pb-12" style={{ background: `linear-gradient(${world.colorSoft}, #fffaf3)` }}>
      <TopBar title={`${world.emoji} ${world.title}`} back={{ name: 'map' }} color={world.color} />
      <main className="mx-auto max-w-3xl space-y-5 p-4">
        <Companion text={world.welcome} />
        <p className="text-center text-lg font-semibold text-stone-600">
          השלמת {done} מתוך {world.activities.length}
        </p>
        {complete && (
          <BigButton variant="success" className="w-full" onClick={() => navigate({ name: 'certificate', worldId })}>
            🏅 תעודת המדענית שלי
          </BigButton>
        )}
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {world.activities.map((a, i) => {
            const unlocked = isUnlocked(p, world, a.id);
            const completed = isCompleted(p, world.id, a.id);
            const adult = a.kind === 'experiment' && a.adult;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => navigate({ name: 'activity', worldId, activityId: a.id })}
                  aria-label={`${a.title}${completed ? ' (הושלם)' : ''}${!unlocked ? ' (נעול)' : ''}${adult ? ' (צריך מבוגר)' : ''}`}
                  className={`relative flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-3xl p-3 text-center shadow-md ring-4 transition active:scale-95 animate-fadein ${
                    unlocked ? 'bg-white ring-white' : 'bg-stone-200 ring-stone-100 opacity-70'
                  }`}
                  style={{ animationDelay: `${i * 40}ms`, ...(completed ? { boxShadow: `0 0 0 4px ${world.color}` } : {}) }}
                >
                  {world.sequential && <span className="absolute right-3 top-2 text-sm font-bold text-stone-400">{i + 1}</span>}
                  <span className="text-5xl">{unlocked ? a.emoji : '🔒'}</span>
                  <span className="text-lg font-bold leading-tight">{a.title}</span>
                  {completed && <span className="absolute -top-2 -left-2 text-3xl">⭐</span>}
                  {adult && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-700 ring-1 ring-red-300">
                      🧑‍🔬 עם מבוגר
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
