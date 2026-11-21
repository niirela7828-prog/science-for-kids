import { getWorld, activityKey } from '../content';
import { TopBar } from '../components/TopBar';
import { ZikiFace, COMPANION_NAME } from '../components/Companion';
import { BigButton } from '../components/ui';
import { SpeakButton } from '../components/Speak';
import { useProgress } from '../lib/store';
import { isWorldComplete } from '../lib/progress';
import { formatDate } from '../lib/dates';
import { NotFound } from './NotFound';

export function CertificateScreen({ worldId }: { worldId: string }) {
  const p = useProgress();
  const world = getWorld(worldId);
  if (!world) return <NotFound />;
  const ok = isWorldComplete(p, world);
  const name = p.childName.trim() || 'מדענית צעירה';
  const date = Math.max(0, ...world.activities.map((a) => p.completed[activityKey(world.id, a.id)] ?? 0));
  const text = `תעודת מדענית. ${name} סיימה בהצלחה את כל הפעילויות בעולם ${world.title}. כל הכבוד!`;
  return (
    <div className="min-h-screen bg-orange-50 pb-12">
      <div className="print:hidden">
        <TopBar title="🏅 תעודה" back={{ name: 'world', worldId }} color={world.color} />
      </div>
      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {!ok ? (
          <p className="rounded-2xl bg-white p-6 text-center text-xl">
            התעודה תחכה לך כאן אחרי שתסיימי את כל הפעילויות ב{world.title}! 💪
          </p>
        ) : (
          <>
            <div
              className="relative space-y-4 rounded-[2rem] bg-white p-8 text-center shadow-xl animate-pop"
              style={{ border: `10px double ${world.color}` }}
              data-testid="certificate"
            >
              <div className="text-6xl">🏅</div>
              <h2 className="text-4xl font-black" style={{ color: world.color }}>
                תעודת מדענית
              </h2>
              <p className="text-xl">מוענקת בגאווה ל</p>
              <p className="text-4xl font-bold">{name}</p>
              <p className="text-xl">
                שסיימה בהצלחה את כל הפעילויות בעולם
                <br />
                <b className="text-2xl">
                  {world.emoji} {world.title}
                </b>
              </p>
              <p className="text-lg">סקרנות, התמדה ומחשבה של מדענית אמיתית!</p>
              <div className="flex items-end justify-between pt-4">
                <span className="text-base text-stone-500">{date ? formatDate(date) : ''}</span>
                <span className="flex flex-col items-center text-base text-stone-500">
                  <ZikiFace mood="cheer" size={60} />
                  {COMPANION_NAME}, עוזר המעבדה
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-3 print:hidden">
              <SpeakButton text={text} />
              <BigButton variant="secondary" onClick={() => window.print()}>
                🖨️ להדפיס
              </BigButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
