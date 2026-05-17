import { useState } from 'preact/hooks';
import type { Exercise, ProgramExercise } from '../types';
import type { SetLogRecord } from '../db/schema';
import type { SetDefaults } from '../lib/progression';
import { SetLogger } from './SetLogger';
import { formatWeight } from '../lib/format';

interface Props {
  setIndex: number;
  programExercise: ProgramExercise;
  exercise: Exercise;
  existing?: SetLogRecord;
  defaults: SetDefaults;
  prevSet?: SetLogRecord;
  onSave: (data: { weight: number; reps: number; rir: number }) => void;
  onDelete?: () => void;
}

export function SetRow(props: Props) {
  const [editing, setEditing] = useState(false);

  if (props.existing && !editing) {
    const { existing, programExercise: pe } = props;
    const inRepRange =
      existing.reps >= pe.repsMin && existing.reps <= pe.repsMax;
    const inRirRange =
      existing.rir >= pe.rirMin && existing.rir <= pe.rirMax;
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        class="w-full flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-900 active:bg-zinc-900 text-left"
      >
        <div class="flex items-baseline gap-3 min-w-0">
          <div class="text-emerald-500 text-lg leading-none">✓</div>
          <div class="text-zinc-500 text-sm">{props.setIndex + 1}</div>
          <div class="font-mono tabular-nums text-white truncate">
            {formatWeight(existing.weight)}
            <span class="text-zinc-500 text-xs">кг</span>
            {' × '}
            <span class={inRepRange ? '' : 'text-amber-400'}>
              {existing.reps}
            </span>
            <span class="text-zinc-500"> · R</span>
            <span class={inRirRange ? '' : 'text-amber-400'}>{existing.rir}</span>
          </div>
        </div>
        <div class="text-xs text-zinc-600 ml-2 shrink-0">изменить</div>
      </button>
    );
  }

  return (
    <SetLogger
      setIndex={props.setIndex}
      programExercise={props.programExercise}
      exercise={props.exercise}
      existing={props.existing}
      defaults={props.defaults}
      prevSet={props.prevSet}
      onSubmit={(d) => {
        props.onSave(d);
        setEditing(false);
      }}
      onCancel={props.existing ? () => setEditing(false) : undefined}
      onDelete={props.onDelete}
    />
  );
}
