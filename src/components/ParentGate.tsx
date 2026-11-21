import { useState } from 'react';
import { checkAnswer, makeChallenge } from '../lib/gate';
import { BigButton } from './ui';

export function ParentGate({ onPass, title = 'כניסה להורים' }: { onPass: () => void; title?: string }) {
  const [c, setC] = useState(() => makeChallenge());
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  return (
    <form
      className="mx-auto max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center shadow-lg"
      onSubmit={(e) => {
        e.preventDefault();
        if (checkAnswer(c, value)) onPass();
        else {
          setWrong(true);
          setValue('');
          setC(makeChallenge());
        }
      }}
    >
      <div className="text-5xl">🔒</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-stone-600">כדי להיכנס, פתרו את התרגיל:</p>
      <p className="text-4xl font-black" dir="ltr" data-testid="gate-question">
        {c.text}
      </p>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        dir="ltr"
        aria-label="תשובה"
        value={value}
        onChange={(e) => {
          setValue(e.target.value.replace(/\D/g, ''));
          setWrong(false);
        }}
        className="w-full rounded-2xl border-2 border-stone-300 p-3 text-center text-3xl"
      />
      {wrong && <p className="text-amber-700">לא נכון, נסו את התרגיל החדש.</p>}
      <BigButton type="submit" className="w-full">
        כניסה
      </BigButton>
    </form>
  );
}
