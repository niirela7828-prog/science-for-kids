import type { Activity, World } from './types';
import { lab } from './worlds/lab';
import { body } from './worlds/body';
import { nature } from './worlds/nature';
import { whatif } from './worlds/whatif';
import { space } from './worlds/space';

/**
 * The list of worlds on the map, in order.
 * To add a new world: create a file in ./worlds and add it here.
 */
export const WORLDS: World[] = [lab, body, nature, whatif, space];

export function getWorld(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

export function getActivity(worldId: string, activityId: string): Activity | undefined {
  return getWorld(worldId)?.activities.find((a) => a.id === activityId);
}

/** Unique key for an activity across all worlds */
export function activityKey(worldId: string, activityId: string): string {
  return `${worldId}/${activityId}`;
}

export * from './types';
