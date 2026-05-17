import type { SetLogRecord, SessionRecord } from '../db/schema';
import type { ExerciseLibrary, Day } from '../types';
import { Link } from '../lib/hashRouter';
import { formatWeight, formatRange } from '../lib/format';

const CYR_LETTER: Record<string, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' };
const displayLetter = (id: string) => CYR_LETTER[id] || id;

interface Props {
  session: SessionRecord;
  day: Day;
  library: ExerciseLibrary;
  sets: SetLogRecord[];
}

export function CompletedSessionView({ session, day, library, sets }: Props) {
  const date = new Date(session.completedAt);
  const elapsed = Math.round((session.completedAt - session.startedAt) / 60000);
  const totalPlannedSets = day.exercises.reduce((s, e) => s + e.sets, 0);

  return (
    <div class="min-h-screen bg-black text-white pb-12">
      <header class="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 z-10">
        <div class="flex items-center gap-3 text-sm">
          <Link href="/" class="text-zinc-400 active:text-white">
            ← Главная
          </Link>
          <span class="text-zinc-700">·</span>
          <Link href="/history" class="text-zinc-400 active:text-white">
            История
          </Link>
        </div>
        <div class="flex items-baseline gap-3 mt-1">
          <h1 class="text-xl font-bold">День {displayLetter(day.id)}</h1>
          <div class="text-zinc-400 truncate">{day.name}</div>
        </div>
        <div class="text-xs text-zinc-500 mt-1 tabular-nums">
          {date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {' · '}
          {date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' · '}
          {elapsed}мин · {sets.length}/{totalPlannedSets} сетов
        </div>
      </header>

      <div class="px-4 mt-4 space-y-6">
        {day.exercises.map((pe, i) => {
          const ex = library[pe.exerciseId];
          const exSets = sets
            .filter((s) => s.exerciseId === pe.exerciseId)
            .sort((a, b) => a.setIndex - b.setIndex);
          return (
            <section key={pe.exerciseId}>
              <Link
                href={`/exercise/${pe.exerciseId}`}
                class="flex items-baseline justify-between active:opacity-60 px-1"
              >
                <div class="flex items-baseline gap-2 min-w-0">
                  <div class="text-zinc-500 text-sm font-mono tabular-nums">
                    {i + 1}.
                  </div>
                  <h2 class="font-bold text-white truncate">
                    {ex?.name ?? pe.exerciseId}
                  </h2>
                  <div class="text-zinc-600 text-xs shrink-0">ⓘ</div>
                </div>
                <div
                  class={`text-xs tabular-nums shrink-0 ml-2 font-mono ${
                    exSets.length === pe.sets ? 'text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {exSets.length}/{pe.sets}
                </div>
              </Link>
              <div class="text-xs text-zinc-500 mt-1 mb-2 px-1">
                цель: {pe.sets} × {formatRange(pe.repsMin, pe.repsMax)} · RIR{' '}
                {formatRange(pe.rirMin, pe.rirMax)}
              </div>

              {exSets.length === 0 ? (
                <div class="px-3 py-2 text-xs text-zinc-600 italic">
                  — не выполнено —
                </div>
              ) : (
                <div class="space-y-1.5">
                  {exSets.map((s) => {
                    const inRepRange =
                      s.reps >= pe.repsMin && s.reps <= pe.repsMax;
                    const inRirRange = s.rir >= pe.rirMin && s.rir <= pe.rirMax;
                    return (
                      <div
                        key={s.id}
                        class="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-900"
                      >
                        <div class="text-emerald-500 text-sm">✓</div>
                        <div class="text-zinc-500 text-sm tabular-nums w-4">
                          {s.setIndex + 1}
                        </div>
                        <div class="font-mono tabular-nums text-white">
                          {formatWeight(s.weight)}
                          <span class="text-zinc-500 text-xs">кг</span>
                          {' × '}
                          <span class={inRepRange ? '' : 'text-amber-400'}>
                            {s.reps}
                          </span>
                          <span class="text-zinc-500"> · R</span>
                          <span class={inRirRange ? '' : 'text-amber-400'}>
                            {s.rir}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
