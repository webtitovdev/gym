export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export type MuscleGroup =
  | 'upper_chest' | 'mid_chest' | 'lower_chest'
  | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'traps' | 'lats' | 'mid_back' | 'lower_back'
  | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques'
  | 'glutes' | 'quads' | 'hamstrings' | 'adductors' | 'abductors' | 'calves';

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  weightIncrement: number;
  unilateral: boolean;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  exerciseDbId: string | null;
  imageUrl?: string;
  imageUrlEnd?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  cues: string[];
  mistakes: string[];
}

export type ExerciseLibrary = Record<string, Exercise>;

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  rirMin: number;
  rirMax: number;
  restSec: number;
  /** If set, exercises with the same number are paired as a superset (e.g., 2А+2Б). */
  supersetGroup?: number | null;
  /** Optional letter for display ('А', 'Б') when in a superset. */
  supersetLabel?: string | null;
  /** Optional note. */
  note?: string;
}

export interface Day {
  id: string;
  name: string;
  dayOfWeek: number;
  exercises: ProgramExercise[];
}

export interface Program {
  name: string;
  days: Day[];
}
