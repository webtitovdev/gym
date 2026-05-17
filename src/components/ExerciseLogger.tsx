import type { ProgramExercise, Exercise } from '../types';
import type { SetLogRecord } from '../db/schema';
import { SetRow } from './SetRow';
import { computeSetDefaults } from '../lib/progression';
import { logSet, updateSetLog, deleteSetLog } from '../db/queries';
import { restTimer } from '../lib/useRestTimer';
import { Link } from '../lib/hashRouter';
import { formatRange } from '../lib/format';

interface Props {
  index: number;
  programExercise: ProgramExercise;
  exercise: Exercise;
  sessionId: number;
  currentSets: SetLogRecord[];
  prevSessionSets: SetLogRecord[];
}

export function ExerciseLogger({
  index,
  programExercise: pe,
  exercise: ex,
  sessionId,
  currentSets,
  prevSessionSets,
}: Props) {
  const totalDone = currentSets.length;

  const handleSave = async (
    setIndex: number,
    existing: SetLogRecord | undefined,
    data: { weight: number; reps: number; rir: number }
  ) => {
    if (existing?.id) {
      await updateSetLog(existing.id, data);
    } else {
      await logSet({
        sessionId,
        exerciseId: ex.id,
        setIndex,
        ...data,
      });
      restTimer.start(pe.restSec);
    }
  };

  const handleDelete = async (existing: SetLogRecord) => {
    if (existing.id) await deleteSetLog(existing.id);
  };

  return (
    <section class="space-y-2">
      <div class="px-1">
        <Link
          href={`/exercise/${ex.id}`}
          class="flex items-baseline justify-between active:opacity-60"
        >
          <div class="flex items-baseline gap-2 min-w-0">
            <div class="text-zinc-500 text-sm font-mono tabular-nums">
              {index + 1}.
            </div>
            <h2 class="font-bold text-white truncate">{ex.name}</h2>
            <div class="text-zinc-600 text-xs shrink-0">ⓘ</div>
          </div>
          <div
            class={`text-xs tabular-nums shrink-0 ml-2 font-mono ${
              totalDone === pe.sets ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          >
            {totalDone}/{pe.sets}
          </div>
        </Link>
        <div class="text-xs text-zinc-500 mt-1">
          цель: {pe.sets} × {formatRange(pe.repsMin, pe.repsMax)} · RIR{' '}
          {formatRange(pe.rirMin, pe.rirMax)} · отдых {pe.restSec}с
        </div>
      </div>

      <div class="space-y-2">
        {Array.from({ length: pe.sets }, (_, i) => {
          const existing = currentSets.find((s) => s.setIndex === i);
          const prevSet = prevSessionSets.find((s) => s.setIndex === i);
          const defaults = computeSetDefaults(i, prevSessionSets, pe, ex);
          return (
            <SetRow
              key={i}
              setIndex={i}
              programExercise={pe}
              exercise={ex}
              existing={existing}
              prevSet={prevSet}
              defaults={defaults}
              onSave={(d) => handleSave(i, existing, d)}
              onDelete={existing ? () => handleDelete(existing) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
