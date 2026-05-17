import type { MuscleGroup } from '../types';

interface Props {
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
}

const PRIMARY_COLOR = '#10b981';
const SECONDARY_COLOR = '#52525b';
const INACTIVE_COLOR = '#18181b';

function colorFor(
  muscle: MuscleGroup,
  primary: MuscleGroup[],
  secondary: MuscleGroup[]
): string {
  if (primary.includes(muscle)) return PRIMARY_COLOR;
  if (secondary.includes(muscle)) return SECONDARY_COLOR;
  return INACTIVE_COLOR;
}

export function MuscleDiagram({ primary, secondary }: Props) {
  const c = (m: MuscleGroup) => colorFor(m, primary, secondary);

  return (
    <div class="flex justify-center gap-4">
      {/* FRONT VIEW */}
      <div class="flex flex-col items-center">
        <svg viewBox="0 0 150 350" class="h-60 w-auto">
          {/* head */}
          <circle cx="75" cy="25" r="20" fill="#27272a" />
          {/* neck */}
          <rect x="65" y="42" width="20" height="12" fill="#27272a" />
          {/* torso silhouette */}
          <path
            d="M 35 60 Q 30 65 30 80 L 30 180 Q 30 195 40 195 L 110 195 Q 120 195 120 180 L 120 80 Q 120 65 115 60 Z"
            fill="#1f1f23"
          />
          {/* upper chest */}
          <ellipse cx="60" cy="78" rx="22" ry="10" fill={c('upper_chest')} />
          <ellipse cx="90" cy="78" rx="22" ry="10" fill={c('upper_chest')} />
          {/* mid chest */}
          <ellipse cx="60" cy="100" rx="22" ry="14" fill={c('mid_chest')} />
          <ellipse cx="90" cy="100" rx="22" ry="14" fill={c('mid_chest')} />
          {/* lower chest */}
          <ellipse cx="60" cy="115" rx="20" ry="6" fill={c('lower_chest')} />
          <ellipse cx="90" cy="115" rx="20" ry="6" fill={c('lower_chest')} />
          {/* abs */}
          <rect x="62" y="128" width="26" height="50" rx="4" fill={c('abs')} />
          {/* obliques */}
          <path
            d="M 32 135 Q 36 165 48 180 L 55 135 Z"
            fill={c('obliques')}
          />
          <path
            d="M 118 135 Q 114 165 102 180 L 95 135 Z"
            fill={c('obliques')}
          />
          {/* front delts */}
          <circle cx="25" cy="78" r="14" fill={c('front_delts')} />
          <circle cx="125" cy="78" r="14" fill={c('front_delts')} />
          {/* biceps */}
          <ellipse cx="18" cy="115" rx="10" ry="22" fill={c('biceps')} />
          <ellipse cx="132" cy="115" rx="10" ry="22" fill={c('biceps')} />
          {/* forearms */}
          <ellipse cx="15" cy="160" rx="9" ry="22" fill={c('forearms')} />
          <ellipse cx="135" cy="160" rx="9" ry="22" fill={c('forearms')} />
          {/* pelvis */}
          <rect x="35" y="195" width="80" height="20" rx="4" fill="#27272a" />
          {/* quads */}
          <rect x="40" y="218" width="28" height="80" rx="4" fill={c('quads')} />
          <rect x="82" y="218" width="28" height="80" rx="4" fill={c('quads')} />
          {/* adductors */}
          <rect x="68" y="222" width="14" height="60" rx="3" fill={c('adductors')} />
        </svg>
        <div class="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">Перед</div>
      </div>

      {/* BACK VIEW */}
      <div class="flex flex-col items-center">
        <svg viewBox="0 0 150 350" class="h-60 w-auto">
          {/* head */}
          <circle cx="75" cy="25" r="20" fill="#27272a" />
          {/* neck */}
          <rect x="65" y="42" width="20" height="12" fill="#27272a" />
          {/* torso silhouette */}
          <path
            d="M 35 60 Q 30 65 30 80 L 30 180 Q 30 195 40 195 L 110 195 Q 120 195 120 180 L 120 80 Q 120 65 115 60 Z"
            fill="#1f1f23"
          />
          {/* traps */}
          <path d="M 60 56 Q 75 70 90 56 L 100 78 L 50 78 Z" fill={c('traps')} />
          {/* rear delts */}
          <circle cx="25" cy="78" r="14" fill={c('rear_delts')} />
          <circle cx="125" cy="78" r="14" fill={c('rear_delts')} />
          {/* lats */}
          <path
            d="M 30 95 L 52 110 L 52 165 L 35 175 Z"
            fill={c('lats')}
          />
          <path
            d="M 120 95 L 98 110 L 98 165 L 115 175 Z"
            fill={c('lats')}
          />
          {/* mid back */}
          <rect x="57" y="95" width="36" height="55" rx="3" fill={c('mid_back')} />
          {/* lower back */}
          <rect x="60" y="153" width="30" height="35" rx="3" fill={c('lower_back')} />
          {/* triceps */}
          <ellipse cx="18" cy="115" rx="10" ry="22" fill={c('triceps')} />
          <ellipse cx="132" cy="115" rx="10" ry="22" fill={c('triceps')} />
          {/* forearms */}
          <ellipse cx="15" cy="160" rx="9" ry="22" fill={c('forearms')} />
          <ellipse cx="135" cy="160" rx="9" ry="22" fill={c('forearms')} />
          {/* glutes */}
          <ellipse cx="60" cy="210" rx="22" ry="18" fill={c('glutes')} />
          <ellipse cx="90" cy="210" rx="22" ry="18" fill={c('glutes')} />
          {/* abductors */}
          <ellipse cx="35" cy="218" rx="8" ry="14" fill={c('abductors')} />
          <ellipse cx="115" cy="218" rx="8" ry="14" fill={c('abductors')} />
          {/* hamstrings */}
          <rect x="40" y="230" width="28" height="60" rx="4" fill={c('hamstrings')} />
          <rect x="82" y="230" width="28" height="60" rx="4" fill={c('hamstrings')} />
          {/* calves */}
          <ellipse cx="54" cy="305" rx="13" ry="22" fill={c('calves')} />
          <ellipse cx="96" cy="305" rx="13" ry="22" fill={c('calves')} />
        </svg>
        <div class="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">Зад</div>
      </div>
    </div>
  );
}
