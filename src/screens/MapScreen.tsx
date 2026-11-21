import { WORLDS } from '../content';
import { Companion, COMPANION_NAME } from '../components/Companion';
import { navigate } from '../lib/router';
import { useProgress } from '../lib/store';
import { isWorldComplete, worldCompletedCount } from '../lib/progress';
import { setProgress } from '../lib/store';
import { stopSpeaking, speechSupported } from '../lib/speech';

export function MapScreen() {
  const p = useProgress();
  const name = p.childName.trim();
  const greeting = `${name ? `שלום ${name}!` : 'שלום מדענית!'} אני ${COMPANION_NAME}. לאיזה עולם נטוס היום?`;
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-green-100 pb-10">
      <header className="flex items-center justify-between gap-2 p-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex gap-2">
          <NavButton label="המדבקות שלי" emoji="🌟" onClick={() => navigate({ name: 'stickers' })} />
          <NavButton label="היומן שלי" emoji="📔" onClick={() => navigate({ name: 'album' })} />
        </div>
        <div className="flex gap-2">
          {speechSupported() && (
            <NavButton
              label={p.settings.tts ? 'לכבות הקראה' : 'להדליק הקראה'}
              emoji={p.settings.tts ? '🔊' : '🔇'}
              onClick={() => {
                stopSpeaking();
                setProgress((s) => ({ ...s, settings: { ...s.settings, tts: !s.settings.tts } }));
              }}
              small
            />
          )}
          <NavButton label="אזור הורים" emoji="🔒" onClick={() => navigate({ name: 'parents' })} small />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4">
        <Companion text={greeting} size={88} />
        <div className="relative">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 500" aria-hidden="true">
            <path d="M70 40 C 20 90, 20 110, 30 140 S 80 220, 70 240 S 20 320, 30 340 S 80 420, 70 450" stroke="#fdba74" strokeWidth="2.5" strokeDasharray="5 5" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="relative space-y-5">
            {WORLDS.map((w, i) => {
              const done = worldCompletedCount(p, w);
              const total = w.activities.length;
              const complete = isWorldComplete(p, w);
              return (
                <li key={w.id} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <button
                    type="button"
                    onClick={() => navigate({ name: 'world', worldId: w.id })}
                    className="group relative flex w-[85%] max-w-sm items-center gap-4 rounded-[2rem] p-4 text-right shadow-lg ring-4 ring-white transition active:scale-95 animate-fadein"
                    style={{ background: w.colorSoft, animationDelay: `${i * 80}ms` }}
                  >
                    <span
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-5xl shadow-inner"
                      style={{ background: w.color }}
                      aria-hidden="true"
                    >
                      <span className="group-hover:animate-wiggle">{w.emoji}</span>
                    </span>
                    <span className="flex-1">
                      <span className="block text-2xl font-bold" style={{ color: w.color }}>
                        {w.title}
                      </span>
                      <span className="block text-base text-stone-600">{w.tagline}</span>
                      <span className="mt-2 block h-3 overflow-hidden rounded-full bg-white">
                        <span className="block h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: w.color }} />
                      </span>
                      <span className="text-sm text-stone-500">
                        {done} מתוך {total}
                      </span>
                    </span>
                    {complete && (
                      <span className="absolute -top-3 -left-2 text-4xl" title="קיבלת תעודה!" aria-label="עולם הושלם">
                        🏅
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </main>
    </div>
  );
}

function NavButton({ label, emoji, onClick, small = false }: { label: string; emoji: string; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-2 rounded-2xl bg-white/90 font-bold shadow ring-2 ring-white active:scale-95 ${small ? 'h-12 w-12 justify-center text-2xl' : 'min-h-[48px] px-3 text-lg'}`}
    >
      <span className="text-2xl">{emoji}</span>
      {!small && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
