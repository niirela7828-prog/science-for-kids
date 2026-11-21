import type { ReactNode } from 'react';
import { navigate, type Route } from '../lib/router';
import { setProgress, useProgress } from '../lib/store';
import { stopSpeaking, speechSupported } from '../lib/speech';

export function TopBar({ title, back, color, extra }: { title: string; back?: Route; color?: string; extra?: ReactNode }) {
  const p = useProgress();
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 px-3 py-2 text-white shadow-md"
      style={{ background: color ?? '#f97316', paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      {back && (
        <button
          type="button"
          aria-label="חזרה"
          onClick={() => {
            stopSpeaking();
            navigate(back);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-2xl active:scale-90"
        >
          ➜
        </button>
      )}
      <h1 className="flex-1 truncate text-2xl font-bold">{title}</h1>
      {extra}
      {speechSupported() && (
        <button
          type="button"
          aria-label={p.settings.tts ? 'לכבות הקראה' : 'להדליק הקראה'}
          aria-pressed={p.settings.tts}
          onClick={() => {
            stopSpeaking();
            setProgress((s) => ({ ...s, settings: { ...s.settings, tts: !s.settings.tts } }));
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-2xl active:scale-90"
        >
          {p.settings.tts ? '🔊' : '🔇'}
        </button>
      )}
    </header>
  );
}
