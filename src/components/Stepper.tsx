import { formatNum } from '../lib/format';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  unit,
}: StepperProps) {
  const round = (n: number) => Math.round(n * 100) / 100;
  const dec = () => onChange(round(Math.max(min, value - step)));
  const inc = () => onChange(round(Math.min(max, value + step)));

  return (
    <div class="flex items-stretch h-14 flex-1 select-none">
      <button
        type="button"
        onClick={dec}
        class="w-16 bg-zinc-800 active:bg-zinc-700 rounded-l-xl text-3xl font-light text-zinc-200"
        aria-label="меньше"
      >
        −
      </button>
      <div class="flex-1 bg-zinc-800 flex items-baseline justify-center gap-1.5 mx-px">
        <span class="text-2xl font-bold tabular-nums">{formatNum(value)}</span>
        {unit && <span class="text-xs text-zinc-500">{unit}</span>}
      </div>
      <button
        type="button"
        onClick={inc}
        class="w-16 bg-zinc-800 active:bg-zinc-700 rounded-r-xl text-3xl font-light text-zinc-200"
        aria-label="больше"
      >
        +
      </button>
    </div>
  );
}
