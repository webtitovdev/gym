import type { SetLogRecord, SessionRecord } from '../db/schema';
import type { ExerciseLibrary, Day, MuscleGroup } from '../types';
import { pal, dayCode, DOW_RU_SHORT } from '../lib/designTokens';
import { MuscleDiagram, MuscleDot } from './MuscleDiagram';
import { formatVolume } from '../lib/stats';

const MONTH_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

interface Props {
  session: SessionRecord;
  day: Day;
  library: ExerciseLibrary;
  sets: SetLogRecord[];
}

export function CompletedSessionView({ session, day, library, sets }: Props) {
  const date = new Date(session.completedAt);
  const mins = Math.round((session.completedAt - session.startedAt) / 60000);
  const totalPlanned = day.exercises.reduce((s, e) => s + e.sets, 0);
  const totalVolume = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  // Aggregate worked muscles
  const primary: MuscleGroup[] = [];
  const secondary: MuscleGroup[] = [];
  for (const s of sets) {
    const ex = library[s.exerciseId];
    if (!ex) continue;
    primary.push(...ex.primaryMuscles);
    secondary.push(...ex.secondaryMuscles);
  }

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 24, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '34px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#/" style={iconBtn()}>
          <svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={pal.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {DOW_RU_SHORT[date.getDay()]} · {date.getDate()} {MONTH_RU[date.getMonth()]}
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Title + map */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.8, lineHeight: 1, color: pal.ink }}>
            Full Body {dayCode(day.id)}
          </div>
          <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700, marginTop: 4 }}>
            {day.name}
          </div>
        </div>
        <div style={{ background: pal.bgSoft, borderRadius: 14, padding: 8 }}>
          <MuscleDiagram primary={primary} secondary={secondary} size={56} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 7 }}>
        {[
          [`${mins}м`, 'Время', pal.card],
          [`${sets.length}/${totalPlanned}`, 'Сетов', pal.card],
          [formatVolume(Math.round(totalVolume)), 'Объём', pal.card],
        ].map(([v, l, bg], i) => (
          <div key={i} style={{ flex: 1, background: bg, borderRadius: 14, padding: '10px 0', textAlign: 'center', border: `1px solid ${pal.line}` }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: pal.ink, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            <div style={{ fontSize: 9, color: pal.mute, fontWeight: 800, textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* What you did */}
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
                  <MuscleDot primary={ex.primaryMuscles} secondary={ex.secondaryMuscles} size={22} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 800, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                  <div style={{ fontSize: 10, color: exSets.length === pe.sets ? pal.terra : pal.mute, fontWeight: 800 }}>
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
