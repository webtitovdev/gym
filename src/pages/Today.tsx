import { useEffect, useState } from 'preact/hooks';
import { loadProgram } from '../lib/loadData';
import { Link } from '../lib/hashRouter';
import { ActiveSessionBanner } from '../components/ActiveSessionBanner';
import { IOSInstallBanner } from '../components/IOSInstallBanner';
import type { Program } from '../types';

const DOW_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const CYR_LETTER: Record<string, string> = { A: 'А', B: 'Б', C: 'В', D: 'Г' };
const displayLetter = (id: string) => CYR_LETTER[id] || id;

export function Today() {
  const [program, setProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgram().then(setProgram).catch((e) => setError(String(e)));
  }, []);

  if (error) return <div class="p-4 text-rose-400">{error}</div>;
  if (!program) return <div class="p-4 text-zinc-500">Загрузка...</div>;

  const now = new Date();
  const todayDow = now.getDay();
  const todayDay = program.days.find((d) => d.dayOfWeek === todayDow);

  const nextDay = todayDay
    ? undefined
    : (() => {
        for (let offset = 1; offset <= 7; offset++) {
          const dow = (todayDow + offset) % 7;
          const match = program.days.find((d) => d.dayOfWeek === dow);
          if (match) return { day: match, daysAway: offset };
        }
        return undefined;
      })();

  return (
    <div class="min-h-screen bg-black text-white">
      <header class="px-5 pt-8 pb-3">
        <div class="flex items-baseline justify-between gap-3">
          <h1 class="text-2xl font-bold tracking-tight truncate">{program.name}</h1>
          <div class="flex gap-4 text-sm shrink-0">
            <Link href="/history" class="text-zinc-400 active:text-white">История</Link>
            <Link href="/settings" class="text-zinc-400 active:text-white">⚙</Link>
          </div>
        </div>
        <div class="text-sm text-zinc-500 mt-1">
          {DOW_SHORT[todayDow]}, {now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </div>
      </header>

      <IOSInstallBanner />
      <ActiveSessionBanner />

      <div class="px-4 mt-2">
        {todayDay ? (
          <Link
            href={`/day/${todayDay.id}`}
            class="block p-5 bg-emerald-950/40 rounded-2xl border border-emerald-900/60 active:bg-emerald-900/40 transition-colors"
          >
            <div class="text-[11px] uppercase tracking-[0.15em] text-emerald-400 font-semibold">
              Сегодня
            </div>
            <div class="text-2xl font-bold mt-2">
              День {displayLetter(todayDay.id)}
            </div>
            <div class="text-lg text-zinc-300 mt-0.5">{todayDay.name}</div>
            <div class="text-sm text-zinc-500 mt-3">
              {todayDay.exercises.length} упражнений ·{' '}
              {todayDay.exercises.reduce((s, e) => s + e.sets, 0)} рабочих сетов
            </div>
          </Link>
        ) : (
          <div class="p-5 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <div class="text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-semibold">
              Сегодня
            </div>
            <div class="text-2xl font-bold mt-2 text-zinc-300">День отдыха</div>
            {nextDay && (
              <div class="text-sm text-zinc-500 mt-3">
                Следующая тренировка — {DOW_SHORT[nextDay.day.dayOfWeek]} (через{' '}
                {nextDay.daysAway} {nextDay.daysAway === 1 ? 'день' : 'дн'})
              </div>
            )}
          </div>
        )}
      </div>

      <section class="mt-10 pb-8">
        <div class="px-5 text-[11px] uppercase tracking-[0.15em] text-zinc-600 font-semibold mb-3">
          Все дни программы
        </div>
        <div class="px-4 space-y-2">
          {program.days.map((d) => {
            const isToday = d.dayOfWeek === todayDow;
            return (
              <Link
                key={d.id}
                href={`/day/${d.id}`}
                class={`block p-4 rounded-xl border active:bg-zinc-800/80 transition-colors ${
                  isToday
                    ? 'bg-zinc-900 border-emerald-900/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div class="flex items-baseline justify-between gap-3">
                  <div class="flex items-baseline gap-3 min-w-0">
                    <div class="text-2xl font-bold text-zinc-400 tabular-nums">
                      {displayLetter(d.id)}
                    </div>
                    <div class="font-semibold text-white truncate">{d.name}</div>
                  </div>
                  <div class="text-xs text-zinc-500 tabular-nums">
                    {DOW_SHORT[d.dayOfWeek]}
                  </div>
                </div>
                <div class="text-xs text-zinc-500 mt-1.5 ml-9">
                  {d.exercises.length} упр · {d.exercises.reduce((s, e) => s + e.sets, 0)} сетов
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
