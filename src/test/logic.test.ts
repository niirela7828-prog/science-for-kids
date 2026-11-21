import { feedbackFor, praise, tryAgain } from '../lib/feedback';
import { checkAnswer, makeChallenge } from '../lib/gate';
import { seasonOf, todayKey } from '../lib/dates';
import { parseHash, routeToHash, type Route } from '../lib/router';
import { shuffle, shuffleDifferent } from '../lib/shuffle';
import { cleanForSpeech } from '../lib/speech';
import { growPlant } from '../sims/PlantSim';
import { meltRate } from '../sims/IceSim';
import { shadowLength, sunElevation } from '../sims/ShadowSim';
import { MAGNET_ITEMS } from '../sims/MagnetSim';
import { rollDistance } from '../sims/RampSim';
import { isDay } from '../sims/DayNightSim';
import { eggState } from '../sims/SaltEggSim';
import { evaporationPerHour } from '../sims/PuddleSim';
import { stringFrequency } from '../sims/StringSim';
import { jumpHeightCm } from '../games/JumpGame';

describe('feedback without punishment', () => {
  it('right answer → correct', () => {
    expect(feedbackFor(true, 0)).toBe('correct');
    expect(feedbackFor(true, 1)).toBe('correct');
  });
  it('first mistake → hint, second → explanation', () => {
    expect(feedbackFor(false, 0)).toBe('hint');
    expect(feedbackFor(false, 1)).toBe('explain');
    expect(feedbackFor(false, 5)).toBe('explain');
  });
  it('has friendly phrases', () => {
    expect(praise(0)).toBeTruthy();
    expect(praise(0.999)).toBeTruthy();
    expect(tryAgain(0.5)).toMatch(/רמז/);
  });
});

describe('parent gate', () => {
  it('asks a two-digit multiplication and checks it', () => {
    for (let i = 0; i < 50; i++) {
      const c = makeChallenge();
      expect(c.a).toBeGreaterThanOrEqual(12);
      expect(c.a).toBeLessThanOrEqual(19);
      expect(c.b).toBeGreaterThanOrEqual(6);
      expect(c.b).toBeLessThanOrEqual(9);
      expect(checkAnswer(c, String(c.a * c.b))).toBe(true);
      expect(checkAnswer(c, String(c.a * c.b + 1))).toBe(false);
      expect(checkAnswer(c, '')).toBe(false);
    }
  });
});

describe('dates', () => {
  it('seasons follow the Israeli calendar', () => {
    expect(seasonOf(new Date(2026, 11, 1))).toBe('winter');
    expect(seasonOf(new Date(2026, 1, 28))).toBe('winter');
    expect(seasonOf(new Date(2026, 2, 1))).toBe('spring');
    expect(seasonOf(new Date(2026, 5, 1))).toBe('summer');
    expect(seasonOf(new Date(2026, 8, 1))).toBe('autumn');
    expect(seasonOf(new Date(2026, 10, 30))).toBe('autumn');
  });
  it('todayKey is YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('router', () => {
  const routes: Route[] = [
    { name: 'map' },
    { name: 'world', worldId: 'lab' },
    { name: 'activity', worldId: 'space', activityId: 'moon' },
    { name: 'stickers' },
    { name: 'album' },
    { name: 'certificate', worldId: 'body' },
    { name: 'parents' },
  ];
  it.each(routes.map((r) => [r.name, r] as const))('%s round-trips', (_, r) => {
    expect(parseHash(routeToHash(r))).toEqual(r);
  });
  it('unknown paths go to the map', () => {
    expect(parseHash('#/nope')).toEqual({ name: 'map' });
    expect(parseHash('')).toEqual({ name: 'map' });
  });
});

describe('shuffle', () => {
  it('keeps all items', () => {
    expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
  it('shuffleDifferent never returns the same order', () => {
    for (let i = 0; i < 100; i++) expect(shuffleDifferent([1, 2, 3])).not.toEqual([1, 2, 3]);
    // even with a "stuck" random generator
    expect(shuffleDifferent([1, 2], () => 0.99)).not.toEqual([1, 2]);
  });
});

describe('speech', () => {
  it('removes emoji before reading aloud', () => {
    expect(cleanForSpeech('שלום 🌋 מדענית ❤️!')).toBe('שלום מדענית !');
  });
});

describe('simulations tell the truth', () => {
  it('plant: water is a must, light matters, soil matters', () => {
    expect(growPlant({ water: true, light: true, soil: true })).toBe('healthy');
    expect(growPlant({ water: false, light: true, soil: true })).toBe('wilted');
    expect(growPlant({ water: true, light: false, soil: true })).toBe('pale');
    expect(growPlant({ water: true, light: true, soil: false })).toBe('small');
  });
  it('ice melts only above 0°C, faster when hotter, refreezes below 0', () => {
    expect(meltRate(0)).toBe(0);
    expect(meltRate(-10)).toBeLessThan(0);
    expect(meltRate(5)).toBeGreaterThan(0);
    expect(meltRate(30)).toBeGreaterThan(meltRate(5));
  });
  it('shadow is shortest at noon and long in the morning and evening', () => {
    expect(sunElevation(12)).toBeGreaterThan(sunElevation(8));
    expect(shadowLength(12)).toBeLessThan(shadowLength(8));
    expect(shadowLength(12)).toBeLessThan(shadowLength(17));
    expect(shadowLength(7)).toBeCloseTo(shadowLength(17), 5);
  });
  it('magnet: only iron things, not the aluminium can', () => {
    expect(MAGNET_ITEMS.find((i) => i.id === 'can')!.magnetic).toBe(false);
    expect(MAGNET_ITEMS.find((i) => i.id === 'nail')!.magnetic).toBe(true);
    expect(MAGNET_ITEMS.some((i) => i.magnetic)).toBe(true);
  });
  it('ramp: higher start → further', () => {
    expect(rollDistance(5)).toBeGreaterThan(rollDistance(1));
  });
  it('day when facing the sun, night on the other side', () => {
    expect(isDay(0)).toBe(true);
    expect(isDay(180)).toBe(false);
    expect(isDay(360 + 10)).toBe(true);
    expect(isDay(-170)).toBe(false);
  });
  it('egg floats only with enough salt', () => {
    expect(eggState(0)).toBe('sinks');
    expect(eggState(10)).toBe('floats');
  });
  it('puddles dry faster in sun and wind', () => {
    const shade = evaporationPerHour({ sun: false, wind: false });
    expect(evaporationPerHour({ sun: true, wind: false })).toBeGreaterThan(shade);
    expect(evaporationPerHour({ sun: false, wind: true })).toBeGreaterThan(shade);
  });
  it('thin and tight strings sound higher', () => {
    expect(stringFrequency(true, true)).toBeGreaterThan(stringFrequency(false, true));
    expect(stringFrequency(true, true)).toBeGreaterThan(stringFrequency(true, false));
    expect(stringFrequency(false, false)).toBeLessThan(stringFrequency(true, false));
  });
  it('moon jump is 6 times higher than on Earth', () => {
    expect(jumpHeightCm(1 / 6)).toBe(6 * jumpHeightCm(1));
  });
});
