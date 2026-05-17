import { useEffect, useState } from 'preact/hooks';
import { loadProgram, loadExercises } from '../lib/loadData';
import { Link, navigate } from '../lib/hashRouter';
import { startSession } from '../db/queries';
import type { Program, ExerciseLibrary } from '../types';

const CYR_LETTER: Record<string, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' };
const displayLetter = (id: string) => CYR_LETTER[id] || id;

export function DayDetail({ dayId }: { dayId: string }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);

  useEffect(() => {
    loadProgram().then(setProgram);
    loadExercises().then(setLibrary);
  }, []);

  if (!program || !library) {
    return <div class="p-4 text-zinc-500">Загрузка...</div>;
  }

  const day = program.days.find((d) => d.id === dayId);
  if (!day) {
    return (
      <div class="p-4">
        <Link href="/" class="text-zinc-400 active:text-white">
          ← Главная
        </Link>
        <div class="mt-4 text-rose-400">День не найден</div>
      </div>
    );
  }

  const totalSets = day.exercises.reduce((s, e) => s + e.sets, 0);

  return (
    <div class="min-h-screen bg-black text-white pb-12">
      <header class="sticky top-0 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-5 py-3 z-10">
        <Link href="/" class="text-sm text-zinc-400 active:text-white">
          ← Главная
        </Link>
        <div class="flex items-baseline gap-3 mt-1">
          <h1 class="text-2xl font-bold">День {displayLetter(day.id)}</h1>
          <div class="text-zinc-400">{day.name}</div>
        </div>
        <div class="text-xs text-zinc-500 mt-1">
          {day.exercises.length} упражнений · {totalSets} сетов
        </div>
      </header>

      <div class="px-4 mt-4">
        <button
          type="button"
          onClick={async () => {
            const sessionId = await startSession(day.id);
            navigate(`/session/${sessionId}`);
          }}
          class="w-full h-14 bg-emerald-600 active:bg-emerald-700 rounded-xl text-white font-bold text-lg shadow-lg shadow-emerald-900/40"
        >
          ▶ Начать тренировку
        </button>
      </div>

      <ol class="px-4 mt-4 space-y-3">
        {day.exercises.map((pe, idx) => {
          const ex = library[pe.exerciseId];
          if (!ex) {
            return (
              <li
                key={pe.exerciseId}
                class="p-4 bg-rose-950/40 rounded-xl border border-rose-900/50 text-rose-300"
              >
                Упражнение не найдено: {pe.exerciseId}
              </li>
            );
          }
          return (
            <li key={pe.exerciseId}>
              <Link
                href={`/exercise/${ex.id}`}
                class="block p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 active:bg-zinc-800 transition-colors"
              >
                <div class="flex items-baseline gap-3">
                  <div class="text-zinc-500 text-sm font-mono tabular-nums w-5">
                    {idx + 1}
                  </div>
                  <div class="font-semibold flex-1">{ex.name}</div>
                  <div class="text-zinc-600 text-xs">→</div>
                </div>
                <div class="mt-3 ml-8 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                  <Stat label="подходы" value={String(pe.sets)} />
                  <Stat
                    label="повторы"
                    value={
                      pe.repsMin === pe.repsMax
                        ? String(pe.repsMin)
                        : `${pe.repsMin}–${pe.repsMax}`
                    }
                  />
                  <Stat
                    label="RIR"
                    value={
                      pe.rirMin === pe.rirMax
                        ? String(pe.rirMin)
                        : `${pe.rirMin}–${pe.rirMax}`
                    }
                  />
                  <Stat label="отдых" value={`${pe.restSec}с`} />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div class="flex items-baseline gap-1.5">
      <span class="text-zinc-500 text-xs">{label}</span>
      <span class="font-mono tabular-nums text-white">{value}</span>
    </div>
  );
}
