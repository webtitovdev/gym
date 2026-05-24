import { useEffect, useState } from 'preact/hooks';
import { loadExercises, equipmentRu } from '../lib/loadData';
import { pal } from '../lib/designTokens';
import { MuscleDiagram } from '../components/MuscleDiagram';
import { ExerciseGif } from '../components/ExerciseGif';
import { ExerciseStats } from '../components/ExerciseStats';
import { toDesignMuscleKeys, designMuscleRu } from '../lib/illustrations';
import type { ExerciseLibrary } from '../types';

export function ExerciseView({ exerciseId }: { exerciseId: string }) {
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);

  useEffect(() => {
    loadExercises().then(setLibrary);
  }, []);

  if (!library) return <div style={{ padding: 20, color: pal.mute }}>Загрузка...</div>;
  const ex = library[exerciseId];
  if (!ex) {
    return (
      <div style={{ padding: 20 }}>
        <a href="#/" style={{ color: pal.mute, textDecoration: 'none' }}>← Главная</a>
        <div style={{ marginTop: 16, color: pal.terraD }}>Упражнение не найдено</div>
      </div>
    );
  }

  const primaryKeys = toDesignMuscleKeys(ex.primaryMuscles);

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 32, maxWidth: 480, margin: '0 auto' }}>
      {/* Top bar */}
      <div style={{ padding: '34px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => history.back()} style={iconBtn()}>
          <svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke={pal.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Упражнение
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Animated illustration */}
      <div style={{ padding: '20px 20px 0' }}>
        <ExerciseGif
          imageUrl={ex.imageUrl}
          imageUrlEnd={ex.imageUrlEnd}
          exerciseId={ex.id}
          altText={ex.name}
          height={240}
        />
      </div>

      {/* Title + tags */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, lineHeight: 1.1, color: pal.ink }}>
          {ex.name}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
          {primaryKeys.slice(0, 3).map((m) => (
            <span key={m} style={{ fontSize: 10, fontWeight: 800, color: pal.ink2, background: pal.bgSoft, padding: '4px 10px', borderRadius: 100, letterSpacing: 0.3 }}>
              {designMuscleRu(m)}
            </span>
          ))}
          <span style={{ fontSize: 10, fontWeight: 800, color: pal.terraD, background: pal.peachL, padding: '4px 10px', borderRadius: 100, textTransform: 'capitalize' }}>
            {equipmentRu(ex.equipment)}
          </span>
          {ex.unilateral && (
            <span style={{ fontSize: 10, fontWeight: 800, color: pal.ink2, background: pal.lavender, padding: '4px 10px', borderRadius: 100 }}>
              одной рукой
            </span>
          )}
        </div>
      </div>

      {/* Muscle map + best stat */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: pal.card, borderRadius: 16, padding: '10px 12px', border: `1px solid ${pal.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <MuscleDiagram primary={ex.primaryMuscles} secondary={ex.secondaryMuscles} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Основные</div>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2, lineHeight: 1.2 }}>
              {primaryKeys.map(designMuscleRu).join(', ')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats / progress chart */}
      <div style={{ padding: '16px 20px 0' }}>
        <ExerciseStats exerciseId={ex.id} />
      </div>

      {/* Cues */}
      {ex.cues.length > 0 && (
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ fontSize: 11, color: pal.mute, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Техника
          </div>
          <div style={{ background: pal.card, borderRadius: 18, padding: '14px 16px', border: `1px solid ${pal.line}` }}>
            {ex.cues.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, fontWeight: 600, color: pal.ink2, lineHeight: 1.45, marginTop: i === 0 ? 0 : 8 }}>
                <span style={{ color: pal.terra, fontWeight: 900, lineHeight: 1.4 }}>·</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mistakes */}
      {ex.mistakes.length > 0 && (
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ fontSize: 11, color: pal.plum, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Не делай
          </div>
          <div style={{ background: pal.rose, borderRadius: 18, padding: '14px 16px' }}>
            {ex.mistakes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, fontWeight: 600, color: pal.plum, lineHeight: 1.45, marginTop: i === 0 ? 0 : 8 }}>
                <span style={{ fontWeight: 900 }}>✕</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube link */}
      {ex.youtubeUrl && (
        <div style={{ padding: '20px 20px 0' }}>
          <a
            href={ex.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '14px 0',
              background: pal.card,
              border: `1.5px solid ${pal.line}`,
              borderRadius: 22,
              textAlign: 'center',
              color: pal.ink,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            ▶ Открыть на YouTube
          </a>
        </div>
      )}
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
    cursor: 'pointer',
  };
}
