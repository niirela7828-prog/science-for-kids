import { useEffect, useState } from 'react';
import { WORLDS, getActivity } from '../content';
import { TopBar } from '../components/TopBar';
import { ParentGate } from '../components/ParentGate';
import { BigButton, Card } from '../components/ui';
import { AlbumBySeason, JournalList } from '../components/Records';
import { setProgress, useProgress } from '../lib/store';
import {
  grantExtraTime,
  limitSeconds,
  resetProgress,
  usageToday,
  worldCompletedCount,
  type LogEntry,
} from '../lib/progress';
import { clearPhotos, countPhotos } from '../lib/photos';
import { formatDateTime } from '../lib/dates';
import { hasHebrewVoice, speechSupported } from '../lib/speech';

// The gate is passed once per app session (kept in memory only).
let unlockedThisSession = false;

export function ParentsScreen() {
  const [ok, setOk] = useState(unlockedThisSession);
  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      <TopBar title="🔒 אזור הורים" back={{ name: 'map' }} color="#57534e" />
      <main className="mx-auto max-w-3xl space-y-5 p-4">
        {ok ? (
          <Dashboard />
        ) : (
          <ParentGate
            onPass={() => {
              unlockedThisSession = true;
              setOk(true);
            }}
          />
        )}
      </main>
    </div>
  );
}

export function lockParents() {
  unlockedThisSession = false;
}

const LIMITS = [0, 10, 15, 20, 30, 45, 60];

function Dashboard() {
  const p = useProgress();
  const [photos, setPhotos] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(0);
  const [tab, setTab] = useState<'journal' | 'album'>('journal');
  const [voiceOk, setVoiceOk] = useState(hasHebrewVoice());

  useEffect(() => {
    countPhotos().then(setPhotos).catch(() => setPhotos(null));
    const t = setTimeout(() => setVoiceOk(hasHebrewVoice()), 800); // voices load late on some devices
    return () => clearTimeout(t);
  }, [p.journal.length, p.album.length]);

  const usedMin = Math.floor(usageToday(p) / 60);
  const lim = limitSeconds(p);
  const totalDone = Object.keys(p.completed).length;
  const totalAll = WORLDS.reduce((n, w) => n + w.activities.length, 0);

  return (
    <>
      <Card className="space-y-3">
        <h2 className="text-2xl font-bold">👧 פרטים</h2>
        <label className="block space-y-1">
          <span className="font-semibold">שם הילדה (מופיע בברכה ובתעודות)</span>
          <input
            value={p.childName}
            maxLength={30}
            onChange={(e) => setProgress((s) => ({ ...s, childName: e.target.value }))}
            className="w-full rounded-xl border-2 border-stone-300 p-3 text-xl"
            placeholder="למשל: נועה"
          />
        </label>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold">📊 התקדמות</h2>
        <p className="text-lg">
          הושלמו {totalDone} מתוך {totalAll} פעילויות · {p.stickers.length} מדבקות · {p.journal.length} ניסויים ביומן · {p.album.length} ממצאים באלבום
        </p>
        <ul className="space-y-2">
          {WORLDS.map((w) => {
            const d = worldCompletedCount(p, w);
            return (
              <li key={w.id}>
                <div className="flex justify-between text-lg">
                  <span>
                    {w.emoji} {w.title}
                  </span>
                  <span>
                    {d} מתוך {w.activities.length}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                  <div className="h-full rounded-full" style={{ width: `${(d / w.activities.length) * 100}%`, background: w.color }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold">🕒 מה היא עשתה לאחרונה</h2>
        <ActivityLog log={p.log} />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold">📔 יומן ואלבום</h2>
        <div className="grid grid-cols-2 gap-2">
          <BigButton variant={tab === 'journal' ? 'primary' : 'secondary'} onClick={() => setTab('journal')}>
            יומן ניסויים
          </BigButton>
          <BigButton variant={tab === 'album' ? 'primary' : 'secondary'} onClick={() => setTab('album')}>
            אלבום טבע
          </BigButton>
        </div>
        {tab === 'journal' ? <JournalList p={p} /> : <AlbumBySeason p={p} />}
        {photos !== null && <p className="text-sm text-stone-500">שמורות במכשיר {photos} תמונות.</p>}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-2xl font-bold">⏱️ זמן מסך יומי</h2>
        <p className="text-lg">
          היום: {usedMin} דקות{Number.isFinite(lim) ? ` מתוך ${Math.round(lim / 60)}` : ' (ללא הגבלה)'}
        </p>
        <div className="flex flex-wrap gap-2">
          {LIMITS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={p.settings.dailyLimitMin === m}
              onClick={() => setProgress((s) => ({ ...s, settings: { ...s.settings, dailyLimitMin: m } }))}
              className={`min-h-[48px] rounded-xl px-4 text-lg font-bold ring-2 ${p.settings.dailyLimitMin === m ? 'bg-orange-500 text-white ring-orange-500' : 'bg-white ring-stone-300'}`}
            >
              {m === 0 ? 'ללא הגבלה' : `${m} דק׳`}
            </button>
          ))}
        </div>
        <BigButton variant="secondary" onClick={() => setProgress((s) => grantExtraTime(s, 10))}>
          ➕ עוד 10 דקות להיום
        </BigButton>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold">⚙️ הגדרות</h2>
        <SettingRow
          label="🔊 כפתורי הקראה בעברית"
          on={p.settings.tts}
          onChange={(v) => setProgress((s) => ({ ...s, settings: { ...s.settings, tts: v } }))}
        />
        {!speechSupported() ? (
          <p className="text-sm text-amber-700">הדפדפן הזה לא תומך בהקראה.</p>
        ) : !voiceOk ? (
          <p className="text-sm text-amber-700">
            לא נמצא קול בעברית במכשיר. אפשר להתקין: באנדרואיד – הגדרות ← נגישות ← המרת טקסט לדיבור ← שפה עברית. באייפד/אייפון – הגדרות ← נגישות ← תוכן מוקרא ← קולות ← עברית.
          </p>
        ) : (
          <p className="text-sm text-green-700">נמצא קול בעברית במכשיר ✔</p>
        )}
        <SettingRow
          label="🎵 צלילים"
          on={p.settings.sound}
          onChange={(v) => setProgress((s) => ({ ...s, settings: { ...s.settings, sound: v } }))}
        />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-2xl font-bold">🔐 פרטיות</h2>
        <p className="text-lg leading-relaxed">
          כל המידע והתמונות נשמרים רק במכשיר הזה. אין שרת, אין חשבון, אין פרסומות ואין קישורים החוצה. האפליקציה חסומה טכנית מלשלוח מידע לאינטרנט.
          שימו לב: מחיקת נתוני הדפדפן תמחק גם את ההתקדמות והתמונות.
        </p>
      </Card>

      <Card className="space-y-3 ring-2 ring-red-200">
        <h2 className="text-2xl font-bold text-red-700">🗑️ איפוס התקדמות</h2>
        <p>מוחק מדבקות, תעודות, יומן, אלבום ותמונות. השם וההגדרות נשמרים.</p>
        {confirmReset === 0 && (
          <BigButton variant="secondary" onClick={() => setConfirmReset(1)}>
            איפוס…
          </BigButton>
        )}
        {confirmReset === 1 && (
          <div className="space-y-2 rounded-2xl bg-red-50 p-3">
            <p className="font-bold text-red-800">בטוחים? אי אפשר לבטל את זה.</p>
            <div className="flex gap-2">
              <BigButton
                className="bg-red-600 shadow-[0_5px_0_#991b1b]"
                onClick={async () => {
                  setProgress((s) => resetProgress(s));
                  await clearPhotos().catch(() => {});
                  setPhotos(0);
                  setConfirmReset(2);
                }}
              >
                כן, למחוק הכול
              </BigButton>
              <BigButton variant="secondary" onClick={() => setConfirmReset(0)}>
                ביטול
              </BigButton>
            </div>
          </div>
        )}
        {confirmReset === 2 && <p className="font-bold text-green-700">ההתקדמות אופסה.</p>}
      </Card>
    </>
  );
}

function SettingRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex min-h-[56px] w-full items-center justify-between rounded-xl bg-stone-50 px-4 text-lg"
    >
      <span>{label}</span>
      <span className={`flex h-8 w-14 items-center rounded-full p-1 transition ${on ? 'justify-start bg-green-500' : 'justify-end bg-stone-300'}`}>
        <span className="h-6 w-6 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

function ActivityLog({ log }: { log: LogEntry[] }) {
  const recent = log.filter((l) => l.type === 'complete').slice(-30).reverse();
  if (recent.length === 0) return <p className="text-stone-500">עוד אין פעילות.</p>;
  return (
    <ul className="max-h-80 divide-y overflow-y-auto">
      {recent.map((l, i) => {
        const [w, a] = l.key.split('/');
        const act = getActivity(w, a);
        const world = WORLDS.find((x) => x.id === w);
        return (
          <li key={i} className="flex items-center justify-between gap-2 py-2">
            <span>
              {act?.emoji} {act?.title ?? a} <span className="text-sm text-stone-500">· {world?.title}</span>
            </span>
            <span className="shrink-0 text-sm text-stone-500" dir="ltr">
              {formatDateTime(l.at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
