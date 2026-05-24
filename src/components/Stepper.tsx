import { pal } from '../lib/designTokens';
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
    <div
      style={{
        flex: 1,
        background: pal.bgSoft,
        borderRadius: 14,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        onClick={dec}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: 'none',
          background: pal.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="меньше"
      >
        <svg width="14" height="2" viewBox="0 0 14 2">
          <path d="M1 1h12" stroke={pal.ink} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            color: pal.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatNum(value)}
        </div>
        {unit && (
          <div
            style={{
              fontSize: 9,
              color: pal.mute,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            {unit}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={inc}
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          border: 'none',
          background: pal.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="больше"
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M7 1v12M1 7h12" stroke={pal.ink} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
