const OPTIONS = [0, 1, 2, 3, 4, 5];

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function RirSelector({ value, onChange }: Props) {
  return (
    <div class="flex gap-1.5 flex-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          class={`flex-1 h-12 rounded-lg font-bold tabular-nums transition-colors ${
            value === opt
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-800 text-zinc-400 active:bg-zinc-700'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
