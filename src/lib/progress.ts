// Progress is a single JSON object stored in localStorage on the device.
// All the logic is in pure functions so it can be tested easily.
import { WORLDS, activityKey, type World, type Season } from '../content';
import { seasonOf, todayKey } from './dates';

export interface JournalEntry {
  id: string;
  worldId: string;
  activityId: string;
  at: number;
  prediction?: string;
  note?: string;
  photoId?: string;
}

export interface AlbumEntry {
  id: string;
  worldId: string;
  activityId: string;
  at: number;
  season: Season;
  found: string[]; // ids of findOptions she marked
  photoId?: string;
}

export interface LogEntry {
  at: number;
  key: string; // world/activity
  type: 'start' | 'complete';
}

export interface Settings {
  tts: boolean;
  dailyLimitMin: number; // 0 = no limit
  sound: boolean;
}

export interface Progress {
  version: 1;
  childName: string;
  completed: Record<string, number>; // key → timestamp
  stickers: string[]; // activity keys, in the order earned
  journal: JournalEntry[];
  album: AlbumEntry[];
  log: LogEntry[];
  settings: Settings;
  usage: { date: string; seconds: number };
  /** date (YYYY-MM-DD) for which a parent granted extra time */
  extraTimeDate?: string;
  extraTimeMin?: number;
}

export const STORAGE_KEY = 'science-kids-progress-v1';
const MAX_LOG = 500;

export function defaultProgress(): Progress {
  return {
    version: 1,
    childName: '',
    completed: {},
    stickers: [],
    journal: [],
    album: [],
    log: [],
    settings: { tts: true, dailyLimitMin: 20, sound: true },
    usage: { date: todayKey(), seconds: 0 },
  };
}

/** Accepts anything (old / broken data) and returns a valid Progress */
export function normalize(raw: unknown): Progress {
  const base = defaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Progress>;
  return {
    ...base,
    ...r,
    version: 1,
    completed: { ...(r.completed ?? {}) },
    stickers: Array.isArray(r.stickers) ? [...r.stickers] : [],
    journal: Array.isArray(r.journal) ? [...r.journal] : [],
    album: Array.isArray(r.album) ? [...r.album] : [],
    log: Array.isArray(r.log) ? [...r.log] : [],
    settings: { ...base.settings, ...(r.settings ?? {}) },
    usage: r.usage && typeof r.usage.date === 'string' ? { ...r.usage } : base.usage,
  };
}

// ---------- queries ----------

export function isCompleted(p: Progress, worldId: string, activityId: string): boolean {
  return Boolean(p.completed[activityKey(worldId, activityId)]);
}

export function worldCompletedCount(p: Progress, world: World): number {
  return world.activities.filter((a) => isCompleted(p, world.id, a.id)).length;
}

export function isWorldComplete(p: Progress, world: World): boolean {
  return world.activities.length > 0 && worldCompletedCount(p, world) === world.activities.length;
}

/** In a sequential world, an activity opens only after the previous one is done */
export function isUnlocked(p: Progress, world: World, activityId: string): boolean {
  if (!world.sequential) return true;
  const idx = world.activities.findIndex((a) => a.id === activityId);
  if (idx <= 0) return idx === 0;
  return isCompleted(p, world.id, world.activities[idx - 1].id);
}

export function certificates(p: Progress): World[] {
  return WORLDS.filter((w) => isWorldComplete(p, w));
}

// ---------- updates (return a new object) ----------

function pushLog(p: Progress, entry: LogEntry): LogEntry[] {
  const log = [...p.log, entry];
  return log.length > MAX_LOG ? log.slice(log.length - MAX_LOG) : log;
}

export function logStart(p: Progress, worldId: string, activityId: string, now = Date.now()): Progress {
  return { ...p, log: pushLog(p, { at: now, key: activityKey(worldId, activityId), type: 'start' }) };
}

export function completeActivity(
  p: Progress,
  worldId: string,
  activityId: string,
  now = Date.now(),
): { progress: Progress; newSticker: boolean; worldJustCompleted: boolean } {
  const key = activityKey(worldId, activityId);
  const already = Boolean(p.completed[key]);
  const world = WORLDS.find((w) => w.id === worldId);
  const wasComplete = world ? isWorldComplete(p, world) : false;
  const next: Progress = {
    ...p,
    completed: already ? p.completed : { ...p.completed, [key]: now },
    stickers: p.stickers.includes(key) ? p.stickers : [...p.stickers, key],
    log: pushLog(p, { at: now, key, type: 'complete' }),
  };
  const isComplete = world ? isWorldComplete(next, world) : false;
  return { progress: next, newSticker: !already, worldJustCompleted: !wasComplete && isComplete };
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addJournal(p: Progress, e: Omit<JournalEntry, 'id'>): Progress {
  return { ...p, journal: [...p.journal, { ...e, id: newId() }] };
}

export function addAlbum(p: Progress, e: Omit<AlbumEntry, 'id' | 'season'> & { season?: Season }): Progress {
  const season = e.season ?? seasonOf(new Date(e.at));
  return { ...p, album: [...p.album, { ...e, season, id: newId() }] };
}

// ---------- daily time ----------

export function usageToday(p: Progress, today = todayKey()): number {
  return p.usage.date === today ? p.usage.seconds : 0;
}

export function addUsage(p: Progress, seconds: number, today = todayKey()): Progress {
  return { ...p, usage: { date: today, seconds: usageToday(p, today) + seconds } };
}

export function limitSeconds(p: Progress, today = todayKey()): number {
  if (!p.settings.dailyLimitMin) return Infinity;
  const extra = p.extraTimeDate === today ? (p.extraTimeMin ?? 0) : 0;
  return (p.settings.dailyLimitMin + extra) * 60;
}

export function isTimeUp(p: Progress, today = todayKey()): boolean {
  return usageToday(p, today) >= limitSeconds(p, today);
}

export function grantExtraTime(p: Progress, minutes: number, today = todayKey()): Progress {
  const current = p.extraTimeDate === today ? (p.extraTimeMin ?? 0) : 0;
  return { ...p, extraTimeDate: today, extraTimeMin: current + minutes };
}

/** Reset keeps the settings (time limit, speech) and the child's name */
export function resetProgress(p: Progress): Progress {
  const fresh = defaultProgress();
  return { ...fresh, childName: p.childName, settings: p.settings };
}
