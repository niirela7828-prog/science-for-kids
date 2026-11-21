import { useMemo, useState } from 'react';
import type { Question } from '../content';
import { feedbackFor, praise, tryAgain, type Feedback } from '../lib/feedback';
import { sounds } from '../lib/sound';
import { SpeakButton } from './Speak';
import { BigButton } from './ui';
import { ZikiFace } from './Companion';

/**
 * A question with gentle feedback. Calls onDone() when she is ready to move on
 * (after a right answer, or after reading the explanation).
 */
export function QuestionCard({ q, onDone }: { q: Question; onDone: () => void }) {
  const [mistakes, setMistakes] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [fb, setFb] = useState<Feedback>('none');
  const praiseText = useMemo(() => praise(), []);
  const tryText = useMemo(() => tryAgain(), []);

  const finished = fb === 'correct' || fb === 'explain';

  function choose(id: string) {
    if (finished || wrongIds.includes(id)) return;
    const ok = id === q.correct;
    const next = feedbackFor(ok, mistakes);
    setFb(next);
    if (ok) sounds.good();
    else {
      sounds.soft();
      setMistakes((m) => m + 1);
      setWrongIds((w) => [...w, id]);
    }
  }

  return (
    <div className="space-y-4" data-testid="question">
      <h3 className="text-2xl font-bold leading-snug">
        {q.text} <SpeakButton text={q.text} small />
      </h3>
      <div className="grid gap-3">
        {q.options.map((o) => {
          const isWrong = wrongIds.includes(o.id);
          const showRight = finished && o.id === q.correct;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => choose(o.id)}
              disabled={finished || isWrong}
              className={`flex min-h-[64px] items-center gap-3 rounded-2xl px-4 py-3 text-right text-xl font-semibold ring-2 transition active:scale-[0.98] ${
                showRight
                  ? 'bg-green-100 ring-green-500'
                  : isWrong
                    ? 'bg-stone-100 text-stone-400 ring-stone-200'
                    : 'bg-white ring-orange-200 hover:bg-orange-50'
              }`}
            >
              {o.emoji && <span className="text-3xl">{o.emoji}</span>}
              <span className="flex-1">{o.text}</span>
              {showRight && <span className="text-2xl">✅</span>}
            </button>
          );
        })}
      </div>

      {fb === 'hint' && (
        <Bubble mood="think" text={`${tryText} ${q.hint}`} tone="amber" />
      )}
      {fb === 'correct' && <Bubble mood="cheer" text={`${praiseText} ${q.explanation}`} tone="green" />}
      {fb === 'explain' && (
        <Bubble mood="happy" text={`זה היה קשה! הנה ההסבר: ${q.explanation}`} tone="sky" />
      )}

      {finished && (
        <BigButton variant="success" className="w-full animate-pop" onClick={onDone}>
          ממשיכים ⬅
        </BigButton>
      )}
    </div>
  );
}

function Bubble({ text, mood, tone }: { text: string; mood: 'happy' | 'think' | 'cheer'; tone: 'amber' | 'green' | 'sky' }) {
  const bg = { amber: 'bg-amber-50 ring-amber-300', green: 'bg-green-50 ring-green-400', sky: 'bg-sky-50 ring-sky-300' }[tone];
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-3 ring-2 animate-fadein ${bg}`} role="status">
      <div className="shrink-0">
        <ZikiFace mood={mood} size={56} />
      </div>
      <p className="text-lg leading-relaxed">
        {text} <SpeakButton text={text} small />
      </p>
    </div>
  );
}
