// Content model. Every world is plain data; adding a world or an activity
// means adding data here — the screens know how to render each "kind".

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export interface Choice {
  id: string;
  text: string;
  emoji?: string;
}

/** A question with one right answer. Wrong #1 → hint, wrong #2 → explanation. */
export interface Question {
  text: string;
  options: Choice[];
  correct: string; // id of the right option
  hint: string;
  explanation: string;
}

// ---------- Mini games (data-driven, reusable in every world) ----------

export interface TapGame {
  type: 'tap';
  prompt: string;
  emoji: string;
  target: number;
  doneText: string;
}

export interface BreathGame {
  type: 'breath';
  prompt: string;
  cycles: number;
  doneText: string;
}

export interface OrderGame {
  type: 'order';
  prompt: string;
  /** items in the correct order */
  items: Choice[];
  doneText: string;
}

export interface MemoryGame {
  type: 'memory';
  prompt: string;
  pairs: { emoji: string; label: string }[];
  doneText: string;
}

export interface SortGame {
  type: 'sort';
  prompt: string;
  bins: Choice[];
  items: { id: string; text: string; emoji: string; bin: string }[];
  doneText: string;
}

export interface FindGame {
  type: 'find';
  prompt: string;
  items: { id: string; text: string; emoji: string; correct: boolean }[];
  doneText: string;
}

export interface JumpGame {
  type: 'jump';
  prompt: string;
  /** gravity relative to Earth (Earth = 1, Moon ≈ 0.165) */
  gravity: number;
  placeName: string;
  doneText: string;
}

export type Game = TapGame | BreathGame | OrderGame | MemoryGame | SortGame | FindGame | JumpGame;

// ---------- Activities ----------

interface BaseActivity {
  id: string;
  title: string;
  emoji: string;
  /** name of the sticker earned when the activity is completed */
  sticker: string;
}

export interface ExperimentActivity extends BaseActivity {
  kind: 'experiment';
  adult: boolean;
  adultNote?: string;
  intro: string;
  materials: Choice[];
  steps: { emoji: string; text: string }[];
  /** asked BEFORE the experiment — any answer is fine */
  predict: { text: string; options: Choice[] };
  /** "what happened?" after the experiment */
  result: string;
  /** "why did it happen?" in a child's language */
  why: string;
  question: Question;
}

export interface OrganActivity extends BaseActivity {
  kind: 'organ';
  intro: string[];
  funFact: string;
  game: Game;
  question: Question;
}

export interface MissionActivity extends BaseActivity {
  kind: 'mission';
  seasons: Season[]; // seasons where the mission works best
  task: string;
  tips: string[];
  safety?: string;
  /** she marks herself what she found (no automatic identification) */
  findOptions: Choice[];
  question: Question;
}

export type SimId =
  | 'plant'
  | 'ice'
  | 'shadow'
  | 'magnet'
  | 'ramp'
  | 'daynight'
  | 'saltegg'
  | 'puddle'
  | 'string';

export interface SimActivity extends BaseActivity {
  kind: 'sim';
  sim: SimId;
  intro: string;
  /** what she should notice */
  takeaway: string;
  question: Question;
}

export interface PlaceActivity extends BaseActivity {
  kind: 'place';
  /** a surprising fact */
  fact: string;
  more: string[];
  color: string;
  game: Game;
  question: Question;
}

export type Activity =
  | ExperimentActivity
  | OrganActivity
  | MissionActivity
  | SimActivity
  | PlaceActivity;

export interface World {
  id: string;
  title: string;
  emoji: string;
  /** short description shown on the map */
  tagline: string;
  /** Tailwind-friendly colors (hex) */
  color: string;
  colorSoft: string;
  /** what the companion says when entering the world */
  welcome: string;
  /** when true, activity N+1 opens only after N is completed */
  sequential: boolean;
  activities: Activity[];
}

export const SEASON_NAMES: Record<Season, string> = {
  winter: 'חורף',
  spring: 'אביב',
  summer: 'קיץ',
  autumn: 'סתיו',
};

export const SEASON_EMOJI: Record<Season, string> = {
  winter: '🌧️',
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
};
