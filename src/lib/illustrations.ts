// Maps exercise IDs (from exercises.json) to illustration kinds
// and tint colors used by ExerciseGif.

export type IllustrationKind =
  | 'press_incline'
  | 'press_seated'
  | 'pulldown'
  | 'row_cable'
  | 'row_db_oneArm'
  | 'pec_deck'
  | 'reverse_fly'
  | 'curl'
  | 'pushdown'
  | 'triceps_overhead'
  | 'lateral'
  | 'leg_curl'
  | 'glute_bridge'
  | 'calf_raise'
  | 'hang'
  | 'shrug';

export type TintName = 'peach' | 'rose' | 'lavender' | 'butter' | 'sand';

interface IllusMap {
  kind: IllustrationKind;
  tint: TintName;
}

export const EXERCISE_ILLUS: Record<string, IllusMap> = {
  // Day 1 (Mon)
  'incline-db-press-30':              { kind: 'press_incline',     tint: 'peach' },
  'lat-pulldown-wide':                { kind: 'pulldown',          tint: 'lavender' },
  'db-shoulder-press-seated':         { kind: 'press_seated',      tint: 'butter' },
  'lying-leg-curl':                   { kind: 'leg_curl',          tint: 'sand' },
  'incline-db-curl':                  { kind: 'curl',              tint: 'rose' },
  'cable-pushdown-rope':              { kind: 'pushdown',          tint: 'peach' },
  // Day 2 (Wed)
  'one-arm-db-row':                   { kind: 'row_db_oneArm',     tint: 'lavender' },
  'chest-press-machine':              { kind: 'press_incline',     tint: 'peach' },
  'cable-lateral-raise-unilateral':   { kind: 'lateral',           tint: 'butter' },
  'barbell-glute-bridge':             { kind: 'glute_bridge',      tint: 'rose' },
  'reverse-pec-deck':                 { kind: 'reverse_fly',       tint: 'sand' },
  'calf-raise-leg-press':             { kind: 'calf_raise',        tint: 'peach' },
  // Day 3 (Fri)
  'seated-cable-row-v':               { kind: 'row_cable',         tint: 'lavender' },
  'pec-deck':                         { kind: 'pec_deck',          tint: 'peach' },
  'db-lateral-raise':                 { kind: 'lateral',           tint: 'butter' },
  'hammer-curl':                      { kind: 'curl',              tint: 'rose' },
  'cable-overhead-tricep-extension':  { kind: 'triceps_overhead',  tint: 'sand' },
  'hanging-leg-raise':                { kind: 'hang',              tint: 'lavender' },
  // New (Full Body v2 — added 2026-05-24)
  'seated-leg-curl':                  { kind: 'leg_curl',          tint: 'sand' },
  'barbell-hip-thrust':               { kind: 'glute_bridge',      tint: 'rose' },
  'standing-calf-raise':              { kind: 'calf_raise',        tint: 'peach' },
  'hip-adduction':                    { kind: 'leg_curl',          tint: 'lavender' },
  'hip-abduction':                    { kind: 'leg_curl',          tint: 'butter' },
  'hack-squat':                       { kind: 'leg_curl',          tint: 'sand' },
  'leg-press':                        { kind: 'leg_curl',          tint: 'sand' },
  'leg-extension':                    { kind: 'leg_curl',          tint: 'butter' },
  // New (Full Body v3 — added 2026-05-27)
  'incline-chest-press-machine':      { kind: 'press_incline',     tint: 'peach' },
  'machine-shoulder-press':           { kind: 'press_seated',      tint: 'butter' },
  'cable-bicep-curl':                 { kind: 'curl',              tint: 'rose' },
  'seated-calf-raise':                { kind: 'calf_raise',        tint: 'peach' },
  'hyperextension':                   { kind: 'glute_bridge',      tint: 'sand' },
  'captains-chair-knee-raise':        { kind: 'hang',              tint: 'lavender' },
  'lat-pulldown-neutral':             { kind: 'pulldown',          tint: 'lavender' },
  // Orphans (kept for history)
  'chest-supported-row':              { kind: 'row_cable',         tint: 'lavender' },
  'cable-face-pull':                  { kind: 'row_cable',         tint: 'sand' },
  'cable-rear-delt-row':              { kind: 'row_cable',         tint: 'lavender' },
  'db-shrug':                         { kind: 'shrug',             tint: 'rose' },
  'cable-crunch':                     { kind: 'hang',              tint: 'rose' },
  'biceps-curl-machine':              { kind: 'curl',              tint: 'rose' },
};

export function illusFor(exerciseId: string): IllusMap {
  return EXERCISE_ILLUS[exerciseId] || { kind: 'press_incline', tint: 'peach' };
}

// ─────────────────────────────────────────────────────────────
// Muscle group mapping — my detailed MuscleGroup → simpler design key
// Design keys: shoulders, chest, biceps, forearms, core, lats, back,
//              glutes, quads, hamstrings, calves, traps
// ─────────────────────────────────────────────────────────────
export type DesignMuscleKey =
  | 'shoulders' | 'chest' | 'biceps' | 'forearms' | 'core'
  | 'lats' | 'back' | 'glutes' | 'quads' | 'hamstrings'
  | 'calves' | 'traps' | 'triceps';

const MUSCLE_TO_DESIGN: Record<string, DesignMuscleKey | DesignMuscleKey[]> = {
  upper_chest: 'chest',
  mid_chest: 'chest',
  lower_chest: 'chest',
  front_delts: 'shoulders',
  side_delts: 'shoulders',
  rear_delts: ['shoulders', 'back'],
  traps: 'traps',
  lats: 'lats',
  mid_back: 'back',
  lower_back: 'back',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  abs: 'core',
  obliques: 'core',
  glutes: 'glutes',
  quads: 'quads',
  hamstrings: 'hamstrings',
  adductors: 'quads',
  abductors: 'glutes',
  calves: 'calves',
};

export function toDesignMuscleKeys(muscles: string[]): DesignMuscleKey[] {
  const out = new Set<DesignMuscleKey>();
  for (const m of muscles) {
    const mapped = MUSCLE_TO_DESIGN[m];
    if (!mapped) continue;
    if (Array.isArray(mapped)) mapped.forEach((k) => out.add(k));
    else out.add(mapped);
  }
  return Array.from(out);
}

// Russian label for design muscle keys (chip display)
const DESIGN_MUSCLE_RU: Record<DesignMuscleKey, string> = {
  shoulders: 'Плечи',
  chest: 'Грудь',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  forearms: 'Предпл.',
  core: 'Кор',
  lats: 'Широч.',
  back: 'Спина',
  glutes: 'Ягод.',
  quads: 'Квадр.',
  hamstrings: 'Бицепс бедра',
  calves: 'Икры',
  traps: 'Трапеции',
};

export function designMuscleRu(k: DesignMuscleKey): string {
  return DESIGN_MUSCLE_RU[k] || k;
}
