import { useEffect, useState } from 'preact/hooks';
import { loadProgram, loadExercises } from '../lib/loadData';
import { Link, navigate } from '../lib/hashRouter';
import { startSession } from '../db/queries';
import { db } from '../db/schema';
import { useLive } from '../lib/useLive';
import { pal, dayCode } from '../lib/designTokens';
import { MuscleDiagram, MuscleDot } from '../components/MuscleDiagram';
import { toDesignMuscleKeys, designMuscleRu, type DesignMuscleKey } from '../lib/illustrations';
import { formatRange } from '../lib/format';
import type { Program, ExerciseLibrary, MuscleGroup } from '../types';

export function DayDetail({ dayId }: { dayId: string }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);

  useEffect(() => {
    loadProgram().then(setProgram);
    loadExercises().then(setLibrary);
  }, []);

  const sessionCount = useLive(async () => {
    return db.sessions.where('completedAt').above(0).count();
  });

  if (!program || !library) {
    return <div style={{ padding: 20, color: pal.mute }}>Загрузка...</div>;
  }

  const day = program.days.find((d) => d.id === dayId);
  if (!day) {
    return (
      <div style={{ padding: 20 }}>
        <Link href="/" class="text-sm" >← Главная</Link>
        <div style={{ marginTop: 16, color: pal.terraD }}>День не найден</div>
      </div>
    );
  }

  // Aggregate primary muscles for the day → design keys
  const primaryGroups: MuscleGroup[] = [];
  const secondaryGroups: MuscleGroup[] = [];
  for (const pe of day.exercises) {
    const ex = library[pe.exerciseId];
    if (!ex) continue;
    primaryGroups.push(...ex.primaryMuscles);
    secondaryGroups.push(...ex.secondaryMuscles);
  }
  const allKeys: DesignMuscleKey[] = toDesignMuscleKeys([...primaryGroups, ...secondaryGroups]);
  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0);
  const estMin = Math.round(totalSets * 2.5);

  const start = async () => {
    const id = await startSession(day.id);
    navigate(`/session/${id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 110, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '34px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#/" style={iconBtn()}>
          <svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={pal.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700, letterSpacing: 0.5 }}>
          СЕССИЯ {(sessionCount ?? 0) + 1}
        </div>
        <div style={{ ...iconBtn(), fontWeight: 900, fontSize: 16 }}>···</div>
      </div>

      {/* Title + muscle map */}
      <div style={{ padding: '24px 20px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: pal.peachD, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Сегодня
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginTop: 4, lineHeight: 1, color: pal.ink }}>
            Full Body<br/>{dayCode(day.id)}.
          </div>
          <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700, marginTop: 8 }}>
            {day.name}
          </div>
        </div>
        <div style={{ background: pal.bgSoft, borderRadius: 18, padding: 10 }}>
          <MuscleDiagram primary={primaryGroups} secondary={secondaryGroups} size={72} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 8 }}>
        {[[String(estMin), 'мин'], [String(day.exercises.length), 'упр'], [String(totalSets), 'сетов']].map(([v, l], i) => (
          <div key={i} style={{ flex: 1, background: pal.card, borderRadius: 16, padding: '10px 12px', border: `1px solid ${pal.line}` }}>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, color: pal.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            <div style={{ fontSize: 10, color: pal.mute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Muscle chips */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {allKeys.map((m) => (
          <span key={m} style={{ fontSize: 11, fontWeight: 800, color: pal.ink2, background: pal.bgSoft, padding: '4px 10px', borderRadius: 100, letterSpacing: 0.3 }}>
            {designMuscleRu(m)}
          </span>
        ))}
      </div>

      {/* Exercise list */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {day.exercises.map((pe, i) => {
          const ex = library[pe.exerciseId];
          if (!ex) {
            return (
              <div key={`${pe.exerciseId}-${i}`} style={{ padding: 12, background: pal.rose, borderRadius: 16, color: pal.plum }}>
                Упражнение не найдено: {pe.exerciseId}
              </div>
            );
          }
          const inSuperset = pe.supersetGroup != null;
          const isPairFirst = inSuperset && pe.supersetLabel === 'А';
          const isPairLast = inSuperset && pe.supersetLabel === 'Б';
          const label = inSuperset
            ? `${pe.supersetGroup}${pe.supersetLabel || ''}`
            : String(i + 1).padStart(2, '0');
          return (
            <a
              key={`${pe.exerciseId}-${i}`}
              href={`#/exercise/${ex.id}`}
              style={{
                background: pal.card,
                borderRadius: 16,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                border: inSuperset ? `1.5px solid ${pal.peach}` : `1px solid ${pal.line}`,
                textDecoration: 'none',
                color: pal.ink,
                position: 'relative',
                marginBottom: isPairFirst ? -4 : 0,
                marginTop: isPairLast ? -4 : 0,
                borderTopLeftRadius: isPairLast ? 8 : 16,
                borderTopRightRadius: isPairLast ? 8 : 16,
                borderBottomLeftRadius: isPairFirst ? 8 : 16,
                borderBottomRightRadius: isPairFirst ? 8 : 16,
              }}
            >
              <div style={{
                width: 26,
                fontSize: 11,
                fontWeight: 900,
                color: inSuperset ? pal.terraD : pal.muteSoft,
                fontFamily: 'ui-monospace,monospace',
                textAlign: 'center',
              }}>
                {label}
              </div>
              <MuscleDot primary={ex.primaryMuscles} secondary={ex.secondaryMuscles} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ex.name}
                </div>
                <div style={{ fontSize: 11, color: pal.mute, fontWeight: 700, marginTop: 1 }}>
                  {pe.sets} × {formatRange(pe.repsMin, pe.repsMax)} · RIR {formatRange(pe.rirMin, pe.rirMax)} · {pe.restSec}с
                  {inSuperset && (
                    <span style={{ color: pal.terraD, fontWeight: 800 }}> · 🔗 суперсет</span>
                  )}
                </div>
                {pe.note && (
                  <div style={{ fontSize: 10.5, color: pal.terraD, fontWeight: 700, fontStyle: 'italic', marginTop: 2 }}>
                    {pe.note}
                  </div>
                )}
              </div>
              <svg width="6" height="10" viewBox="0 0 6 10"><path d="M1 1l4 4-4 4" stroke={pal.muteSoft} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 20px 0' }}>
        <button
          type="button"
          onClick={start}
          style={{
            width: '100%',
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
            cursor: 'pointer',
          }}
        >
          Начать тренировку →
        </button>
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
