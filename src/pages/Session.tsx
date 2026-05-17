import { useEffect, useState } from 'preact/hooks';
import { loadProgram, loadExercises } from '../lib/loadData';
import { useLive } from '../lib/useLive';
import { db } from '../db/schema';
import {
  finishSession,
  getLastCompletedSession,
  getSetsForSession,
} from '../db/queries';
import { navigate, Link } from '../lib/hashRouter';
import { ExerciseLogger } from '../components/ExerciseLogger';
import { RestTimerBar } from '../components/RestTimerBar';
import { CompletedSessionView } from '../components/CompletedSessionView';
import { restTimer } from '../lib/useRestTimer';
import type { Program, ExerciseLibrary } from '../types';
import type { SetLogRecord } from '../db/schema';

const CYR_LETTER: Record<string, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' };
const displayLetter = (id: string) => CYR_LETTER[id] || id;

export function Session({ sessionId }: { sessionId: number }) {
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
    return () => {
      cancelled = true;
    };
  }, [session?.dayId, sessionId]);

  if (!session || !program || !library) {
    return <div class="p-4 text-zinc-500">Загрузка...</div>;
  }

  const day = program.days.find((d) => d.id === session.dayId);
  if (!day) {
    return (
      <div class="p-4">
        <Link href="/" class="text-zinc-400 active:text-white">
          ← Главная
        </Link>
        <div class="mt-4 text-rose-400">День программы не найден</div>
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

  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0);
  const completedSets = currentSets.length;

  const handleFinish = async () => {
    if (!confirm('Завершить тренировку?')) return;
    restTimer.stop();
    await finishSession(sessionId);
    navigate('/');
  };

  return (
    <div class="min-h-screen bg-black text-white pb-40">
      <header class="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 z-10">
        <div class="flex items-baseline gap-3">
          <h1 class="text-xl font-bold">День {displayLetter(day.id)}</h1>
          <div class="text-zinc-400 truncate">{day.name}</div>
        </div>
        <div class="mt-2 flex items-center gap-3">
          <div class="text-xs text-zinc-500 tabular-nums shrink-0">
            {completedSets}/{totalSets}
          </div>
          <div class="h-1.5 flex-1 bg-zinc-900 rounded-full overflow-hidden">
            <div
              class="h-full bg-emerald-600 transition-all"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div class="px-4 mt-4 space-y-6">
        {day.exercises.map((pe, i) => {
          const ex = library[pe.exerciseId];
          if (!ex) {
            return (
              <div
                key={pe.exerciseId}
                class="p-3 bg-rose-950/40 rounded text-rose-300"
              >
                Упражнение не найдено: {pe.exerciseId}
              </div>
            );
          }
          return (
            <ExerciseLogger
              key={pe.exerciseId}
              index={i}
              programExercise={pe}
              exercise={ex}
              sessionId={sessionId}
              currentSets={currentSets
                .filter((s) => s.exerciseId === pe.exerciseId)
                .sort((a, b) => a.setIndex - b.setIndex)}
              prevSessionSets={prevSets[pe.exerciseId] || []}
            />
          );
        })}
      </div>

      <div class="px-4 mt-10">
        <button
          type="button"
          onClick={handleFinish}
          class="w-full h-14 bg-zinc-900 border border-zinc-800 active:bg-zinc-800 rounded-xl text-zinc-200 font-bold"
        >
          Завершить тренировку
        </button>
      </div>

      <RestTimerBar />
    </div>
  );
}
