import { useEffect, useState } from 'preact/hooks';
import { Link } from '../lib/hashRouter';
import { db } from '../db/schema';
import { loadProgram } from '../lib/loadData';
import type { SessionRecord } from '../db/schema';
import type { Program } from '../types';

const CYR_LETTER: Record<string, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' };
const displayLetter = (id: string) => CYR_LETTER[id] || id;

interface Entry {
  session: SessionRecord;
  setsCount: number;
}

export function History() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [program, setProgram] = useState<Program | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sessions = await db.sessions
        .where('completedAt')
        .above(0)
        .reverse()
        .sortBy('completedAt');
      const list = await Promise.all(
        sessions.map(async (s) => {
          const count = s.id
            ? await db.setLogs.where('sessionId').equals(s.id).count()
            : 0;
          return { session: s, setsCount: count };
        })
      );
      const prog = await loadProgram();
      if (!cancelled) {
        setEntries(list);
        setProgram(prog);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div class="min-h-screen bg-black text-white pb-8">
      <header class="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 z-10">
        <Link href="/" class="text-sm text-zinc-400 active:text-white">
          ← Главная
        </Link>
        <h1 class="text-xl font-bold mt-1">История тренировок</h1>
      </header>

      {!loaded && <div class="p-4 text-zinc-500">Загрузка...</div>}

      {loaded && entries.length === 0 && (
        <div class="p-8 text-center">
          <div class="text-zinc-500 text-sm">
            Пока нет завершённых тренировок
          </div>
          <Link
            href="/"
            class="inline-block mt-4 px-5 py-2.5 bg-emerald-600 active:bg-emerald-700 rounded-xl text-white text-sm font-bold"
          >
            На главную
          </Link>
        </div>
      )}

      {loaded && entries.length > 0 && (
        <div class="px-4 mt-4 space-y-2">
          {entries.map(({ session, setsCount }) => {
            const day = program?.days.find((d) => d.id === session.dayId);
            const date = new Date(session.completedAt);
            const elapsed = Math.round(
              (session.completedAt - session.startedAt) / 60000
            );
            return (
              <Link
                key={session.id}
                href={`/session/${session.id}`}
                class="block p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 active:bg-zinc-800"
              >
                <div class="flex items-baseline justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-semibold truncate">
                      День {displayLetter(session.dayId)} — {day?.name ?? '?'}
                    </div>
                    <div class="text-xs text-zinc-500 mt-0.5 tabular-nums">
                      {date.toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                      })}
                      {' · '}
                      {date.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {elapsed}мин
                    </div>
                  </div>
                  <div class="text-xs text-zinc-400 tabular-nums shrink-0">
                    {setsCount} сетов
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
