import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { WORLDS, type Game, type Question } from '../content';

const SIM_IDS = ['plant', 'ice', 'shadow', 'magnet', 'ramp', 'daynight', 'saltegg', 'puddle', 'string'];

function checkQuestion(q: Question, where: string) {
  expect(q.text.trim(), where).not.toBe('');
  expect(q.options.length, where).toBeGreaterThanOrEqual(2);
  const ids = q.options.map((o) => o.id);
  expect(new Set(ids).size, `${where}: unique option ids`).toBe(ids.length);
  expect(ids, `${where}: correct answer exists`).toContain(q.correct);
  expect(q.hint.trim().length, `${where}: hint`).toBeGreaterThan(5);
  expect(q.explanation.trim().length, `${where}: explanation`).toBeGreaterThan(5);
  expect(q.hint, `${where}: hint ≠ explanation`).not.toBe(q.explanation);
}

function checkGame(g: Game, where: string) {
  expect(g.prompt.trim(), where).not.toBe('');
  expect(g.doneText.trim(), where).not.toBe('');
  switch (g.type) {
    case 'tap':
      expect(g.target).toBeGreaterThan(0);
      break;
    case 'breath':
      expect(g.cycles).toBeGreaterThan(0);
      break;
    case 'order': {
      expect(g.items.length).toBeGreaterThanOrEqual(3);
      expect(new Set(g.items.map((i) => i.id)).size).toBe(g.items.length);
      break;
    }
    case 'memory':
      expect(g.pairs.length).toBeGreaterThanOrEqual(3);
      expect(new Set(g.pairs.map((p) => p.emoji)).size, `${where}: memory emojis unique`).toBe(g.pairs.length);
      break;
    case 'sort': {
      const bins = g.bins.map((b) => b.id);
      expect(bins.length).toBeGreaterThanOrEqual(2);
      for (const it of g.items) expect(bins, `${where}: ${it.id}`).toContain(it.bin);
      for (const b of bins) expect(g.items.some((i) => i.bin === b), `${where}: bin ${b} used`).toBe(true);
      break;
    }
    case 'find':
      expect(g.items.some((i) => i.correct)).toBe(true);
      expect(g.items.some((i) => !i.correct)).toBe(true);
      break;
    case 'jump':
      expect(g.gravity).toBeGreaterThan(0);
      expect(g.gravity).toBeLessThan(1);
      break;
  }
}

describe('content', () => {
  it('has the 5 worlds', () => {
    expect(WORLDS.map((w) => w.id)).toEqual(['lab', 'body', 'nature', 'whatif', 'space']);
  });

  it.each(WORLDS.map((w) => [w.id, w] as const))('world %s has at least 8 activities with unique ids', (_, w) => {
    expect(w.activities.length).toBeGreaterThanOrEqual(8);
    const ids = w.activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('each world uses a single activity kind that matches its theme', () => {
    const kinds = Object.fromEntries(WORLDS.map((w) => [w.id, [...new Set(w.activities.map((a) => a.kind))]]));
    expect(kinds).toEqual({ lab: ['experiment'], body: ['organ'], nature: ['mission'], whatif: ['sim'], space: ['place'] });
  });

  it('the body world opens organs one after another', () => {
    expect(WORLDS.find((w) => w.id === 'body')!.sequential).toBe(true);
  });

  for (const w of WORLDS) {
    for (const a of w.activities) {
      const where = `${w.id}/${a.id}`;
      it(`${where} is complete and valid`, () => {
        expect(a.title.trim()).not.toBe('');
        expect(a.sticker.trim()).not.toBe('');
        expect(a.emoji.trim()).not.toBe('');
        checkQuestion(a.question, where);
        switch (a.kind) {
          case 'experiment':
            expect(a.materials.length).toBeGreaterThanOrEqual(2);
            expect(a.steps.length).toBeGreaterThanOrEqual(3);
            expect(a.predict.options.length).toBeGreaterThanOrEqual(2);
            expect(a.result.length).toBeGreaterThan(10);
            expect(a.why.length).toBeGreaterThan(20);
            if (a.adult) expect(a.adultNote, `${where}: adult experiments explain why`).toBeTruthy();
            break;
          case 'organ':
            expect(a.intro.length).toBeGreaterThanOrEqual(2);
            checkGame(a.game, where);
            break;
          case 'place':
            expect(a.fact.length).toBeGreaterThan(20);
            checkGame(a.game, where);
            break;
          case 'mission':
            expect(a.seasons.length).toBeGreaterThanOrEqual(1);
            expect(a.findOptions.length).toBeGreaterThanOrEqual(2);
            expect(a.tips.length).toBeGreaterThanOrEqual(1);
            break;
          case 'sim':
            expect(SIM_IDS).toContain(a.sim);
            expect(a.takeaway.length).toBeGreaterThan(20);
            break;
        }
      });
    }
  }

  it('lab has experiments clearly marked as needing an adult', () => {
    const lab = WORLDS.find((w) => w.id === 'lab')!;
    const adult = lab.activities.filter((a) => a.kind === 'experiment' && a.adult);
    expect(adult.length).toBeGreaterThan(0);
    // anything with a knife, hot water or vinegar poured near faces must be adult-only
    for (const a of lab.activities) {
      if (a.kind !== 'experiment') continue;
      const text = JSON.stringify(a);
      if (/סכין|חמים|קומקום/.test(text)) expect(a.adult, a.id).toBe(true);
    }
  });

  it('nature missions cover every season', () => {
    const nature = WORLDS.find((w) => w.id === 'nature')!;
    const seasons = new Set(nature.activities.flatMap((a) => (a.kind === 'mission' ? a.seasons : [])));
    expect([...seasons].sort()).toEqual(['autumn', 'spring', 'summer', 'winter']);
  });

  it('the moon jump uses the real moon gravity (about 1/6)', () => {
    const moon = WORLDS.find((w) => w.id === 'space')!.activities.find((a) => a.id === 'moon')!;
    expect(moon.kind).toBe('place');
    if (moon.kind === 'place' && moon.game.type === 'jump') {
      expect(1 / moon.game.gravity).toBeCloseTo(6, 0);
    } else throw new Error('moon game should be a jump');
  });

  it('insects have 6 legs', () => {
    const m = WORLDS.find((w) => w.id === 'nature')!.activities.find((a) => a.id === 'insect-legs')!;
    const right = m.question.options.find((o) => o.id === m.question.correct)!;
    expect(right.text).toBe('6');
  });
});

describe('privacy: no data leaves the device', () => {
  function files(dir: string): string[] {
    return readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : [p];
    });
  }
  const src = files(join(__dirname, '..')).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes(`${'test'}/`));

  it('source code has no network calls and no outside links', () => {
    for (const f of src) {
      const text = readFileSync(f, 'utf8');
      expect(text, f).not.toMatch(/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket\(|https?:\/\//);
    }
  });
});
