import { pal } from '../lib/designTokens';

interface Item {
  k: 'home' | 'diary' | 'me';
  label: string;
  href: string;
  d: string;
}

const items: Item[] = [
  { k: 'home', label: 'Today', href: '#/', d: 'M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V10z' },
  { k: 'diary', label: 'Diary', href: '#/history', d: 'M5 4h14v17l-4-2-3 2-3-2-4 2V4z' },
  { k: 'me', label: 'Me', href: '#/settings', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0' },
];

export function BottomNav({ active }: { active: Item['k'] }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: `calc(16px + env(safe-area-inset-bottom))`,
        left: 16,
        right: 16,
        height: 60,
        borderRadius: 26,
        background: pal.card,
        boxShadow: `0 10px 24px rgba(120,80,40,0.12), 0 0 0 1px ${pal.line}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 25,
      }}
    >
      {items.map((it) => {
        const on = it.k === active;
        return (
          <a
            key={it.k}
            href={it.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '6px 14px',
              borderRadius: 18,
              background: on ? pal.bgSoft : 'transparent',
              textDecoration: 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? pal.ink : pal.mute} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={it.d} />
            </svg>
            <span style={{ fontSize: 10, color: on ? pal.ink : pal.mute, fontWeight: 700 }}>{it.label}</span>
          </a>
        );
      })}
    </div>
  );
}
