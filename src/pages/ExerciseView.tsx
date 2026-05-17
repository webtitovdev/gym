import { useEffect, useState } from 'preact/hooks';
import { loadExercises, muscleRu, equipmentRu } from '../lib/loadData';
import { Link } from '../lib/hashRouter';
import { ExerciseStats } from '../components/ExerciseStats';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { MuscleDiagram } from '../components/MuscleDiagram';
import type { ExerciseLibrary } from '../types';

export function ExerciseView({ exerciseId }: { exerciseId: string }) {
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);

  useEffect(() => {
    loadExercises().then(setLibrary);
  }, []);

  if (!library) return <div class="p-4 text-zinc-500">Загрузка...</div>;
  const ex = library[exerciseId];
  if (!ex) {
    return (
      <div class="p-4">
        <Link href="/" class="text-zinc-400 active:text-white">
          ← Главная
        </Link>
        <div class="mt-4 text-rose-400">Упражнение не найдено</div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-black text-white pb-12">
      <header class="sticky top-0 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-5 py-3 z-10">
        <button
          onClick={() => history.back()}
          class="text-sm text-zinc-400 active:text-white"
        >
          ← Назад
        </button>
        <h1 class="text-xl font-bold mt-1">{ex.name}</h1>
        <div class="text-xs text-zinc-500 mt-0.5">
          {equipmentRu(ex.equipment)}
          {ex.unilateral ? ' · одной рукой' : ''}
        </div>
      </header>

      <ExerciseMedia
        imageUrl={ex.imageUrl}
        imageUrlEnd={ex.imageUrlEnd}
        altText={ex.name}
      />

      <div class="px-4 mt-5 space-y-6">
        <section>
          <h2 class="px-1 text-[11px] uppercase tracking-[0.15em] text-emerald-400 font-semibold mb-2">
            Техника
          </h2>
          <ul class="space-y-2">
            {ex.cues.map((cue, i) => (
              <li
                key={i}
                class="flex gap-3 p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800"
              >
                <div class="shrink-0 w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold flex items-center justify-center tabular-nums">
                  {i + 1}
                </div>
                <div class="text-[15px] leading-relaxed">{cue}</div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 class="px-1 text-[11px] uppercase tracking-[0.15em] text-rose-400 font-semibold mb-2">
            Не делай
          </h2>
          <ul class="space-y-2">
            {ex.mistakes.map((m, i) => (
              <li
                key={i}
                class="flex gap-3 p-3.5 bg-rose-950/30 rounded-xl border border-rose-900/40"
              >
                <div class="shrink-0 w-6 h-6 rounded-full bg-rose-950 text-rose-400 text-sm font-bold flex items-center justify-center">
                  ✕
                </div>
                <div class="text-[15px] leading-relaxed">{m}</div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 class="px-1 text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-3">
            Целевые мышцы
          </h2>
          <div class="p-3 bg-zinc-900/40 rounded-xl border border-zinc-900">
            <MuscleDiagram
              primary={ex.primaryMuscles}
              secondary={ex.secondaryMuscles}
            />
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            {ex.primaryMuscles.map((m) => (
              <span
                key={m}
                class="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 rounded-full text-xs border border-emerald-900/60 font-medium"
              >
                {muscleRu(m)}
              </span>
            ))}
            {ex.secondaryMuscles.map((m) => (
              <span
                key={m}
                class="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded-full text-xs border border-zinc-800"
              >
                {muscleRu(m)}
              </span>
            ))}
          </div>
        </section>

        {ex.youtubeUrl && (
          <a
            href={ex.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="block p-4 bg-zinc-900 rounded-xl border border-zinc-800 active:bg-zinc-800 text-center text-zinc-300"
          >
            ▶ Открыть разбор на YouTube
          </a>
        )}

        <ExerciseStats exerciseId={ex.id} />
      </div>
    </div>
  );
}
