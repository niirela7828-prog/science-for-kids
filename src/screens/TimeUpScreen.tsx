import { useMemo, useState } from 'react';
import { Companion } from '../components/Companion';
import { ParentGate } from '../components/ParentGate';
import { BigButton, Card } from '../components/ui';
import { Say } from '../components/Speak';
import { setProgress } from '../lib/store';
import { grantExtraTime } from '../lib/progress';
import { shuffle } from '../lib/shuffle';

const IDEAS = [
  'צאי לחפש עלה עם קצוות משוננים 🍃',
  'ספרי כמה ציפורים את רואה מהחלון 🐦',
  'בדקי באמבטיה אילו צעצועים צפים ואילו שוקעים 🛁',
  'שימי יד על הלב, קפצי 20 קפיצות, והרגישי איך הוא פועם ❤️',
  'הסתכלי על העננים ומצאי ענן בצורה של חיה ☁️',
  'בדקי את הצל שלך: הוא ארוך או קצר עכשיו? 👤',
  'ציירי את כוכב הלכת שהכי אהבת 🪐',
  'ספרי למישהו בבית עובדה מדעית שלמדת היום 🗣️',
];

export function TimeUpScreen() {
  const [gate, setGate] = useState(false);
  const ideas = useMemo(() => shuffle(IDEAS).slice(0, 3), []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-sky-100 p-4">
      <main className="mx-auto max-w-xl space-y-5 pt-6">
        <Companion text="זמן המסך להיום נגמר! עכשיו הזמן הכי טוב לחקור בעולם האמיתי. נתראה מחר!" mood="cheer" size={96} />
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold">רעיונות למדענית בלי מסך:</h2>
          {ideas.map((t) => (
            <Say key={t} text={`• ${t}`} className="text-lg" />
          ))}
        </Card>
        {gate ? (
          <ParentGate
            title="עוד זמן? (להורים)"
            onPass={() => setProgress((p) => grantExtraTime(p, 10))}
          />
        ) : (
          <BigButton variant="ghost" className="w-full text-base" onClick={() => setGate(true)}>
            🔒 הורים: עוד 10 דקות
          </BigButton>
        )}
      </main>
    </div>
  );
}
