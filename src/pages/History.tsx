import { useEffect, useState } from 'preact/hooks';
import { db } from '../db/schema';
import { loadProgram, loadExercises } from '../lib/loadData';
import { pal, dayCode, DOW_RU_SHORT } from '../lib/designTokens';
import { BottomNav } from '../components/BottomNav';
import { MuscleDot } from '../components/MuscleDiagram';
import { formatVolume } from '../lib/stats';
import type { Program, MuscleGroup } from '../types';
import type { SessionRecord } from '../db/schema';

const MONTH_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

interface Entry {
  session: SessionRecord;
  setsCount: number;
  volume: number;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
}

export function History() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [prog, lib] = await Promise.all([loadProgram(), loadExercises()]);
      const sessions = await db.sessions
        .where('completedAt')
        .above(0)
        .reverse()
        .sortBy('completedAt');
      const list = await Promise.all(
        sessions.map(async (s): Promise<Entry> => {
          if (!s.id) return { session: s, setsCount: 0, volume: 0, primaryMuscles: [], secondaryMuscles: [] };
          const sets = await db.setLogs.where('sessionId').equals(s.id).toArray();
          let vol = 0;
          const primary: MuscleGroup[] = [];
          const secondary: MuscleGroup[] = [];
          const seen = new Set<string>();
          for (const set of sets) {
            vol += set.weight * set.reps;
            if (!seen.has(set.exerciseId)) {
              seen.add(set.exerciseId);
              const ex = lib[set.exerciseId];
              if (ex) {
                primary.push(...ex.primaryMuscles);
                secondary.push(...ex.secondaryMuscles);
              }
            }
          }
          return { session: s, setsCount: sets.length, volume: Math.round(vol), primaryMuscles: primary, secondaryMuscles: secondary };
        })
      );
      if (!cancelled) {
        setEntries(list);
        setProgram(prog);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const monthLabel = MONTH_RU[now.getMonth()];

  // Build month calendar (4 weeks ending current week, Mon-first)
  const todayDow = now.getDay() || 7; // Mon=1..Sun=7
  const currentWeekMonday = new Date(now);
  currentWeekMonday.setDate(now.getDate() - (todayDow - 1));
  currentWeekMonday.setHours(0, 0, 0, 0);

  // Build 4 weeks: 3 prior + current
  const calRows: Array<Array<{ d: number; ms: number; isToday: boolean; hasWorkout: boolean; isCurrentMonth: boolean }>> = [];
  for (let w = -3; w <= 0; w++) {
    const row: typeof calRows[number] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(currentWeekMonday);
      date.setDate(currentWeekMonday.getDate() + w * 7 + d);
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      const hasWorkout = entries.some((e) => e.session.completedAt >= dayStart.getTime() && e.session.completedAt <= dayEnd.getTime());
      const isCurrentMonth = date.getMonth() === now.getMonth();
      row.push({ d: date.getDate(), ms: date.getTime(), isToday, hasWorkout, isCurrentMonth });
    }
    calRows.push(row);
  }

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 110, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '34px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700 }}>История</div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, color: pal.ink }}>Дневник</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: pal.terra, background: pal.bgSoft, padding: '6px 12px', borderRadius: 100, textTransform: 'capitalize' }}>
          {monthLabel}
        </div>
      </div>

      {/* Month calendar */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ background: pal.card, borderRadius: 18, padding: 14, border: `1px solid ${pal.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            {DOW_RU_SHORT.slice(1).concat([DOW_RU_SHORT[0]]).map((d, i) => (
              <div key={i} style={{ width: 32, textAlign: 'center', fontSize: 10, color: pal.mute, fontWeight: 800 }}>{d}</div>
            ))}
          </div>
          {calRows.map((row, wi) => (
            <div key={wi} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {row.map((cell, di) => (
                <div
                  key={di}
                  style={{
                    width: 32,
                    height: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    background: cell.isToday ? pal.ink : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: cell.isToday ? pal.peachL : (cell.isCurrentMonth ? pal.ink2 : pal.muteSoft) }}>
                    {cell.d}
                  </span>
                  {cell.hasWorkout && <div style={{ width: 4, height: 4, borderRadius: 2, background: cell.isToday ? pal.peachL : pal.terra, marginTop: 1 }}/>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Недавние тренировки
        </div>
        {!loaded && <div style={{ color: pal.mute, padding: '12px 0' }}>Загрузка...</div>}
        {loaded && entries.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ color: pal.mute, fontSize: 13 }}>Пока нет завершённых тренировок</div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry) => {
            const day = program?.days.find((d) => d.id === entry.session.dayId);
            const date = new Date(entry.session.completedAt);
            const dayShort = DOW_RU_SHORT[date.getDay()];
            const mins = Math.round((entry.session.completedAt - entry.session.startedAt) / 60000);
            return (
              <a
                key={entry.session.id}
                href={`#/session/${entry.session.id}`}
                style={{
                  background: pal.card,
                  borderRadius: 16,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  border: `1px solid ${pal.line}`,
                  textDecoration: 'none',
                  color: pal.ink,
                }}
              >
                <div style={{ width: 44, textAlign: 'center', background: pal.bgSoft, borderRadius: 12, padding: '4px 0' }}>
                  <div style={{ fontSize: 9, color: pal.mute, fontWeight: 800, textTransform: 'uppercase' }}>{dayShort}</div>
                  <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1, color: pal.ink, fontVariantNumeric: 'tabular-nums' }}>{date.getDate()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800 }}>
                    Full Body {dayCode(entry.session.dayId)} {day?.name ? `· ${day.name}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: pal.mute, fontWeight: 600, marginTop: 2 }}>
                    {mins} мин · {entry.setsCount} сетов · {formatVolume(entry.volume)}
                  </div>
                </div>
                <MuscleDot primary={entry.primaryMuscles} secondary={entry.secondaryMuscles} size={26} />
              </a>
            );
          })}
        </div>
      </div>

      <BottomNav active="diary" />
    </div>
  );
}
