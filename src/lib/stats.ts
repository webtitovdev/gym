import { db } from '../db/schema';

export interface WeekStats {
  totalVolumeKg: number;
  totalSets: number;
  sessionsThisWeek: number;
  streakWeeks: number;
}

function mondayStartMs(d: Date = new Date()): number {
  const day = d.getDay() || 7; // Sun=0 -> 7
  const m = new Date(d);
  m.setDate(d.getDate() - (day - 1));
  m.setHours(0, 0, 0, 0);
  return m.getTime();
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getWeekStats(): Promise<WeekStats> {
  const weekStart = mondayStartMs();
  const completedThisWeek = await db.sessions
    .where('completedAt')
    .above(weekStart)
    .toArray();

  let totalSets = 0;
  let totalVolume = 0;
  for (const s of completedThisWeek) {
    if (!s.id) continue;
    const sets = await db.setLogs.where('sessionId').equals(s.id).toArray();
    totalSets += sets.length;
    for (const set of sets) totalVolume += set.weight * set.reps;
  }

  // Streak: consecutive weeks (including current) with >=1 completed session
  let streak = 0;
  let cursorStart = weekStart;
  for (let w = 0; w < 52; w++) {
    const count = await db.sessions
      .where('completedAt')
      .between(cursorStart, cursorStart + WEEK_MS, true, false)
      .count();
    if (count > 0) {
      streak++;
      cursorStart -= WEEK_MS;
    } else {
      // first iteration may be 0 if today is before first session of week — still count if any prior week
      if (w === 0) {
        cursorStart -= WEEK_MS;
        continue;
      }
      break;
    }
  }

  return {
    totalVolumeKg: Math.round(totalVolume),
    totalSets,
    sessionsThisWeek: completedThisWeek.length,
    streakWeeks: streak,
  };
}

/** Days this week (Mon..Sun) with completed sessions — returns indices 0..6 (Mon=0). */
export async function getCompletedDayIndicesThisWeek(): Promise<number[]> {
  const weekStart = mondayStartMs();
  const sessions = await db.sessions
    .where('completedAt')
    .above(weekStart)
    .toArray();
  const out = new Set<number>();
  for (const s of sessions) {
    if (s.completedAt <= 0) continue;
    const d = new Date(s.completedAt);
    out.add((d.getDay() || 7) - 1); // Mon=0
  }
  return Array.from(out);
}

/** Format kg as "5.2t" or "850" or "1.2t" */
export function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}т`;
  return String(kg);
}
