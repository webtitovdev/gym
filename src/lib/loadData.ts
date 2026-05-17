import type { Program, ExerciseLibrary } from '../types';

let programCache: Promise<Program> | null = null;
let exercisesCache: Promise<ExerciseLibrary> | null = null;

const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/';

export function loadProgram(): Promise<Program> {
  if (!programCache) {
    programCache = fetch(`${base}data/program.json`).then((r) => {
      if (!r.ok) throw new Error('Не удалось загрузить программу');
      return r.json() as Promise<Program>;
    });
  }
  return programCache;
}

export function loadExercises(): Promise<ExerciseLibrary> {
  if (!exercisesCache) {
    exercisesCache = fetch(`${base}data/exercises.json`).then((r) => {
      if (!r.ok) throw new Error('Не удалось загрузить упражнения');
      return r.json() as Promise<ExerciseLibrary>;
    });
  }
  return exercisesCache;
}

const MUSCLE_RU: Record<string, string> = {
  upper_chest: 'верх груди',
  mid_chest: 'грудь',
  lower_chest: 'низ груди',
  front_delts: 'передние дельты',
  side_delts: 'средние дельты',
  rear_delts: 'задние дельты',
  traps: 'трапеции',
  lats: 'широчайшие',
  mid_back: 'средняя спина',
  lower_back: 'поясница',
  biceps: 'бицепс',
  triceps: 'трицепс',
  forearms: 'предплечья',
  abs: 'пресс',
  obliques: 'косые',
  glutes: 'ягодицы',
  quads: 'квадрицепс',
  hamstrings: 'бицепс бедра',
  adductors: 'приводящие',
  abductors: 'отводящие',
  calves: 'икры',
};

export function muscleRu(m: string): string {
  return MUSCLE_RU[m] || m;
}

const EQUIPMENT_RU: Record<string, string> = {
  barbell: 'штанга',
  dumbbell: 'гантели',
  machine: 'тренажёр',
  cable: 'блок',
  bodyweight: 'свой вес',
};

export function equipmentRu(e: string): string {
  return EQUIPMENT_RU[e] || e;
}
