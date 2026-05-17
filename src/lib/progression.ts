import type { ProgramExercise, Exercise } from '../types';
import type { SetLogRecord } from '../db/schema';
import { formatWeight } from './format';

export interface SetDefaults {
  weight: number;
  reps: number;
  rir: number;
  progressionHint?: string;
}

/**
 * Compute defaults for a specific set, given prev session's logs for this
 * exercise. Double progression: if every prev set hit repsMax with RIR >= 1,
 * suggest +increment for the new weight.
 */
export function computeSetDefaults(
  setIndex: number,
  prevSessionSets: SetLogRecord[],
  programExercise: ProgramExercise,
  exercise: Exercise
): SetDefaults {
  if (prevSessionSets.length === 0) {
    return {
      weight: 0,
      reps: programExercise.repsMin,
      rir: programExercise.rirMax,
      progressionHint: 'Первая сессия — выбери стартовый вес',
    };
  }

  const sorted = [...prevSessionSets].sort((a, b) => a.setIndex - b.setIndex);

  const allMet =
    sorted.length >= programExercise.sets &&
    sorted.every(
      (s) => s.reps >= programExercise.repsMax && s.rir >= 1
    );

  const prevSet =
    sorted.find((s) => s.setIndex === setIndex) ?? sorted[sorted.length - 1];

  if (allMet) {
    return {
      weight: prevSet.weight + exercise.weightIncrement,
      reps: programExercise.repsMin,
      rir: programExercise.rirMax,
      progressionHint: `+${formatWeight(exercise.weightIncrement)}кг — прошлый раз все сеты на верху`,
    };
  }

  return {
    weight: prevSet.weight,
    reps: prevSet.reps,
    rir: prevSet.rir,
  };
}
