// Stylized blocky muscle silhouette — ported from design handoff
// (workout/project/flow-core.jsx MuscleMap).

import { pal } from '../lib/designTokens';
import { toDesignMuscleKeys, type DesignMuscleKey } from '../lib/illustrations';
import type { MuscleGroup } from '../types';

interface Props {
  primary?: MuscleGroup[];
  secondary?: MuscleGroup[];
  highlights?: DesignMuscleKey[];
  size?: number;
  back?: boolean;
  base?: string;
  accent?: string;
}

export function MuscleDiagram({
  primary = [],
  secondary = [],
  highlights,
  size = 110,
  back = false,
  base = pal.sand,
  accent = pal.terra,
}: Props) {
  // If `highlights` provided directly, use those. Otherwise convert primary+secondary.
  const keys: DesignMuscleKey[] =
    highlights ?? toDesignMuscleKeys([...primary, ...secondary]);

  const has = (k: DesignMuscleKey) => keys.includes(k);
  const c = (k: DesignMuscleKey) => (has(k) ? accent : base);

  return (
    <svg
      viewBox="0 0 100 180"
      width={size}
      height={(size * 180) / 100}
      style={{ display: 'block' }}
    >
      {/* head */}
      <circle cx="50" cy="14" r="9.5" fill={base} />
      {/* neck + traps */}
      <rect x="45" y="22" width="10" height="6" rx="2" fill={back ? c('traps') : base} />
      {/* shoulders */}
      <ellipse cx="30" cy="36" rx="10" ry="8" fill={c('shoulders')} />
      <ellipse cx="70" cy="36" rx="10" ry="8" fill={c('shoulders')} />
      {/* upper arms (biceps front, triceps back) */}
      <rect x="20" y="42" width="11" height="32" rx="5.5" fill={back ? c('triceps') : c('biceps')} />
      <rect x="69" y="42" width="11" height="32" rx="5.5" fill={back ? c('triceps') : c('biceps')} />
      {/* forearms */}
      <rect x="20.5" y="76" width="10" height="28" rx="5" fill={c('forearms')} />
      <rect x="69.5" y="76" width="10" height="28" rx="5" fill={c('forearms')} />
      {/* torso top half */}
      {!back && <rect x="34" y="34" width="32" height="22" rx="7" fill={c('chest')} />}
      {back && <rect x="34" y="34" width="32" height="22" rx="7" fill={c('back')} />}
      {/* torso bottom half */}
      {!back && <rect x="35" y="56" width="30" height="24" rx="6" fill={c('core')} />}
      {back && <rect x="35" y="56" width="30" height="24" rx="6" fill={c('lats')} />}
      {/* hip / glutes */}
      <rect x="34" y="80" width="32" height="14" rx="5" fill={back ? c('glutes') : base} />
      {/* thighs */}
      <rect x="35" y="94" width="13" height="38" rx="6" fill={back ? c('hamstrings') : c('quads')} />
      <rect x="52" y="94" width="13" height="38" rx="6" fill={back ? c('hamstrings') : c('quads')} />
      {/* calves */}
      <rect x="36" y="132" width="12" height="30" rx="6" fill={c('calves')} />
      <rect x="52" y="132" width="12" height="30" rx="6" fill={c('calves')} />
      {/* feet */}
      <ellipse cx="42" cy="166" rx="6.5" ry="3.5" fill={base} />
      <ellipse cx="58" cy="166" rx="6.5" ry="3.5" fill={base} />
    </svg>
  );
}

// Small inline icon for muscle-group chip in lists
export function MuscleDot({
  primary = [],
  secondary = [],
  size = 22,
}: {
  primary?: MuscleGroup[];
  secondary?: MuscleGroup[];
  size?: number;
}) {
  return (
    <MuscleDiagram
      primary={primary}
      secondary={secondary}
      size={size}
      base="rgba(42,36,33,0.12)"
      accent={pal.terra}
    />
  );
}
