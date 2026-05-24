import { useEffect, useState } from 'preact/hooks';
import { db } from '../db/schema';
import type { SessionRecord } from '../db/schema';
import { epley } from '../lib/oneRM';
import { pal } from '../lib/designTokens';
import { formatWeight } from '../lib/format';

interface SessionPoint {
  session: SessionRecord;
  best1RM: number;
  topWeight: number;
  topReps: number;
}

export function ExerciseStats({ exerciseId }: { exerciseId: string }) {
  const [points, setPoints] = useState<SessionPoint[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allSets = await db.setLogs.where('exerciseId').equals(exerciseId).toArray();
      if (allSets.length === 0) {
        if (!cancelled) { setPoints([]); setLoaded(true); }
        return;
      }
      const sessionIds = Array.from(new Set(allSets.map((s) => s.sessionId)));
      const sessions = await db.sessions.where('id').anyOf(sessionIds).toArray();
      const completed = sessions.filter((s) => s.completedAt > 0).sort((a, b) => a.completedAt - b.completedAt);

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
        };
      });

      if (!cancelled) {
        setPoints(ps);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [exerciseId]);

  if (!loaded) return null;
  if (points.length === 0) {
    return (
      <div style={{ padding: '20px 14px', background: pal.bgSoft, borderRadius: 18, textAlign: 'center', color: pal.mute, fontSize: 12, fontWeight: 700 }}>
        Пока нет записанных сессий с этим упражнением
      </div>
    );
  }

  const allTimePR = points.reduce((max, p) => (p.best1RM > max.best1RM ? p : max));
  const recent = points[points.length - 1];
  const first = points[0];
  const change = points.length >= 2 ? recent.best1RM - first.best1RM : 0;
  const round1 = (n: number) => Math.round(n * 10) / 10;

  // Bar chart data — last 5 sessions
  const lastFive = points.slice(-5);
  const maxKg = Math.max(...lastFive.map((p) => p.topWeight));

  const MONTH_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const formatDate = (ms: number) => {
    const d = new Date(ms);
    return `${d.getDate()} ${MONTH_RU[d.getMonth()]}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Best + recent */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ background: pal.peachL, borderRadius: 16, padding: '10px 14px', flex: 1 }}>
          <div style={{ fontSize: 10, color: pal.terraD, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Рекорд</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: pal.ink, marginTop: 2, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
            {formatWeight(allTimePR.topWeight)}<span style={{ fontSize: 12 }}>кг</span>
          </div>
          <div style={{ fontSize: 10, color: pal.terraD, fontWeight: 700, marginTop: 2 }}>
            ×{allTimePR.topReps} · ~1ПМ {formatWeight(round1(allTimePR.best1RM))}кг
          </div>
        </div>
        <div style={{ background: pal.card, borderRadius: 16, padding: '10px 14px', flex: 1, border: `1px solid ${pal.line}` }}>
          <div style={{ fontSize: 10, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Прошлый раз</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: pal.ink, marginTop: 2, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
            {formatWeight(recent.topWeight)}<span style={{ fontSize: 12 }}>кг</span>
          </div>
          {change !== 0 ? (
            <div style={{ fontSize: 10, fontWeight: 800, marginTop: 2, color: change > 0 ? pal.terra : pal.plum, fontVariantNumeric: 'tabular-nums' }}>
              {change > 0 ? '+' : ''}{formatWeight(round1(change))} к 1ПМ
            </div>
          ) : (
            <div style={{ fontSize: 10, color: pal.muteSoft, fontWeight: 700, marginTop: 2 }}>1-я сессия</div>
          )}
        </div>
      </div>

      {/* Bar chart of recent sessions */}
      {lastFive.length >= 2 && (
        <div style={{ background: pal.card, borderRadius: 18, padding: '14px 16px', border: `1px solid ${pal.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Прогресс · кг
            </div>
            {change > 0 && (
              <div style={{ fontSize: 10, color: pal.terra, fontWeight: 800 }}>
                +{formatWeight(round1(change))}кг за {points.length} сесс.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90, paddingBottom: 22, position: 'relative' }}>
            {lastFive.map((h, i) => {
              const isLast = i === lastFive.length - 1;
              const pct = maxKg > 0 ? h.topWeight / maxKg : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', height: '100%' }}>
                  <div style={{ position: 'absolute', bottom: `calc(${pct * 70}% + 18px)`, fontSize: 9, fontWeight: 800, color: isLast ? pal.terra : pal.mute, fontVariantNumeric: 'tabular-nums' }}>
                    {formatWeight(h.topWeight)}
                  </div>
                  <div style={{ width: '70%', height: `${pct * 70}%`, background: isLast ? pal.terra : pal.peachL, borderRadius: 6, marginTop: 'auto', marginBottom: 16 }} />
                  <div style={{ position: 'absolute', bottom: 0, fontSize: 9, color: pal.mute, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {formatDate(h.session.completedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
