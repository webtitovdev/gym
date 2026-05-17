import { useState } from 'preact/hooks';
import type { Exercise, ProgramExercise } from '../types';
import type { SetLogRecord } from '../db/schema';
import { Stepper } from './Stepper';
import { RirSelector } from './RirSelector';
import { formatWeight } from '../lib/format';
import type { SetDefaults } from '../lib/progression';

interface Props {
  setIndex: number;
  programExercise: ProgramExercise;
  exercise: Exercise;
  existing?: SetLogRecord;
  defaults: SetDefaults;
  prevSet?: SetLogRecord;
  onSubmit: (data: { weight: number; reps: number; rir: number }) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export function SetLogger(props: Props) {
  const init = props.existing ?? props.defaults;
  const [weight, setWeight] = useState(init.weight);
  const [reps, setReps] = useState(init.reps);
  const [rir, setRir] = useState(init.rir);

  return (
    <div class="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
      <div class="flex items-center justify-between min-h-[18px]">
        <div class="text-sm font-semibold text-zinc-300">
          Сет {props.setIndex + 1}
        </div>
        {!props.existing && props.defaults.progressionHint && (
          <div class="text-[11px] text-emerald-400 truncate ml-2">
            💡 {props.defaults.progressionHint}
          </div>
        )}
      </div>

      <div class="flex items-center gap-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 w-10">
          Вес
        </div>
        <Stepper
          value={weight}
          onChange={setWeight}
          step={props.exercise.weightIncrement}
          unit="кг"
        />
      </div>

      <div class="flex items-center gap-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 w-10">
          Повт
        </div>
        <Stepper value={reps} onChange={setReps} step={1} min={0} max={100} />
      </div>

      <div class="flex items-center gap-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 w-10">
          RIR
        </div>
        <RirSelector value={rir} onChange={setRir} />
      </div>

      {props.prevSet && (
        <div class="text-xs text-zinc-500 px-1 pt-1">
          Прошлый:{' '}
          <span class="font-mono tabular-nums text-zinc-400">
            {formatWeight(props.prevSet.weight)}кг × {props.prevSet.reps} · R
            {props.prevSet.rir}
          </span>
        </div>
      )}

      <div class="flex gap-2 pt-1">
        {props.existing && props.onCancel && (
          <button
            type="button"
            onClick={props.onCancel}
            class="px-4 h-14 bg-zinc-800 active:bg-zinc-700 rounded-xl text-zinc-300 font-semibold"
          >
            Отмена
          </button>
        )}
        <button
          type="button"
          onClick={() => props.onSubmit({ weight, reps, rir })}
          class="flex-1 h-14 bg-emerald-600 active:bg-emerald-700 rounded-xl text-white font-bold text-lg shadow-lg shadow-emerald-900/40"
        >
          {props.existing ? '💾 Сохранить' : '✓ Записать сет'}
        </button>
      </div>

      {props.existing && props.onDelete && (
        <button
          type="button"
          onClick={props.onDelete}
          class="w-full text-xs text-rose-500 active:text-rose-400 py-1"
        >
          Удалить сет
        </button>
      )}
    </div>
  );
}
