import { WORLDS } from '../content';
import {
  addAlbum,
  addJournal,
  addUsage,
  certificates,
  completeActivity,
  defaultProgress,
  grantExtraTime,
  isCompleted,
  isTimeUp,
  isUnlocked,
  isWorldComplete,
  limitSeconds,
  logStart,
  normalize,
  resetProgress,
  usageToday,
  worldCompletedCount,
} from '../lib/progress';

const body = WORLDS.find((w) => w.id === 'body')!;
const lab = WORLDS.find((w) => w.id === 'lab')!;

describe('progress', () => {
  it('starts empty with a 20 minute daily limit and speech on', () => {
    const p = defaultProgress();
    expect(p.settings.dailyLimitMin).toBe(20);
    expect(p.settings.tts).toBe(true);
    expect(p.stickers).toEqual([]);
  });

  it('completing an activity gives one sticker, only once', () => {
    let p = defaultProgress();
    const r1 = completeActivity(p, 'lab', 'volcano', 1000);
    expect(r1.newSticker).toBe(true);
    p = r1.progress;
    expect(isCompleted(p, 'lab', 'volcano')).toBe(true);
    const r2 = completeActivity(p, 'lab', 'volcano', 2000);
    expect(r2.newSticker).toBe(false);
    expect(r2.progress.stickers).toEqual(['lab/volcano']);
    expect(r2.progress.completed['lab/volcano']).toBe(1000);
  });

  it('body organs open one after another', () => {
    let p = defaultProgress();
    const [first, second, third] = body.activities;
    expect(isUnlocked(p, body, first.id)).toBe(true);
    expect(isUnlocked(p, body, second.id)).toBe(false);
    p = completeActivity(p, 'body', first.id).progress;
    expect(isUnlocked(p, body, second.id)).toBe(true);
    expect(isUnlocked(p, body, third.id)).toBe(false);
  });

  it('non-sequential worlds are all open', () => {
    const p = defaultProgress();
    for (const a of lab.activities) expect(isUnlocked(p, lab, a.id)).toBe(true);
  });

  it('finishing every activity in a world gives a certificate exactly once', () => {
    let p = defaultProgress();
    let justDone = 0;
    for (const a of lab.activities) {
      const r = completeActivity(p, 'lab', a.id);
      if (r.worldJustCompleted) justDone++;
      p = r.progress;
    }
    expect(justDone).toBe(1);
    expect(isWorldComplete(p, lab)).toBe(true);
    expect(worldCompletedCount(p, lab)).toBe(lab.activities.length);
    expect(certificates(p).map((w) => w.id)).toEqual(['lab']);
    expect(completeActivity(p, 'lab', lab.activities[0].id).worldJustCompleted).toBe(false);
  });

  it('journal and album entries are stored, album gets the season', () => {
    let p = defaultProgress();
    p = addJournal(p, { worldId: 'lab', activityId: 'volcano', at: 1, prediction: 'קצף', photoId: 'photo-1' });
    p = addAlbum(p, { worldId: 'nature', activityId: 'clouds', at: new Date(2026, 0, 10).getTime(), found: ['gray'] });
    p = addAlbum(p, { worldId: 'nature', activityId: 'petals', at: new Date(2026, 3, 10).getTime(), found: ['p5'] });
    expect(p.journal).toHaveLength(1);
    expect(p.journal[0].photoId).toBe('photo-1');
    expect(p.album.map((a) => a.season)).toEqual(['winter', 'spring']);
    expect(new Set([...p.journal, ...p.album].map((e) => e.id)).size).toBe(3);
  });

  describe('daily time limit', () => {
    it('adds up usage for today and resets on a new day', () => {
      let p = defaultProgress();
      p = addUsage(p, 60, '2026-11-21');
      p = addUsage(p, 30, '2026-11-21');
      expect(usageToday(p, '2026-11-21')).toBe(90);
      expect(usageToday(p, '2026-11-22')).toBe(0);
      p = addUsage(p, 15, '2026-11-22');
      expect(usageToday(p, '2026-11-22')).toBe(15);
    });

    it('time is up after 20 minutes by default', () => {
      let p = defaultProgress();
      p = addUsage(p, 19 * 60, 'd');
      expect(isTimeUp(p, 'd')).toBe(false);
      p = addUsage(p, 60, 'd');
      expect(isTimeUp(p, 'd')).toBe(true);
    });

    it('parents can give extra time for today only', () => {
      let p = addUsage(defaultProgress(), 20 * 60, 'd1');
      p = grantExtraTime(p, 10, 'd1');
      expect(isTimeUp(p, 'd1')).toBe(false);
      expect(limitSeconds(p, 'd1')).toBe(30 * 60);
      expect(limitSeconds(p, 'd2')).toBe(20 * 60);
    });

    it('limit 0 means no limit', () => {
      let p = defaultProgress();
      p = { ...p, settings: { ...p.settings, dailyLimitMin: 0 } };
      p = addUsage(p, 999 * 60, 'd');
      expect(isTimeUp(p, 'd')).toBe(false);
    });
  });

  it('reset clears progress but keeps the name and settings', () => {
    let p = defaultProgress();
    p = { ...p, childName: 'נועה', settings: { ...p.settings, dailyLimitMin: 30, tts: false } };
    p = completeActivity(p, 'lab', 'volcano').progress;
    p = addJournal(p, { worldId: 'lab', activityId: 'volcano', at: 1 });
    const r = resetProgress(p);
    expect(r.stickers).toEqual([]);
    expect(r.journal).toEqual([]);
    expect(r.completed).toEqual({});
    expect(r.childName).toBe('נועה');
    expect(r.settings.dailyLimitMin).toBe(30);
    expect(r.settings.tts).toBe(false);
  });

  it('normalize survives broken or old data', () => {
    expect(normalize(null).stickers).toEqual([]);
    expect(normalize('garbage').settings.dailyLimitMin).toBe(20);
    const n = normalize({ stickers: 'x', settings: { tts: false }, completed: { 'lab/volcano': 5 } });
    expect(n.stickers).toEqual([]);
    expect(n.settings.tts).toBe(false);
    expect(n.settings.dailyLimitMin).toBe(20);
    expect(n.completed['lab/volcano']).toBe(5);
  });

  it('the activity log is capped so storage does not grow forever', () => {
    let p = defaultProgress();
    for (let i = 0; i < 600; i++) p = logStart(p, 'lab', 'volcano', i);
    expect(p.log.length).toBe(500);
    expect(p.log[p.log.length - 1].at).toBe(599);
  });
});
