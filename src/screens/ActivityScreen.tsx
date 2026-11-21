import { useEffect, useState, type ReactNode } from 'react';
import { getActivity, getWorld, type Activity, type World } from '../content';
import type {
  ExperimentActivity,
  MissionActivity,
  OrganActivity,
  PlaceActivity,
  SimActivity,
} from '../content/types';
import { TopBar } from '../components/TopBar';
import { BigButton, Card, ProgressDots } from '../components/ui';
import { Companion } from '../components/Companion';
import { Say, SpeakButton } from '../components/Speak';
import { QuestionCard } from '../components/QuestionCard';
import { PhotoCapture } from '../components/Photo';
import { Celebration } from '../components/Celebration';
import { GameView } from '../games/GameView';
import { SimView } from '../sims/SimView';
import { navigate } from '../lib/router';
import { getProgress, setProgress } from '../lib/store';
import { addAlbum, addJournal, completeActivity, isUnlocked, logStart } from '../lib/progress';
import { stopSpeaking } from '../lib/speech';
import { NotFound } from './NotFound';

export function ActivityScreen({ worldId, activityId }: { worldId: string; activityId: string }) {
  const world = getWorld(worldId);
  const activity = getActivity(worldId, activityId);
  const [celebrate, setCelebrate] = useState<{ newSticker: boolean; worldDone: boolean } | null>(null);

  useEffect(() => {
    if (world && activity) setProgress((p) => logStart(p, worldId, activityId));
    return () => stopSpeaking();
  }, [worldId, activityId, world, activity]);

  if (!world || !activity) return <NotFound />;
  if (!isUnlocked(getProgress(), world, activity.id)) {
    return (
      <div className="min-h-screen">
        <TopBar title={activity.title} back={{ name: 'world', worldId }} color={world.color} />
        <main className="mx-auto max-w-2xl p-4">
          <Companion text="התחנה הזאת עוד נעולה. קודם נסיים את התחנה שלפניה!" mood="think" />
        </main>
      </div>
    );
  }

  function finish(extra?: (p: ReturnType<typeof getProgress>) => ReturnType<typeof getProgress>) {
    let result = { newSticker: false, worldDone: false };
    setProgress((p) => {
      const withExtra = extra ? extra(p) : p;
      const r = completeActivity(withExtra, worldId, activityId);
      result = { newSticker: r.newSticker, worldDone: r.worldJustCompleted };
      return r.progress;
    });
    setCelebrate(result);
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: `linear-gradient(${world.colorSoft}, #fffaf3 40%)` }}>
      <TopBar title={`${activity.emoji} ${activity.title}`} back={{ name: 'world', worldId }} color={world.color} />
      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <ActivityBody world={world} activity={activity} finish={finish} />
      </main>
      {celebrate && (
        <Celebration
          emoji={activity.emoji}
          sticker={activity.sticker}
          newSticker={celebrate.newSticker}
          worldDone={celebrate.worldDone}
          onClose={() => navigate({ name: 'world', worldId })}
          onCertificate={() => navigate({ name: 'certificate', worldId })}
        />
      )}
    </div>
  );
}

type Finish = (extra?: (p: ReturnType<typeof getProgress>) => ReturnType<typeof getProgress>) => void;

function ActivityBody({ world, activity, finish }: { world: World; activity: Activity; finish: Finish }) {
  switch (activity.kind) {
    case 'experiment':
      return <ExperimentFlow world={world} a={activity} finish={finish} />;
    case 'organ':
      return <OrganFlow a={activity} finish={finish} />;
    case 'mission':
      return <MissionFlow world={world} a={activity} finish={finish} />;
    case 'sim':
      return <SimFlow a={activity} finish={finish} />;
    case 'place':
      return <PlaceFlow a={activity} finish={finish} />;
  }
}

// ---------- generic step-by-step frame ----------

interface Step {
  content: ReactNode;
  canNext?: boolean;
  nextLabel?: string;
  /** called instead of moving forward (last step) */
  onNext?: () => void;
  hideNext?: boolean;
}

/** Wraps a question so the step's own "next" is replaced by the question's "continue" */
function questionStep(q: Activity['question'], onAnswered: () => void): Step {
  return { content: <QuestionCard q={q} onDone={onAnswered} />, hideNext: true };
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-bold">{children}</h2>;
}

// ---------- 🧪 experiment ----------

function AdultBanner({ note }: { note?: string }) {
  const text = `צריך מבוגר! ${note ?? 'את הניסוי הזה עושים רק יחד עם מבוגר.'}`;
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-lg font-semibold text-red-800 ring-4 ring-red-300" role="alert">
      <span className="text-4xl" aria-hidden="true">🧑‍🔬</span>
      <p>
        {text} <SpeakButton text={text} small />
      </p>
    </div>
  );
}

function ExperimentFlow({ world, a, finish }: { world: World; a: ExperimentActivity; finish: Finish }) {
  const [checked, setChecked] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [photoId, setPhotoId] = useState<string | undefined>();
  const [step, setStep] = useState(0);
  const predText = a.predict.options.find((o) => o.id === prediction)?.text;
  const allStepsSeen = stepIdx >= a.steps.length - 1;

  const done = () =>
    finish((p) =>
      addJournal(p, { worldId: world.id, activityId: a.id, at: Date.now(), prediction: predText, photoId }),
    );

  const steps: Step[] = [
    {
      content: (
        <>
          {a.adult && <AdultBanner note={a.adultNote} />}
          {!a.adult && a.adultNote && (
            <div className="rounded-2xl bg-amber-50 p-3 text-lg ring-2 ring-amber-200">
              💡 {a.adultNote} <SpeakButton text={a.adultNote} small />
            </div>
          )}
          <Companion text={a.intro} />
        </>
      ),
      nextLabel: 'מתחילים! ⬅',
    },
    {
      content: (
        <Card className="space-y-3">
          <SectionTitle>מה צריך? <SpeakButton text={`מה צריך? ${a.materials.map((m) => m.text).join(', ')}`} small /></SectionTitle>
          <p className="text-stone-600">סמני כל דבר שהבאת:</p>
          <div className="grid gap-2">
            {a.materials.map((m) => {
              const on = checked.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChecked((c) => (on ? c.filter((x) => x !== m.id) : [...c, m.id]))}
                  className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-4 text-right text-xl ring-2 ${on ? 'bg-green-50 ring-green-400' : 'bg-white ring-stone-200'}`}
                >
                  <span className="text-2xl">{on ? '✅' : '⬜'}</span>
                  <span className="text-2xl">{m.emoji}</span>
                  <span>{m.text}</span>
                </button>
              );
            })}
          </div>
        </Card>
      ),
      nextLabel: checked.length === a.materials.length ? 'הכול מוכן! ⬅' : 'הלאה ⬅',
    },
    {
      content: (
        <Card className="space-y-3">
          <SectionTitle>🤔 {a.predict.text} <SpeakButton text={a.predict.text} small /></SectionTitle>
          <p className="text-stone-600">אין תשובה לא נכונה. מדענים תמיד מנחשים לפני שבודקים!</p>
          <div className="grid gap-2">
            {a.predict.options.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={prediction === o.id}
                onClick={() => setPrediction(o.id)}
                className={`flex min-h-[60px] items-center gap-3 rounded-2xl px-4 text-right text-xl font-semibold ring-2 ${prediction === o.id ? 'bg-violet-100 ring-violet-500' : 'bg-white ring-stone-200'}`}
              >
                <span className="text-3xl">{o.emoji}</span> {o.text}
              </button>
            ))}
          </div>
        </Card>
      ),
      canNext: prediction !== null,
    },
    {
      content: (
        <Card className="space-y-4">
          {a.adult && <AdultBanner note={a.adultNote} />}
          <SectionTitle>
            שלב {stepIdx + 1} מתוך {a.steps.length}
          </SectionTitle>
          <div key={stepIdx} className="space-y-3 text-center animate-fadein">
            <div className="text-6xl tracking-widest" aria-hidden="true">{a.steps[stepIdx].emoji}</div>
            <Say text={a.steps[stepIdx].text} className="text-2xl" />
          </div>
          <div className="flex justify-center gap-3">
            {stepIdx > 0 && (
              <BigButton variant="secondary" onClick={() => setStepIdx(stepIdx - 1)}>
                שלב קודם
              </BigButton>
            )}
            {!allStepsSeen && (
              <BigButton variant="success" onClick={() => setStepIdx(stepIdx + 1)}>
                עשיתי! ✔
              </BigButton>
            )}
          </div>
        </Card>
      ),
      canNext: allStepsSeen,
      nextLabel: 'סיימתי את הניסוי ⬅',
    },
    {
      content: (
        <Card className="space-y-3">
          <SectionTitle>👀 מה קרה?</SectionTitle>
          <Say text={a.result} />
          {predText && (
            <p className="rounded-2xl bg-violet-50 p-3 text-lg">
              הניחוש שלך היה: <b>{predText}</b>. מה שקרה באמת הוא מה שחשוב. ככה מדענים לומדים!
            </p>
          )}
        </Card>
      ),
    },
    {
      content: (
        <Card className="space-y-3">
          <SectionTitle>💡 למה זה קרה?</SectionTitle>
          <Say text={a.why} />
        </Card>
      ),
    },
    questionStep(a.question, () => setStep((s) => s + 1)),
    {
      content: (
        <Card className="space-y-4 text-center">
          <SectionTitle>📔 ליומן הניסויים</SectionTitle>
          <Say text="רוצה לצלם את התוצאה? התמונה נשמרת רק במכשיר הזה." />
          <PhotoCapture photoId={photoId} onSaved={setPhotoId} />
        </Card>
      ),
      onNext: done,
      nextLabel: photoId ? 'שומרים ביומן! ⬅' : 'סיום בלי תמונה ⬅',
    },
  ];
  return <ControlledFlow steps={steps} step={step} setStep={setStep} />;
}

/** Same as Flow but with the step index controlled by the parent (needed for question steps) */
function ControlledFlow({ steps, step, setStep }: { steps: Step[]; step: number; setStep: (n: number) => void }) {
  const s = steps[step];
  return (
    <div className="space-y-4">
      <ProgressDots total={steps.length} current={step} />
      <div key={step} className="space-y-4 animate-fadein">
        {s.content}
      </div>
      {!s.hideNext && (
        <div className="flex gap-3">
          {step > 0 && (
            <BigButton variant="secondary" onClick={() => { stopSpeaking(); setStep(step - 1); }} aria-label="שלב קודם">
              ➜
            </BigButton>
          )}
          <BigButton
            className="flex-1"
            disabled={s.canNext === false}
            onClick={() => {
              stopSpeaking();
              if (s.onNext) s.onNext();
              else setStep(Math.min(steps.length - 1, step + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {s.nextLabel ?? 'הלאה ⬅'}
          </BigButton>
        </div>
      )}
    </div>
  );
}

// ---------- 🫀 organ ----------

function OrganFlow({ a, finish }: { a: OrganActivity; finish: Finish }) {
  const [step, setStep] = useState(0);
  const [played, setPlayed] = useState(false);
  const steps: Step[] = [
    {
      content: (
        <>
          <div className="flex justify-center text-8xl animate-pop" aria-hidden="true">{a.emoji}</div>
          <Card className="space-y-3">
            {a.intro.map((t) => (
              <Say key={t} text={t} />
            ))}
          </Card>
          <div className="rounded-2xl bg-yellow-50 p-4 ring-2 ring-yellow-300">
            <p className="text-lg font-bold">🤩 הידעת?</p>
            <Say text={a.funFact} className="text-lg" />
          </div>
        </>
      ),
      nextLabel: 'למשחק! ⬅',
    },
    { content: <Card><GameView game={a.game} onDone={() => setPlayed(true)} /></Card>, canNext: played, nextLabel: 'לשאלה ⬅' },
    { content: <Card><QuestionCard q={a.question} onDone={() => finish()} /></Card>, hideNext: true },
  ];
  return <ControlledFlow steps={steps} step={step} setStep={setStep} />;
}

// ---------- 🔍 mission ----------

function MissionFlow({ world, a, finish }: { world: World; a: MissionActivity; finish: Finish }) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [photoId, setPhotoId] = useState<string | undefined>();
  const steps: Step[] = [
    {
      content: (
        <>
          <Card className="space-y-3">
            <SectionTitle>🕵️‍♀️ המשימה שלך</SectionTitle>
            <Say text={a.task} className="text-2xl font-semibold" />
          </Card>
          <Card className="space-y-2">
            <p className="text-lg font-bold">טיפים של בלשית:</p>
            {a.tips.map((t) => (
              <Say key={t} text={`• ${t}`} className="text-lg" />
            ))}
          </Card>
          {a.safety && (
            <div className="rounded-2xl bg-red-50 p-4 text-lg font-semibold text-red-800 ring-4 ring-red-300" role="alert">
              ⚠️ {a.safety} <SpeakButton text={a.safety} small />
            </div>
          )}
        </>
      ),
      nextLabel: 'יוצאת החוצה! ⬅',
    },
    {
      content: (
        <div className="space-y-4 text-center">
          <div className="text-8xl animate-floaty" aria-hidden="true">🌳🚶‍♀️🌼</div>
          <Companion text="עכשיו מניחים את המכשיר ויוצאים החוצה עם מבוגר. כשתמצאי, תצלמי ותחזרי לכאן!" />
          <p className="text-lg text-stone-600">אפשר לסגור את האפליקציה ולחזור אחר כך.</p>
        </div>
      ),
      nextLabel: 'חזרתי! מצאתי ⬅',
    },
    {
      content: (
        <Card className="space-y-4">
          <SectionTitle>מה מצאת? <SpeakButton text="מה מצאת? סמני את כל מה שמתאים." small /></SectionTitle>
          <p className="text-stone-600">סמני את כל מה שמתאים:</p>
          <div className="grid grid-cols-2 gap-2">
            {a.findOptions.map((o) => {
              const on = found.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFound((f) => (on ? f.filter((x) => x !== o.id) : [...f, o.id]))}
                  className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl p-2 text-lg font-semibold ring-2 ${on ? 'bg-green-50 ring-green-500' : 'bg-white ring-stone-200'}`}
                >
                  <span className="text-3xl">{o.emoji}</span>
                  {o.text}
                </button>
              );
            })}
          </div>
          <PhotoCapture photoId={photoId} onSaved={setPhotoId} />
        </Card>
      ),
      canNext: found.length > 0,
      nextLabel: 'לשאלת הבלשית ⬅',
    },
    {
      content: (
        <Card>
          <QuestionCard
            q={a.question}
            onDone={() =>
              finish((p) => addAlbum(p, { worldId: world.id, activityId: a.id, at: Date.now(), found, photoId }))
            }
          />
        </Card>
      ),
      hideNext: true,
    },
  ];
  return <ControlledFlow steps={steps} step={step} setStep={setStep} />;
}

// ---------- 🤔 simulation ----------

function SimFlow({ a, finish }: { a: SimActivity; finish: Finish }) {
  const [step, setStep] = useState(0);
  const [explored, setExplored] = useState(false);
  const steps: Step[] = [
    {
      content: (
        <>
          <Companion text={a.intro} mood="think" />
          <Card>
            <SimView sim={a.sim} onDone={() => setExplored(true)} />
          </Card>
          {!explored && <p className="text-center text-stone-500">נסי, שני ובדקי. כשתגלי משהו, הכפתור יידלק.</p>}
        </>
      ),
      canNext: explored,
      nextLabel: 'גיליתי! ⬅',
    },
    {
      content: (
        <Card className="space-y-3">
          <SectionTitle>💡 מה גילינו?</SectionTitle>
          <Say text={a.takeaway} />
        </Card>
      ),
    },
    { content: <Card><QuestionCard q={a.question} onDone={() => finish()} /></Card>, hideNext: true },
  ];
  return <ControlledFlow steps={steps} step={step} setStep={setStep} />;
}

// ---------- 🚀 place in space ----------

function PlaceFlow({ a, finish }: { a: PlaceActivity; finish: Finish }) {
  const [step, setStep] = useState(0);
  const [played, setPlayed] = useState(false);
  const steps: Step[] = [
    {
      content: (
        <>
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full text-8xl shadow-2xl animate-pop" style={{ background: `radial-gradient(circle at 35% 35%, #fff8, ${a.color})` }}>
            {a.emoji}
          </div>
          <Card className="space-y-3">
            <p className="text-lg font-bold text-blue-700">🤯 עובדה מפתיעה!</p>
            <Say text={a.fact} className="text-2xl font-semibold" />
          </Card>
          <Card className="space-y-2">
            {a.more.map((t) => (
              <Say key={t} text={`• ${t}`} className="text-lg" />
            ))}
          </Card>
        </>
      ),
      nextLabel: 'למשחק! ⬅',
    },
    { content: <Card><GameView game={a.game} onDone={() => setPlayed(true)} /></Card>, canNext: played, nextLabel: 'לשאלה ⬅' },
    { content: <Card><QuestionCard q={a.question} onDone={() => finish()} /></Card>, hideNext: true },
  ];
  return <ControlledFlow steps={steps} step={step} setStep={setStep} />;
}

