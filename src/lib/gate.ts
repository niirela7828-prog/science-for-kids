/** A math question that is easy for adults and hard for a 7-year-old */
export interface Challenge {
  a: number;
  b: number;
  answer: number;
  text: string;
}

export function makeChallenge(rand: () => number = Math.random): Challenge {
  const a = 12 + Math.floor(rand() * 8); // 12..19
  const b = 6 + Math.floor(rand() * 4); // 6..9
  return { a, b, answer: a * b, text: `${a} × ${b} = ?` };
}

export function checkAnswer(c: Challenge, input: string): boolean {
  const n = Number(input.trim());
  return Number.isFinite(n) && input.trim() !== '' && n === c.answer;
}
