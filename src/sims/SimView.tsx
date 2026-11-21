import type { SimId } from '../content';
import { PlantSim } from './PlantSim';
import { IceSim } from './IceSim';
import { ShadowSim } from './ShadowSim';
import { MagnetSim } from './MagnetSim';
import { RampSim } from './RampSim';
import { DayNightSim } from './DayNightSim';
import { SaltEggSim } from './SaltEggSim';
import { PuddleSim } from './PuddleSim';
import { StringSim } from './StringSim';

export interface SimProps {
  onDone: () => void;
}

const SIMS: Record<SimId, (p: SimProps) => JSX.Element> = {
  plant: PlantSim,
  ice: IceSim,
  shadow: ShadowSim,
  magnet: MagnetSim,
  ramp: RampSim,
  daynight: DayNightSim,
  saltegg: SaltEggSim,
  puddle: PuddleSim,
  string: StringSim,
};

export function SimView({ sim, onDone }: { sim: SimId; onDone: () => void }) {
  const C = SIMS[sim];
  return (
    <div data-testid={`sim-${sim}`}>
      <C onDone={onDone} />
    </div>
  );
}

/** On/off button. `choice` = the two states are both valid choices (e.g. thin/thick), so "off" is not crossed out. */
export function Toggle({ on, onChange, label, emoji, choice = false }: { on: boolean; onChange: (v: boolean) => void; label: string; emoji: string; choice?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`flex min-h-[48px] items-center gap-1 rounded-xl px-3 py-2 text-base font-semibold ring-2 transition active:scale-95 ${
        on || choice ? 'bg-sky-100 ring-sky-400' : 'bg-stone-100 text-stone-400 ring-stone-200 line-through'
      }`}
    >
      <span className="text-xl">{emoji}</span> {label}
    </button>
  );
}

export function Slider({ value, min, max, step = 1, onChange, label }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; label: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-lg font-semibold">{label}</span>
      <input
        type="range"
        dir="ltr"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 w-full accent-violet-600"
      />
    </label>
  );
}
