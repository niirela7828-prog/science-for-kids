export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle, but never return the original order (when there is more than one item) */
export function shuffleDifferent<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  if (arr.length < 2) return [...arr];
  for (let tries = 0; tries < 20; tries++) {
    const s = shuffle(arr, rand);
    if (s.some((x, i) => x !== arr[i])) return s;
  }
  return [...arr].reverse();
}
