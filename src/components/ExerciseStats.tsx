import { useEffect, useState } from 'preact/hooks';
import { db } from '../db/schema';
import type { SessionRecord } from '../db/schema';
import { epley } from '../lib/oneRM';
import { formatWeight } from '../lib/format';
import { MiniChart } from './MiniChart';

interface SessionPoint {
  session: SessionRecord;
  best1RM: number;
  topWeight: number;
  topReps: number;
  topRir: number;
}

export function ExerciseStats({ exerciseId }: { exerciseId: string }) {
  const [points, setPoints] = useState<SessionPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allSets = await db.setLogs.where('exerciseId').equals(exerciseId).toArray();
      if (allSets.length === 0) {
        if (!cancelled) {
          setPoints([]);
          setLoaded(true);
        }
        return;
      }
      const sessionIds = Array.from(new Set(allSets.map((s) => s.sessionId)));
      const sessions = await db.sessions.where('id').anyOf(sessionIds).toArray();
      const completed = sessions
        .filter((s) => s.completedAt > 0)
        .sort((a, b) => a.completedAt - b.completedAt);

      const ps: SessionPoint[] = completed.map((session) => {
        const sets = allSets.filter((s) => s.sessionId === session.id);
        const topSet = sets.reduce((max, s) =>
          epley(s.weight, s.reps) > epley(max.weight, max.reps) ? s : max
        );
        return {
          session,
          best1RM: epley(topSet.weight, topSet.reps),
          topWeight: topSet.weight,
          topReps: topSet.reps,
          topRir: topSet.rir,
        };
      });

      if (!cancelled) {
        setPoints(ps);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  if (!loaded || points.length === 0) return null;

  const allTimePR = points.reduce((max, p) => (p.best1RM > max.best1RM ? p : max));
  const recent = points[points.length - 1];
  const first = points[0];
  const change = points.length >= 2 ? recent.best1RM - first.best1RM : 0;
  const round1 = (n: number) => Math.round(n * 10) / 10;

  return (
    <section class="space-y-3 pt-2">
      <h2 class="px-1 text-[11px] uppercase tracking-[0.15em] text-emerald-400 font-semibold">
        Прогресс · {points.length} {points.length === 1 ? 'сессия' : points.length < 5 ? 'сессии' : 'сессий'}
      </h2>

      <div class="grid grid-cols-2 gap-2">
        <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <div class="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Рекорд
          </div>
          <div class="text-lg font-bold mt-1 font-mono tabular-nums">
            {formatWeight(allTimePR.topWeight)}
            <span class="text-xs text-zinc-500">кг</span>
            <span class="text-zinc-500"> × </span>
            {allTimePR.topReps}
          </div>
          <div class="text-xs text-zinc-500 mt-1 tabular-nums">
            ~1RM {formatWeight(round1(allTimePR.best1RM))}кг
          </div>
        </div>
        <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <div class="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Прошлый раз
          </div>
          <div class="text-lg font-bold mt-1 font-mono tabular-nums">
            {formatWeight(recent.topWeight)}
            <span class="text-xs text-zinc-500">кг</span>
            <span class="text-zinc-500"> × </span>
            {recent.topReps}
          </div>
          {change !== 0 ? (
            <div
              class={`text-xs mt-1 tabular-nums ${
                change > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {change > 0 ? '+' : ''}
              {formatWeight(round1(change))} к 1RM
            </div>
          ) : (
            <div class="text-xs mt-1 text-zinc-600">первая сессия</div>
          )}
        </div>
      </div>

      {points.length >= 2 && (
        <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <div class="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">
            График 1RM (кг)
          </div>
          <MiniChart
            data={points.map((p) => ({
              x: p.session.completedAt,
              y: round1(p.best1RM),
            }))}
            height={140}
          />
        </div>
      )}
    </section>
  );
}
