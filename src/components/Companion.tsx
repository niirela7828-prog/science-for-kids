import { SpeakButton } from './Speak';

export type Mood = 'happy' | 'think' | 'cheer';

export const COMPANION_NAME = 'זיקי';

/** Ziki – an original little round creature with a spark on its antenna and lab goggles. */
export function ZikiFace({ mood = 'happy', size = 96 }: { mood?: Mood; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" className="drop-shadow-md">
      {/* antenna + spark */}
      <path d="M60 22 Q62 12 70 8" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g className="origin-center" style={{ transformOrigin: '72px 7px' }}>
        <path d="M72 0 L75 6 L82 7 L76 11 L78 18 L72 14 L66 18 L68 11 L62 7 L69 6 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      </g>
      {/* body */}
      <ellipse cx="60" cy="70" rx="44" ry="44" fill="#fb923c" />
      <ellipse cx="60" cy="78" rx="30" ry="28" fill="#fed7aa" />
      {/* goggles on forehead */}
      <rect x="28" y="34" width="64" height="8" rx="4" fill="#0e7490" />
      <circle cx="46" cy="38" r="9" fill="#a5f3fc" stroke="#0e7490" strokeWidth="3" />
      <circle cx="74" cy="38" r="9" fill="#a5f3fc" stroke="#0e7490" strokeWidth="3" />
      {/* eyes */}
      {mood === 'cheer' ? (
        <>
          <path d="M40 62 Q46 54 52 62" stroke="#1c1917" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M68 62 Q74 54 80 62" stroke="#1c1917" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="46" cy="60" r="7" fill="#1c1917" />
          <circle cx="74" cy="60" r="7" fill="#1c1917" />
          <circle cx="48" cy="58" r="2.5" fill="#fff" />
          <circle cx="76" cy="58" r="2.5" fill="#fff" />
        </>
      )}
      {/* cheeks */}
      <circle cx="36" cy="74" r="5" fill="#f87171" opacity="0.5" />
      <circle cx="84" cy="74" r="5" fill="#f87171" opacity="0.5" />
      {/* mouth */}
      {mood === 'think' ? (
        <circle cx="64" cy="82" r="4" fill="#7c2d12" />
      ) : (
        <path d={mood === 'cheer' ? 'M46 76 Q60 96 74 76 Z' : 'M48 78 Q60 90 72 78'} stroke="#7c2d12" strokeWidth="3.5" fill={mood === 'cheer' ? '#7c2d12' : 'none'} strokeLinecap="round" />
      )}
      {/* little arms */}
      <path d="M17 78 Q8 70 12 60" stroke="#fb923c" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M103 78 Q112 70 108 60" stroke="#fb923c" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Ziki with a speech bubble. The bubble text can be read aloud. */
export function Companion({ text, mood = 'happy', size = 80 }: { text: string; mood?: Mood; size?: number }) {
  return (
    <div className="flex items-end gap-3 animate-fadein">
      <div className="shrink-0 animate-floaty">
        <ZikiFace mood={mood} size={size} />
      </div>
      <div className="relative rounded-3xl bg-white px-4 py-3 text-lg leading-relaxed shadow-md ring-2 ring-orange-200">
        <span>{text}</span> <SpeakButton text={text} small />
      </div>
    </div>
  );
}
