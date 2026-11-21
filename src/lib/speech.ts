// Reads Hebrew text aloud with the device's own voice (Web Speech API).
// Works offline when the device has a Hebrew voice installed.

let cachedVoice: SpeechSynthesisVoice | null | undefined;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined && cachedVoice !== null) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const he = voices.filter((v) => /^(he|iw)(-|_|$)/i.test(v.lang));
  // prefer local (offline) voices
  cachedVoice = he.find((v) => v.localService) ?? he[0] ?? null;
  return cachedVoice;
}

export function hasHebrewVoice(): boolean {
  return speechSupported() && pickVoice() !== null;
}

/** Remove emoji so the voice doesn't read their names */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text: string, onEnd?: () => void) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const clean = cleanForSpeech(text);
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'he-IL';
  u.rate = 0.85; // a little slower, for a young listener
  const v = pickVoice();
  if (v) u.voice = v;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  synth.speak(u);
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

if (speechSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}
