// Exercise illustration:
// - Primary: real photos (start + end position) crossfading via CSS
// - Fallback: stylized 2-frame SVG when no photo URLs provided
// Ported from design handoff: workout/project/flow-illustrations.jsx

import { pal, tints } from '../lib/designTokens';
import { illusFor, type IllustrationKind, type TintName } from '../lib/illustrations';
import type { JSX } from 'preact';

const FIG = '#3D332B';
const EQP = '#1F1814';

type FrameFn = (frame: 0 | 1) => JSX.Element;

const ILLUS: Record<IllustrationKind, FrameFn> = {
  press_incline: (f) => (
    <g>
      <rect x="40" y="118" width="6" height="14" fill={EQP} />
      <rect x="138" y="98" width="6" height="34" fill={EQP} />
      <g transform="rotate(-26 100 100)">
        <rect x="40" y="92" width="120" height="13" rx="6" fill={EQP} />
        <rect x="56" y="76" width="92" height="18" rx="9" fill={FIG} />
        <circle cx="150" cy="85" r="10" fill={FIG} />
      </g>
      {f === 0 ? (
        <g>
          <rect x="93" y="50" width="7" height="26" rx="3.5" fill={FIG} transform="rotate(-22 96 63)" />
          <rect x="116" y="50" width="7" height="26" rx="3.5" fill={FIG} transform="rotate(22 120 63)" />
          <rect x="78" y="44" width="14" height="14" rx="3" fill={EQP} />
          <rect x="124" y="44" width="14" height="14" rx="3" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="96" y="22" width="7" height="42" rx="3.5" fill={FIG} />
          <rect x="113" y="22" width="7" height="42" rx="3.5" fill={FIG} />
          <rect x="91" y="14" width="17" height="14" rx="3" fill={EQP} />
          <rect x="108" y="14" width="17" height="14" rx="3" fill={EQP} />
        </g>
      )}
    </g>
  ),
  press_seated: (f) => (
    <g>
      <rect x="80" y="92" width="48" height="10" rx="3" fill={EQP} />
      <rect x="78" y="78" width="6" height="40" fill={EQP} />
      <rect x="124" y="102" width="6" height="22" fill={EQP} />
      <rect x="92" y="56" width="24" height="38" rx="10" fill={FIG} />
      <circle cx="104" cy="38" r="10" fill={FIG} />
      <rect x="95" y="92" width="9" height="32" rx="4" fill={FIG} />
      <rect x="106" y="92" width="9" height="32" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="78" y="46" width="9" height="22" rx="4" fill={FIG} />
          <rect x="121" y="46" width="9" height="22" rx="4" fill={FIG} />
          <rect x="70" y="38" width="14" height="14" rx="3" fill={EQP} />
          <rect x="124" y="38" width="14" height="14" rx="3" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="84" y="16" width="9" height="38" rx="4" fill={FIG} />
          <rect x="115" y="16" width="9" height="38" rx="4" fill={FIG} />
          <rect x="78" y="6" width="14" height="14" rx="3" fill={EQP} />
          <rect x="116" y="6" width="14" height="14" rx="3" fill={EQP} />
        </g>
      )}
    </g>
  ),
  pulldown: (f) => (
    <g>
      <line x1="100" y1="2" x2="100" y2={f === 0 ? 30 : 50} stroke={EQP} strokeWidth="1.5" />
      <rect x="80" y="102" width="48" height="10" rx="3" fill={EQP} />
      <rect x="124" y="112" width="6" height="20" fill={EQP} />
      <rect x="74" y="92" width="60" height="8" rx="4" fill={EQP} />
      <rect x="92" y="64" width="24" height="40" rx="10" fill={FIG} />
      <circle cx="104" cy="48" r="9.5" fill={FIG} />
      <rect x="95" y="100" width="9" height="20" rx="4" fill={FIG} />
      <rect x="106" y="100" width="9" height="20" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="84" y="32" width="8" height="36" rx="4" fill={FIG} />
          <rect x="116" y="32" width="8" height="36" rx="4" fill={FIG} />
          <rect x="68" y="28" width="72" height="6" rx="3" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="84" y="60" width="8" height="22" rx="4" fill={FIG} transform="rotate(-30 88 70)" />
          <rect x="116" y="60" width="8" height="22" rx="4" fill={FIG} transform="rotate(30 120 70)" />
          <rect x="62" y="56" width="84" height="6" rx="3" fill={EQP} />
        </g>
      )}
    </g>
  ),
  row_cable: (f) => (
    <g>
      <rect x="0" y="124" width="200" height="10" fill={EQP} opacity=".55" />
      <rect x="10" y="98" width="14" height="28" rx="3" fill={EQP} />
      <line x1="24" y1="105" x2={f === 0 ? 92 : 118} y2={f === 0 ? 88 : 84} stroke={EQP} strokeWidth="1.5" />
      <rect x="34" y="108" width="22" height="16" rx="3" fill={EQP} />
      <rect x="118" y="60" width="26" height="36" rx="11" fill={FIG} />
      <circle cx="131" cy="44" r="9.5" fill={FIG} />
      <rect x="58" y="90" width="62" height="10" rx="5" fill={FIG} />
      <rect x="46" y="98" width="14" height="22" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="92" y="78" width="32" height="8" rx="4" fill={FIG} />
          <rect x="86" y="74" width="8" height="16" rx="3" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="108" y="78" width="22" height="8" rx="4" fill={FIG} />
          <rect x="124" y="74" width="8" height="16" rx="3" fill={EQP} />
        </g>
      )}
    </g>
  ),
  row_db_oneArm: (f) => (
    <g>
      <rect x="20" y="100" width="100" height="10" rx="3" fill={EQP} />
      <rect x="24" y="110" width="6" height="14" fill={EQP} />
      <rect x="110" y="110" width="6" height="14" fill={EQP} />
      <rect x="50" y="72" width="90" height="18" rx="9" fill={FIG} />
      <circle cx="148" cy="72" r="9.5" fill={FIG} />
      <rect x="78" y="88" width="8" height="14" rx="3" fill={FIG} />
      <rect x="140" y="86" width="9" height="40" rx="4" fill={FIG} />
      <rect x="150" y="86" width="9" height="40" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="120" y="90" width="8" height="34" rx="3.5" fill={FIG} />
          <rect x="112" y="124" width="24" height="9" rx="2" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="120" y="74" width="8" height="20" rx="3.5" fill={FIG} />
          <rect x="112" y="68" width="24" height="9" rx="2" fill={EQP} />
        </g>
      )}
    </g>
  ),
  pec_deck: (f) => (
    <g>
      <rect x="86" y="100" width="36" height="10" rx="3" fill={EQP} />
      <rect x="88" y="110" width="6" height="20" fill={EQP} />
      <rect x="114" y="110" width="6" height="20" fill={EQP} />
      <rect x="84" y="50" width="40" height="50" rx="14" fill={FIG} />
      <circle cx="104" cy="36" r="11" fill={FIG} />
      <rect x="92" y="100" width="9" height="30" rx="4" fill={FIG} />
      <rect x="107" y="100" width="9" height="30" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="36" y="60" width="50" height="9" rx="4" fill={FIG} />
          <rect x="122" y="60" width="50" height="9" rx="4" fill={FIG} />
          <circle cx="38" cy="64" r="7" fill={EQP} />
          <circle cx="170" cy="64" r="7" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="68" y="60" width="30" height="9" rx="4" fill={FIG} />
          <rect x="110" y="60" width="30" height="9" rx="4" fill={FIG} />
          <circle cx="76" cy="64" r="7" fill={EQP} />
          <circle cx="132" cy="64" r="7" fill={EQP} />
        </g>
      )}
    </g>
  ),
  reverse_fly: (f) => (
    <g>
      <rect x="86" y="100" width="36" height="10" rx="3" fill={EQP} />
      <rect x="88" y="110" width="6" height="20" fill={EQP} />
      <rect x="114" y="110" width="6" height="20" fill={EQP} />
      <rect x="78" y="46" width="50" height="10" rx="3" fill={EQP} opacity=".5" />
      <rect x="84" y="50" width="40" height="50" rx="14" fill={FIG} />
      <circle cx="104" cy="36" r="11" fill={FIG} />
      <rect x="92" y="100" width="9" height="30" rx="4" fill={FIG} />
      <rect x="107" y="100" width="9" height="30" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="68" y="60" width="32" height="9" rx="4" fill={FIG} />
          <rect x="108" y="60" width="32" height="9" rx="4" fill={FIG} />
        </g>
      ) : (
        <g>
          <rect x="36" y="58" width="52" height="9" rx="4" fill={FIG} />
          <rect x="120" y="58" width="52" height="9" rx="4" fill={FIG} />
        </g>
      )}
    </g>
  ),
  curl: (f) => (
    <g>
      <circle cx="104" cy="32" r="10" fill={FIG} />
      <rect x="92" y="42" width="24" height="48" rx="10" fill={FIG} />
      <rect x="93" y="88" width="10" height="40" rx="4" fill={FIG} />
      <rect x="106" y="88" width="10" height="40" rx="4" fill={FIG} />
      <rect x="82" y="48" width="9" height="28" rx="4" fill={FIG} />
      <rect x="117" y="48" width="9" height="28" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="82" y="74" width="9" height="26" rx="4" fill={FIG} />
          <rect x="117" y="74" width="9" height="26" rx="4" fill={FIG} />
          <rect x="74" y="98" width="24" height="9" rx="2" fill={EQP} />
          <rect x="110" y="98" width="24" height="9" rx="2" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="82" y="50" width="9" height="26" rx="4" fill={FIG} transform="rotate(150 86 62)" />
          <rect x="117" y="50" width="9" height="26" rx="4" fill={FIG} transform="rotate(-150 122 62)" />
          <rect x="76" y="44" width="24" height="9" rx="2" fill={EQP} />
          <rect x="108" y="44" width="24" height="9" rx="2" fill={EQP} />
        </g>
      )}
    </g>
  ),
  pushdown: (f) => (
    <g>
      <line x1="104" y1="2" x2="104" y2={f === 0 ? 56 : 72} stroke={EQP} strokeWidth="1.5" />
      <rect x="80" y="0" width="48" height="6" rx="2" fill={EQP} />
      <circle cx="104" cy="38" r="10" fill={FIG} />
      <rect x="92" y="48" width="24" height="44" rx="10" fill={FIG} />
      <rect x="93" y="90" width="10" height="38" rx="4" fill={FIG} />
      <rect x="106" y="90" width="10" height="38" rx="4" fill={FIG} />
      <rect x="82" y="52" width="9" height="22" rx="4" fill={FIG} />
      <rect x="117" y="52" width="9" height="22" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="84" y="60" width="9" height="20" rx="4" fill={FIG} transform="rotate(40 88 70)" />
          <rect x="116" y="60" width="9" height="20" rx="4" fill={FIG} transform="rotate(-40 121 70)" />
          <rect x="96" y="56" width="16" height="6" rx="2" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="83" y="74" width="9" height="22" rx="4" fill={FIG} />
          <rect x="116" y="74" width="9" height="22" rx="4" fill={FIG} />
          <rect x="86" y="92" width="10" height="8" rx="2" fill={EQP} />
          <rect x="112" y="92" width="10" height="8" rx="2" fill={EQP} />
        </g>
      )}
    </g>
  ),
  triceps_overhead: (f) => (
    <g>
      <rect x="0" y="120" width="14" height="14" rx="2" fill={EQP} />
      <line x1="14" y1="120" x2="104" y2={f === 0 ? 14 : 0} stroke={EQP} strokeWidth="1.5" />
      <circle cx="104" cy="40" r="10" fill={FIG} />
      <rect x="92" y="50" width="24" height="40" rx="10" fill={FIG} />
      <rect x="93" y="90" width="10" height="38" rx="4" fill={FIG} />
      <rect x="106" y="90" width="10" height="38" rx="4" fill={FIG} />
      <rect x="100" y="14" width="9" height="34" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="90" y="22" width="9" height="22" rx="4" fill={FIG} transform="rotate(20 94 33)" />
          <rect x="110" y="22" width="9" height="22" rx="4" fill={FIG} transform="rotate(-20 114 33)" />
          <rect x="96" y="14" width="16" height="6" rx="2" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="90" y="2" width="9" height="22" rx="4" fill={FIG} />
          <rect x="110" y="2" width="9" height="22" rx="4" fill={FIG} />
          <rect x="92" y="0" width="26" height="6" rx="2" fill={EQP} />
        </g>
      )}
    </g>
  ),
  lateral: (f) => (
    <g>
      <circle cx="104" cy="32" r="10" fill={FIG} />
      <rect x="92" y="42" width="24" height="48" rx="10" fill={FIG} />
      <rect x="93" y="88" width="10" height="40" rx="4" fill={FIG} />
      <rect x="106" y="88" width="10" height="40" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="82" y="48" width="9" height="48" rx="4" fill={FIG} />
          <rect x="117" y="48" width="9" height="48" rx="4" fill={FIG} />
          <rect x="74" y="92" width="24" height="9" rx="2" fill={EQP} />
          <rect x="110" y="92" width="24" height="9" rx="2" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="46" y="48" width="46" height="9" rx="4" fill={FIG} />
          <rect x="116" y="48" width="46" height="9" rx="4" fill={FIG} />
          <rect x="36" y="44" width="14" height="18" rx="2" fill={EQP} />
          <rect x="158" y="44" width="14" height="18" rx="2" fill={EQP} />
        </g>
      )}
    </g>
  ),
  leg_curl: (f) => (
    <g>
      <rect x="14" y="80" width="170" height="14" rx="6" fill={EQP} />
      <rect x="20" y="94" width="6" height="20" fill={EQP} />
      <rect x="172" y="94" width="6" height="20" fill={EQP} />
      <circle cx="32" cy="68" r="9" fill={FIG} />
      <rect x="38" y="62" width="84" height="18" rx="8" fill={FIG} />
      <rect x="120" y="62" width="36" height="18" rx="8" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="154" y="62" width="36" height="14" rx="6" fill={FIG} />
          <rect x="184" y="58" width="10" height="22" rx="3" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="158" y="36" width="14" height="34" rx="6" fill={FIG} />
          <rect x="154" y="32" width="22" height="8" rx="3" fill={EQP} />
        </g>
      )}
    </g>
  ),
  glute_bridge: (f) => (
    <g>
      <rect x="0" y="128" width="200" height="6" fill={EQP} opacity=".4" />
      <rect x="20" y="100" width="36" height="14" rx="3" fill={EQP} />
      {f === 0 ? (
        <g>
          <circle cx="36" cy="92" r="9" fill={FIG} />
          <rect x="40" y="110" width="100" height="14" rx="7" fill={FIG} />
          <rect x="130" y="110" width="34" height="13" rx="6" fill={FIG} />
          <rect x="156" y="110" width="13" height="20" rx="4" fill={FIG} />
          <rect x="84" y="100" width="40" height="8" rx="3" fill={EQP} />
          <circle cx="80" cy="104" r="10" fill={EQP} />
          <circle cx="128" cy="104" r="10" fill={EQP} />
        </g>
      ) : (
        <g>
          <circle cx="36" cy="92" r="9" fill={FIG} />
          <rect x="40" y="98" width="80" height="14" rx="7" fill={FIG} transform="rotate(20 80 105)" />
          <rect x="118" y="80" width="34" height="13" rx="6" fill={FIG} transform="rotate(40 135 86)" />
          <rect x="148" y="100" width="13" height="28" rx="4" fill={FIG} />
          <rect x="88" y="74" width="40" height="8" rx="3" fill={EQP} />
          <circle cx="84" cy="78" r="10" fill={EQP} />
          <circle cx="132" cy="78" r="10" fill={EQP} />
        </g>
      )}
    </g>
  ),
  calf_raise: (f) => (
    <g>
      <rect x="20" y="98" width="160" height="14" rx="3" fill={EQP} />
      <circle cx="104" cy="20" r="10" fill={FIG} />
      <rect x="92" y="30" width="24" height="32" rx="10" fill={FIG} />
      <rect x="92" y="62" width="10" height="38" rx="4" fill={FIG} />
      <rect x="106" y="62" width="10" height="38" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="86" y="98" width="20" height="9" rx="3" fill={FIG} />
          <rect x="102" y="98" width="20" height="9" rx="3" fill={FIG} />
        </g>
      ) : (
        <g>
          <rect x="92" y="86" width="14" height="9" rx="3" fill={FIG} transform="rotate(-25 99 90)" />
          <rect x="106" y="86" width="14" height="9" rx="3" fill={FIG} transform="rotate(-25 113 90)" />
        </g>
      )}
    </g>
  ),
  hang: (f) => (
    <g>
      <rect x="34" y="6" width="132" height="6" rx="2" fill={EQP} />
      <rect x="92" y="10" width="8" height="22" rx="3" fill={FIG} />
      <rect x="108" y="10" width="8" height="22" rx="3" fill={FIG} />
      <circle cx="104" cy="40" r="10" fill={FIG} />
      <rect x="92" y="50" width="24" height="46" rx="10" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="93" y="96" width="10" height="44" rx="4" fill={FIG} />
          <rect x="106" y="96" width="10" height="44" rx="4" fill={FIG} />
        </g>
      ) : (
        <g>
          <rect x="92" y="80" width="50" height="14" rx="6" fill={FIG} />
          <rect x="92" y="92" width="50" height="14" rx="6" fill={FIG} />
        </g>
      )}
    </g>
  ),
  shrug: (f) => (
    <g>
      <circle cx="104" cy="30" r="10" fill={FIG} />
      <rect x="92" y="42" width="24" height="48" rx="10" fill={FIG} />
      <rect x="93" y="88" width="10" height="40" rx="4" fill={FIG} />
      <rect x="106" y="88" width="10" height="40" rx="4" fill={FIG} />
      {f === 0 ? (
        <g>
          <rect x="82" y="50" width="9" height="50" rx="4" fill={FIG} />
          <rect x="117" y="50" width="9" height="50" rx="4" fill={FIG} />
          <rect x="74" y="98" width="24" height="9" rx="2" fill={EQP} />
          <rect x="110" y="98" width="24" height="9" rx="2" fill={EQP} />
        </g>
      ) : (
        <g>
          <rect x="82" y="42" width="9" height="50" rx="4" fill={FIG} />
          <rect x="117" y="42" width="9" height="50" rx="4" fill={FIG} />
          <rect x="74" y="90" width="24" height="9" rx="2" fill={EQP} />
          <rect x="110" y="90" width="24" height="9" rx="2" fill={EQP} />
        </g>
      )}
    </g>
  ),
};

interface Props {
  /** If imageUrl is set, photo crossfade renders (preferred). */
  imageUrl?: string;
  imageUrlEnd?: string;
  /** Used for SVG fallback when no photo URLs provided. */
  exerciseId?: string;
  height?: number;
  rounded?: number;
  altText?: string;
}

export function ExerciseGif({
  imageUrl,
  imageUrlEnd,
  exerciseId,
  height = 180,
  rounded = 22,
  altText = '',
}: Props) {
  // Photo mode — preferred
  if (imageUrl) {
    return (
      <div
        style={{
          height,
          borderRadius: rounded,
          background: pal.bgSoft,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          alt={altText}
          loading="lazy"
          class={imageUrlEnd ? 'ex-frame-a' : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
        {imageUrlEnd && (
          <img
            src={imageUrlEnd}
            alt={altText}
            loading="lazy"
            class="ex-frame-b"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}
        <GifBadge />
      </div>
    );
  }

  // SVG fallback (no photo available)
  if (exerciseId) {
    const { kind, tint } = illusFor(exerciseId);
    const [a, b] = tints[tint as TintName] || tints.peach;
    const Frame = ILLUS[kind];
    return (
      <div
        style={{
          height,
          borderRadius: rounded,
          background: `linear-gradient(150deg,${a},${b})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: -16, top: -16, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.32)' }} />
        <div style={{ position: 'absolute', right: -22, bottom: -22, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
        <svg viewBox="0 0 200 140" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid meet">
          <g class="ex-frame-a">{Frame(0)}</g>
          <g class="ex-frame-b">{Frame(1)}</g>
        </svg>
        <GifBadge />
      </div>
    );
  }

  // Nothing to show
  return null;
}

function GifBadge() {
  return (
    <div style={{
      position: 'absolute',
      right: 10,
      top: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'ui-monospace,monospace',
      fontSize: 9,
      color: 'rgba(42,36,33,0.7)',
      fontWeight: 700,
      letterSpacing: 0.5,
      background: 'rgba(255,255,255,0.7)',
      padding: '3px 7px',
      borderRadius: 100,
      backdropFilter: 'blur(4px)',
    }}>
      <span class="ex-pulse-dot" style={{ width: 5, height: 5, borderRadius: 3, background: '#D9876F' }} />
      GIF
    </div>
  );
}
