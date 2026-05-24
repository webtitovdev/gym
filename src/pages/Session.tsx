import { useEffect, useState } from 'preact/hooks';
import { loadProgram, loadExercises } from '../lib/loadData';
import { useLive } from '../lib/useLive';
import { db } from '../db/schema';
import {
  finishSession,
  getLastCompletedSession,
  getSetsForSession,
  logSet,
} from '../db/queries';
import { navigate } from '../lib/hashRouter';
import { pal, dayCode } from '../lib/designTokens';
import { MuscleDiagram } from '../components/MuscleDiagram';
import { ExerciseGif } from '../components/ExerciseGif';
import { Stepper } from '../components/Stepper';
import { CompletedSessionView } from '../components/CompletedSessionView';
import { computeSetDefaults } from '../lib/progression';
import { formatWeight } from '../lib/format';
import type { Program, ExerciseLibrary } from '../types';
import type { SetLogRecord } from '../db/schema';

interface Props {
  sessionId: number;
  exerciseIdx?: number;
}

export function Session({ sessionId, exerciseIdx = 0 }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);
  const [prevSets, setPrevSets] = useState<Record<string, SetLogRecord[]>>({});

  const session = useLive(() => db.sessions.get(sessionId), [sessionId]);
  const currentSets =
    useLive(
      () => db.setLogs.where('sessionId').equals(sessionId).toArray(),
      [sessionId]
    ) ?? [];

  useEffect(() => {
    loadProgram().then(setProgram);
    loadExercises().then(setLibrary);
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const last = await getLastCompletedSession(session.dayId, sessionId);
      if (!last?.id) {
        if (!cancelled) setPrevSets({});
        return;
      }
      const lastSets = await getSetsForSession(last.id);
      const grouped: Record<string, SetLogRecord[]> = {};
      for (const s of lastSets) {
        if (!grouped[s.exerciseId]) grouped[s.exerciseId] = [];
        grouped[s.exerciseId].push(s);
      }
      if (!cancelled) setPrevSets(grouped);
    })();
    return () => { cancelled = true; };
  }, [session?.dayId, sessionId]);

  if (!session || !program || !library) {
    return <div style={{ padding: 20, color: pal.mute }}>Загрузка...</div>;
  }

  const day = program.days.find((d) => d.id === session.dayId);
  if (!day) {
    return (
      <div style={{ padding: 20 }}>
        <a href="#/" style={{ color: pal.mute, textDecoration: 'none' }}>← Главная</a>
        <div style={{ marginTop: 16, color: pal.terraD }}>День программы не найден</div>
      </div>
    );
  }

  if (session.completedAt > 0) {
    return (
      <CompletedSessionView
        session={session}
        day={day}
        library={library}
        sets={currentSets.sort((a, b) => a.setIndex - b.setIndex)}
      />
    );
  }

  // Clamp exerciseIdx
  const totalEx = day.exercises.length;
  const idx = Math.max(0, Math.min(exerciseIdx, totalEx - 1));
  const pe = day.exercises[idx];
  const ex = library[pe.exerciseId];

  if (!ex) {
    return <div style={{ padding: 20, color: pal.terraD }}>Упражнение не найдено: {pe.exerciseId}</div>;
  }

  const setsForThisEx = currentSets
    .filter((s) => s.exerciseId === ex.id)
    .sort((a, b) => a.setIndex - b.setIndex);
  const prevForThisEx = prevSets[ex.id] || [];

  // Build sets array — done sets + "now" + pending
  const setEntries: Array<{
    index: number;
    done?: SetLogRecord;
    isCurrent?: boolean;
  }> = [];
  let nowFound = false;
  for (let i = 0; i < pe.sets; i++) {
    const done = setsForThisEx.find((s) => s.setIndex === i);
    if (done) {
      setEntries.push({ index: i, done });
    } else if (!nowFound) {
      setEntries.push({ index: i, isCurrent: true });
      nowFound = true;
    } else {
      setEntries.push({ index: i });
    }
  }
  const currentEntry = setEntries.find((e) => e.isCurrent);
  const currentSetIdx = currentEntry?.index ?? -1;
  const allSetsDone = currentSetIdx === -1;

  const finish = async () => {
    if (!confirm('Завершить тренировку?')) return;
    await finishSession(sessionId);
    navigate(`/done/${sessionId}`);
  };

  const goPrev = () => navigate(`/session/${sessionId}/${Math.max(0, idx - 1)}`);
  const goNext = () => navigate(`/session/${sessionId}/${idx + 1}`);

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 100, maxWidth: 480, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ padding: '34px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="#/" style={iconBtn()}>
          <svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={pal.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: pal.mute, fontWeight: 700, letterSpacing: 0.5 }}>
            FULL BODY {dayCode(day.id)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            Упражнение <span style={{ color: pal.peachD }}>{idx + 1}</span> / {totalEx}
          </div>
        </div>
        <button type="button" onClick={finish} style={iconBtnButton()}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M1 1l12 12M13 1L1 13" stroke={pal.ink} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Animated illustration */}
      <div style={{ padding: '20px 20px 0' }}>
        <ExerciseGif
          imageUrl={ex.imageUrl}
          imageUrlEnd={ex.imageUrlEnd}
          exerciseId={ex.id}
          altText={ex.name}
          height={200}
        />
      </div>

      {/* Title + small muscle map */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href={`#/exercise/${ex.id}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: pal.ink }}>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ex.name}
          </div>
          <div style={{ fontSize: 10.5, color: pal.mute, fontWeight: 700, marginTop: 2 }}>
            {pe.sets} × {pe.repsMin}–{pe.repsMax} · RIR {pe.rirMin === pe.rirMax ? pe.rirMin : `${pe.rirMin}–${pe.rirMax}`} · отдых {pe.restSec}с
          </div>
        </a>
        <div style={{ background: pal.bgSoft, borderRadius: 12, padding: 4, flexShrink: 0 }}>
          <MuscleDiagram primary={ex.primaryMuscles} secondary={ex.secondaryMuscles} size={44} />
        </div>
      </div>

      {/* Sets row */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 6 }}>
        {setEntries.map((entry) => {
          const { index, done, isCurrent } = entry;
          return (
            <div
              key={index}
              style={{
                flex: 1,
                background: isCurrent ? pal.peachL : (done ? pal.card : pal.bgSoft),
                borderRadius: 12,
                padding: '8px 0',
                textAlign: 'center',
                border: isCurrent ? `2px solid ${pal.terra}` : `1px solid ${pal.line}`,
                position: 'relative',
                minHeight: 56,
              }}
            >
              <div style={{ fontSize: 9, color: pal.mute, fontWeight: 800, letterSpacing: 0.5 }}>
                СЕТ {index + 1}
              </div>
              {done ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 900, color: pal.ink, marginTop: 2 }}>
                    {formatWeight(done.weight)}<span style={{ fontSize: 9, color: pal.mute }}>кг</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: pal.ink2 }}>×{done.reps}</div>
                  <div style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: pal.terra,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="8" height="7" viewBox="0 0 8 7"><path d="M1 3.5L3 5.5l4-4.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </>
              ) : isCurrent ? (
                <div style={{ fontSize: 12, fontWeight: 900, color: pal.terraD, marginTop: 6 }}>СЕЙЧАС</div>
              ) : (
                <div style={{ fontSize: 12, color: pal.muteSoft, fontWeight: 700, marginTop: 6 }}>—</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline logger or done message */}
      {!allSetsDone ? (
        <SetLogPanel
          sessionId={sessionId}
          exerciseId={ex.id}
          setIndex={currentSetIdx}
          programExercise={pe}
          exercise={ex}
          prevSessionSets={prevForThisEx}
        />
      ) : (
        <div style={{
          margin: '16px 20px 0',
          background: pal.peachL,
          borderRadius: 20,
          padding: 16,
          border: `1px solid ${pal.peach}`,
        }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: pal.ink }}>Упражнение готово ✓</div>
          <div style={{ fontSize: 12, color: pal.terraD, fontWeight: 700, marginTop: 4 }}>
            Все {pe.sets} сета записаны
          </div>
        </div>
      )}

      {/* Cues */}
      {ex.cues.length > 0 && (
        <div style={{ margin: '16px 20px 0', background: pal.bgSoft, borderRadius: 18, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Техника
          </div>
          {ex.cues.slice(0, 4).map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 600, color: pal.ink2, lineHeight: 1.4, marginTop: i === 0 ? 0 : 4 }}>
              <span style={{ color: pal.terra, fontWeight: 900 }}>·</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mistakes (compact) */}
      {ex.mistakes.length > 0 && (
        <div style={{ margin: '12px 20px 0', background: pal.rose, borderRadius: 18, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: pal.plum, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Не делай
          </div>
          {ex.mistakes.slice(0, 3).map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, fontWeight: 600, color: pal.plum, lineHeight: 1.4, marginTop: i === 0 ? 0 : 4 }}>
              <span style={{ fontWeight: 900 }}>✕</span>
              <span>{m}</span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ padding: '20px 20px 24px', display: 'flex', gap: 8 }}>
        {idx > 0 && (
          <button
            type="button"
            onClick={goPrev}
            style={{
              padding: '14px 20px',
              background: pal.card,
              color: pal.ink,
              border: `1.5px solid ${pal.line}`,
              borderRadius: 22,
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ←
          </button>
        )}
        {idx < totalEx - 1 ? (
          <button
            type="button"
            onClick={goNext}
            style={{
              flex: 1,
              padding: '14px 0',
              background: allSetsDone ? pal.ink : pal.card,
              color: allSetsDone ? pal.peachL : pal.ink,
              border: allSetsDone ? 'none' : `1.5px solid ${pal.ink}`,
              borderRadius: 22,
              fontFamily: 'inherit',
              fontWeight: allSetsDone ? 900 : 800,
              fontSize: allSetsDone ? 15 : 13,
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            {allSetsDone ? 'Следующее упражнение →' : 'Пропустить →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            style={{
              flex: 1,
              padding: '14px 0',
              background: pal.terra,
              color: '#fff',
              border: 'none',
              borderRadius: 22,
              fontFamily: 'inherit',
              fontWeight: 900,
              fontSize: 15,
              cursor: 'pointer',
              letterSpacing: 0.3,
              boxShadow: '0 10px 24px rgba(220,145,118,0.35)',
            }}
          >
            Завершить тренировку ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Inline logger for the current set
// ─────────────────────────────────────────────────────────────
function SetLogPanel({
  sessionId,
  exerciseId,
  setIndex,
  programExercise,
  exercise,
  prevSessionSets,
}: {
  sessionId: number;
  exerciseId: string;
  setIndex: number;
  programExercise: import('../types').ProgramExercise;
  exercise: import('../types').Exercise;
  prevSessionSets: SetLogRecord[];
}) {
  const defaults = computeSetDefaults(setIndex, prevSessionSets, programExercise, exercise);
  const [weight, setWeight] = useState(defaults.weight);
  const [reps, setReps] = useState(defaults.reps);
  const [rir, setRir] = useState(defaults.rir);

  // Re-init when set changes
  useEffect(() => {
    setWeight(defaults.weight);
    setReps(defaults.reps);
    setRir(defaults.rir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIndex, exerciseId]);

  const save = async () => {
    await logSet({
      sessionId,
      exerciseId,
      setIndex,
      weight,
      reps,
      rir,
    });
  };

  const prevSet = prevSessionSets.find((s) => s.setIndex === setIndex);
  const sameAsLast =
    prevSet && prevSet.weight === defaults.weight && prevSet.reps === defaults.reps;

  return (
    <div style={{ margin: '16px 20px 0', background: pal.card, borderRadius: 20, padding: 14, border: `1px solid ${pal.line}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Записать сет {setIndex + 1}
        </div>
        {sameAsLast && (
          <div style={{ fontSize: 10, color: pal.terra, fontWeight: 800, background: pal.peachL, padding: '2px 8px', borderRadius: 100 }}>
            как в прошлый раз
          </div>
        )}
        {!sameAsLast && defaults.progressionHint && (
          <div style={{ fontSize: 10, color: pal.terra, fontWeight: 800, background: pal.peachL, padding: '2px 8px', borderRadius: 100, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            💡 {defaults.progressionHint}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <Stepper value={weight} onChange={setWeight} step={exercise.weightIncrement} unit="кг" />
        <Stepper value={reps} onChange={setReps} step={1} min={0} max={100} unit="повт" />
      </div>
      {/* RIR row — compact */}
      <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
        <div style={{ fontSize: 10, color: pal.mute, fontWeight: 800, alignSelf: 'center', marginRight: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>RIR</div>
        {[0, 1, 2, 3, 4, 5].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setRir(opt)}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 9,
              fontWeight: 800,
              fontSize: 12,
              background: rir === opt ? pal.ink : pal.bgSoft,
              color: rir === opt ? pal.peachL : pal.ink2,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {prevSet && (
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 700, marginTop: 10 }}>
          Прошлый сет: <span style={{ fontFamily: 'ui-monospace,monospace', color: pal.ink2 }}>
            {formatWeight(prevSet.weight)}кг × {prevSet.reps} · R{prevSet.rir}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={save}
        style={{
          width: '100%',
          marginTop: 12,
          padding: '14px 0',
          background: pal.ink,
          color: pal.peachL,
          border: 'none',
          borderRadius: 14,
          fontFamily: 'inherit',
          fontWeight: 900,
          fontSize: 14,
          letterSpacing: 0.5,
          cursor: 'pointer',
        }}
      >
        Записать сет
      </button>
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
function iconBtnButton(): import('preact').JSX.CSSProperties {
  return {
    ...iconBtn(),
    cursor: 'pointer',
  };
}
