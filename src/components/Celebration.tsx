import { useEffect } from 'react';
import { sounds } from '../lib/sound';
import { ZikiFace } from './Companion';
import { SpeakButton } from './Speak';
import { BigButton } from './ui';

const CONFETTI = ['🎉', '⭐', '✨', '🎊', '💫', '🌟'];

export function Celebration({
  emoji,
  sticker,
  newSticker,
  worldDone,
  onClose,
  onCertificate,
}: {
  emoji: string;
  sticker: string;
  newSticker: boolean;
  worldDone: boolean;
  onClose: () => void;
  onCertificate?: () => void;
}) {
  useEffect(() => {
    sounds.win();
  }, []);
  const text = newSticker
    ? `כל הכבוד! קיבלת מדבקה חדשה: ${sticker}`
    : 'כל הכבוד! עשית את זה שוב!';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="absolute text-3xl"
            style={{
              left: `${(i * 53) % 100}%`,
              top: '-10%',
              animation: `fall ${2 + (i % 4) * 0.5}s linear ${(i % 6) * 0.2}s infinite`,
            }}
          >
            {CONFETTI[i % CONFETTI.length]}
          </span>
        ))}
      </div>
      <div className="relative w-full max-w-md space-y-4 rounded-3xl bg-white p-6 text-center shadow-2xl animate-pop">
        <div className="flex justify-center">
          <ZikiFace mood="cheer" size={90} />
        </div>
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 text-7xl shadow-inner ring-4 ring-white">
          {emoji}
        </div>
        <p className="text-2xl font-bold">
          {text} <SpeakButton text={text} small />
        </p>
        {worldDone && (
          <p className="text-xl text-green-700">
            סיימת את כל העולם! מחכה לך תעודת מדענית 🏅
          </p>
        )}
        <div className="flex flex-col gap-3">
          {worldDone && onCertificate && (
            <BigButton variant="success" onClick={onCertificate}>
              🏅 לתעודה שלי
            </BigButton>
          )}
          <BigButton onClick={onClose}>ממשיכים ⬅</BigButton>
        </div>
      </div>
    </div>
  );
}
