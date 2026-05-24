import { useEffect, useState } from 'preact/hooks';
import { loadProgram, loadExercises } from '../lib/loadData';
import { db } from '../db/schema';
import { useLive } from '../lib/useLive';
import { pal, dayCode, formatDayDate } from '../lib/designTokens';
import { MuscleDiagram } from '../components/MuscleDiagram';
import { formatVolume } from '../lib/stats';
import { epley } from '../lib/oneRM';
import type { Program, ExerciseLibrary, MuscleGroup } from '../types';

export function SessionDone({ sessionId }: { sessionId: number }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);
  const [prCount, setPrCount] = useState<number | null>(null);

  const session = useLive(() => db.sessions.get(sessionId), [sessionId]);
  const sets =
    useLive(
      () => db.setLogs.where('sessionId').equals(sessionId).toArray(),
      [sessionId]
    ) ?? [];

  useEffect(() => {
    loadProgram().then(setProgram);
    loadExercises().then(setLibrary);
  }, []);

  // Compute PR count — how many exercises hit a new all-time best 1RM in this session
  useEffect(() => {
    if (!sets.length || !session) {
      setPrCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      const exIds = Array.from(new Set(sets.map((s) => s.exerciseId)));
      let prs = 0;
      for (const exId of exIds) {
        const sessionSets = sets.filter((s) => s.exerciseId === exId);
        if (!sessionSets.length) continue;
        const sessionMax = Math.max(...sessionSets.map((s) => epley(s.weight, s.reps)));
        // Get all OTHER sets for this exercise (different session)
        const allOther = await db.setLogs
          .where('exerciseId').equals(exId)
          .and((s) => s.sessionId !== sessionId)
          .toArray();
        const allTimeMax = allOther.length
          ? Math.max(...allOther.map((s) => epley(s.weight, s.reps)))
          : 0;
        if (sessionMax > allTimeMax && sessionMax > 0) prs++;
      }
      if (!cancelled) setPrCount(prs);
    })();
    return () => { cancelled = true; };
  }, [sets, session, sessionId]);

  if (!session || !program || !library) {
    return <div style={{ padding: 20, color: pal.mute }}>Загрузка...</div>;
  }
  const day = program.days.find((d) => d.id === session.dayId);
  if (!day) {
    return (
      <div style={{ padding: 20 }}>
        <a href="#/" style={{ color: pal.mute, textDecoration: 'none' }}>← Главная</a>
        <div style={{ marginTop: 16, color: pal.terraD }}>День не найден</div>
      </div>
    );
  }

  const durationMin = session.completedAt > 0
    ? Math.round((session.completedAt - session.startedAt) / 60000)
    : Math.round((Date.now() - session.startedAt) / 60000);
  const plannedSets = day.exercises.reduce((s, e) => s + e.sets, 0);
  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  // Aggregate primary muscles worked
  const primary: MuscleGroup[] = [];
  const secondary: MuscleGroup[] = [];
  for (const s of sets) {
    const ex = library[s.exerciseId];
    if (!ex) continue;
    primary.push(...ex.primaryMuscles);
    secondary.push(...ex.secondaryMuscles);
  }

  const dateLabel = session.completedAt > 0
    ? formatDayDate(new Date(session.completedAt))
    : formatDayDate(new Date());

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 24, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '34px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#/" style={iconBtn()}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke={pal.ink} strokeWidth="2" strokeLinecap="round"/></svg>
        </a>
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
          Тренировка завершена
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Celebration */}
      <div style={{ padding: '30px 20px 0' }}>
        <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, lineHeight: 0.95, color: pal.ink }}>
          Готово.<br/>
          <span style={{ color: pal.peachD }}>Отличная работа!</span>
        </div>
        <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700, marginTop: 12, textTransform: 'capitalize' }}>
          Full Body {dayCode(day.id)} · {dateLabel} · {durationMin} мин
        </div>
      </div>

      {/* Stats grid + muscle map */}
      <div style={{ padding: '24px 20px 0', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            [`${durationMin}м`, 'Время', pal.peachL],
            [`${sets.length}/${plannedSets}`, 'Сетов', pal.rose],
            [formatVolume(Math.round(totalVolume)), 'Объём', pal.lavender],
            [prCount !== null ? String(prCount) : '—', prCount === 1 ? 'Новый PR' : 'Новых PR', pal.butter],
          ].map(([v, l, bg], i) => (
            <div key={i} style={{ background: bg, borderRadius: 14, padding: '10px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: pal.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              <div style={{ fontSize: 10, color: pal.ink2, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ width: 132, background: pal.card, borderRadius: 18, padding: 8, border: `1px solid ${pal.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <MuscleDiagram primary={primary} secondary={secondary} size={96} />
          <div style={{ fontSize: 9, color: pal.mute, fontWeight: 800, marginTop: 4, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Работали
          </div>
        </div>
      </div>

      {/* Per-exercise summary */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Что сделано
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {day.exercises.map((pe) => {
            const ex = library[pe.exerciseId];
            const exSets = sets.filter((s) => s.exerciseId === pe.exerciseId).sort((a, b) => a.setIndex - b.setIndex);
            if (!ex) return null;
            return (
              <div key={pe.exerciseId} style={{ background: pal.card, borderRadius: 14, padding: '10px 12px', border: `1px solid ${pal.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: exSets.length ? 6 : 0 }}>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>{ex.name}</div>
                  <div style={{ fontSize: 10, color: exSets.length === pe.sets ? pal.terra : pal.mute, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                    {exSets.length}/{pe.sets}
                  </div>
                </div>
                {exSets.length > 0 && (
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {exSets.map((s) => (
                      <span key={s.id} style={{ fontSize: 10.5, fontWeight: 800, color: pal.ink2, background: pal.bgSoft, padding: '3px 8px', borderRadius: 8, fontFamily: 'ui-monospace,monospace' }}>
                        {s.weight > 0 ? `${s.weight}кг×${s.reps}` : `×${s.reps}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 20px 24px' }}>
        <a
          href="#/"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '16px 0',
            background: pal.ink,
            color: pal.peachL,
            border: 'none',
            borderRadius: 22,
            fontFamily: 'inherit',
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: 0.5,
            boxShadow: '0 10px 24px rgba(42,36,33,0.25)',
            textDecoration: 'none',
          }}
        >
          На главную
        </a>
      </div>
    </div>
  );
}

function iconBtn(): import('preact').JSX.CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: 12,
    background: pal.card,
    border: `1px solid ${pal.line}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: pal.ink,
    textDecoration: 'none',
  };
}
