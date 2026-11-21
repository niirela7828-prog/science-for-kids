// Feedback without punishment:
//   1st mistake → a hint, try again
//   2nd mistake → the explanation and the right answer, then continue
export type Feedback = 'none' | 'correct' | 'hint' | 'explain';

export function feedbackFor(isCorrect: boolean, previousMistakes: number): Feedback {
  if (isCorrect) return 'correct';
  return previousMistakes >= 1 ? 'explain' : 'hint';
}

const PRAISE = ['כל הכבוד!', 'נכון מאוד!', 'מדענית אמיתית!', 'מצוין!', 'יופי של תשובה!', 'בדיוק!'];
const TRY_AGAIN = ['כמעט! הנה רמז:', 'עוד ניסיון קטן. רמז:', 'חשבת יפה! בואי ננסה שוב. רמז:'];

export function praise(seed = Math.random()): string {
  return PRAISE[Math.floor(seed * PRAISE.length) % PRAISE.length];
}

export function tryAgain(seed = Math.random()): string {
  return TRY_AGAIN[Math.floor(seed * TRY_AGAIN.length) % TRY_AGAIN.length];
}
