import { useEffect, useState } from 'react';
import { useProgress } from '../lib/store';
import { speak, speechSupported, stopSpeaking } from '../lib/speech';

/** 🔊 button that reads the text in Hebrew. Hidden when reading-aloud is turned off. */
export function SpeakButton({ text, small = false, label = 'הקראה' }: { text: string; small?: boolean; label?: string }) {
  const p = useProgress();
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => stopSpeaking(), []);
  if (!p.settings.tts || !speechSupported()) return null;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        if (speaking) {
          stopSpeaking();
          setSpeaking(false);
          return;
        }
        setSpeaking(true);
        speak(text, () => setSpeaking(false));
      }}
      className={`inline-flex items-center justify-center rounded-full bg-sky-100 align-middle text-sky-700 ring-1 ring-sky-300 transition active:scale-90 ${
        small ? 'h-9 w-9 text-lg' : 'h-12 w-12 text-2xl'
      } ${speaking ? 'animate-pulse bg-sky-200' : ''}`}
    >
      {speaking ? '⏹️' : '🔊'}
    </button>
  );
}

/** A paragraph with a read-aloud button next to it */
export function Say({ text, className = '' }: { text: string; className?: string }) {
  return (
    <p className={`text-xl leading-relaxed ${className}`}>
      {text} <SpeakButton text={text} small />
    </p>
  );
}
