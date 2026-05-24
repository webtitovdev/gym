import { pal } from '../lib/designTokens';

const OPTIONS = [0, 1, 2, 3, 4, 5];

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function RirSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 5, flex: 1 }}>
      {OPTIONS.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              background: on ? pal.ink : pal.bgSoft,
              color: on ? pal.peachL : pal.ink2,
              border: 'none',
              cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'inherit',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
