import { getActivity, getWorld, SEASON_EMOJI, SEASON_NAMES, type MissionActivity, type Season } from '../content';
import type { Progress } from '../lib/progress';
import { formatDate } from '../lib/dates';
import { PhotoView } from './Photo';

/** Experiment journal: what she predicted, and the photo she took */
export function JournalList({ p }: { p: Progress }) {
  if (p.journal.length === 0) {
    return <Empty text="עוד אין ניסויים ביומן. אחרי כל ניסוי במעבדה, הוא יופיע כאן." />;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {[...p.journal].reverse().map((e) => {
        const a = getActivity(e.worldId, e.activityId);
        return (
          <li key={e.id} className="overflow-hidden rounded-2xl bg-white shadow">
            {e.photoId ? <PhotoView id={e.photoId} className="h-44 w-full" /> : <div className="flex h-24 items-center justify-center bg-orange-50 text-6xl">{a?.emoji}</div>}
            <div className="space-y-1 p-3">
              <p className="text-xl font-bold">
                {a?.emoji} {a?.title ?? e.activityId}
              </p>
              <p className="text-sm text-stone-500">{formatDate(e.at)}</p>
              {e.prediction && <p className="text-base">🤔 הניחוש: {e.prediction}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const SEASONS: Season[] = ['autumn', 'winter', 'spring', 'summer'];

/** Nature album, grouped by the season in which she found each thing */
export function AlbumBySeason({ p }: { p: Progress }) {
  if (p.album.length === 0) {
    return <Empty text="האלבום עוד ריק. צאי למשימה של בלשית הטבע, ומה שתמצאי יופיע כאן." />;
  }
  return (
    <div className="space-y-5">
      {SEASONS.map((s) => {
        const items = p.album.filter((e) => e.season === s);
        return (
          <section key={s} className="space-y-2">
            <h3 className="text-xl font-bold">
              {SEASON_EMOJI[s]} {SEASON_NAMES[s]} <span className="text-base font-normal text-stone-500">({items.length})</span>
            </h3>
            {items.length === 0 ? (
              <p className="text-stone-400">עוד לא מצאת כלום ב{SEASON_NAMES[s]}.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[...items].reverse().map((e) => {
                  const a = getActivity(e.worldId, e.activityId) as MissionActivity | undefined;
                  const labels = e.found.map((id) => a?.findOptions.find((o) => o.id === id)).filter(Boolean);
                  return (
                    <li key={e.id} className="overflow-hidden rounded-2xl bg-white shadow">
                      {e.photoId ? <PhotoView id={e.photoId} className="h-32 w-full" /> : <div className="flex h-20 items-center justify-center bg-green-50 text-5xl">{a?.emoji}</div>}
                      <div className="p-2">
                        <p className="font-bold">{a?.title ?? e.activityId}</p>
                        <p className="text-sm text-stone-500">{formatDate(e.at)}</p>
                        <p className="text-sm">{labels.map((o) => `${o!.emoji} ${o!.text}`).join(' · ')}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-white/70 p-4 text-center text-lg text-stone-500">{text}</p>;
}

export function worldName(id: string) {
  return getWorld(id)?.title ?? id;
}
