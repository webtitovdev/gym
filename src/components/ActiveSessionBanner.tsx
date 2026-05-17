import { useEffect, useState } from 'preact/hooks';
import { useLive } from '../lib/useLive';
import { db } from '../db/schema';
import { loadProgram } from '../lib/loadData';
import { Link } from '../lib/hashRouter';
import type { Program } from '../types';

const CYR_LETTER: Record<string, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' };
const displayLetter = (id: string) => CYR_LETTER[id] || id;

export function ActiveSessionBanner() {
  const active = useLive(async () => {
    const sessions = await db.sessions.where('completedAt').equals(0).toArray();
    sessions.sort((a, b) => b.startedAt - a.startedAt);
    return sessions[0];
  });

  const [program, setProgram] = useState<Program | null>(null);
  useEffect(() => {
    loadProgram().then(setProgram);
  }, []);

  if (!active || !program || !active.id) return null;
  const day = program.days.find((d) => d.id === active.dayId);
  if (!day) return null;

  const elapsedMin = Math.floor((Date.now() - active.startedAt) / 60000);

  return (
    <Link
      href={`/session/${active.id}`}
      class="block mx-4 mt-3 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl active:bg-emerald-900/50"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[11px] uppercase tracking-[0.15em] text-emerald-400 font-semibold">
            Тренировка в процессе
          </div>
          <div class="text-sm font-bold text-white mt-0.5 truncate">
            День {displayLetter(active.dayId)} — {day.name}
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div class="text-xs text-emerald-300 tabular-nums">
            {elapsedMin} мин
          </div>
          <div class="text-emerald-400">→</div>
        </div>
      </div>
    </Link>
  );
}
