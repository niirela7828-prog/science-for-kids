import type { Season } from '../content/types';

/** Local date as YYYY-MM-DD */
export function todayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Seasons as in Israel's school year: Dec–Feb winter, Mar–May spring, Jun–Aug summer, Sep–Nov autumn */
export function seasonOf(d: Date = new Date()): Season {
  const m = d.getMonth(); // 0 = January
  if (m === 11 || m <= 1) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('he-IL', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
