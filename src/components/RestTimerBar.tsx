import { useRestTimer, restTimer } from '../lib/useRestTimer';

export function RestTimerBar() {
  const state = useRestTimer();
  if (state.totalSec === 0) return null;

  const pct =
    state.totalSec > 0
      ? Math.min(100, (1 - state.remainingSec / state.totalSec) * 100)
      : 100;
  const mm = Math.floor(state.remainingSec / 60);
  const ss = state.remainingSec % 60;
  const isDone = state.remainingSec === 0;

  return (
    <div class="fixed inset-x-0 bottom-0 z-30">
      <div
        class={`relative bg-zinc-950/95 backdrop-blur-md border-t px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] ${
          isDone ? 'border-emerald-700 animate-pulse' : 'border-zinc-800'
        }`}
      >
        <div
          class={`absolute inset-y-0 left-0 ${
            isDone ? 'bg-emerald-700/40' : 'bg-emerald-700/15'
          } transition-all`}
          style={{ width: `${pct}%` }}
        />
        <div class="relative flex items-center gap-3">
          <div
            class={`text-3xl font-bold tabular-nums shrink-0 ${
              isDone ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {mm}:{String(ss).padStart(2, '0')}
          </div>
          <div class="flex-1 text-xs text-zinc-400 min-w-0">
            {isDone ? 'Готово — следующий сет' : 'Отдых'}
          </div>
          <div class="flex gap-1.5 shrink-0">
            {!isDone && (
              <>
                <button
                  type="button"
                  onClick={() => restTimer.addSec(-15)}
                  class="w-12 h-10 bg-zinc-800 active:bg-zinc-700 rounded-lg text-sm font-bold text-zinc-300 tabular-nums"
                >
                  −15
                </button>
                <button
                  type="button"
                  onClick={() => restTimer.addSec(15)}
                  class="w-12 h-10 bg-zinc-800 active:bg-zinc-700 rounded-lg text-sm font-bold text-zinc-300 tabular-nums"
                >
                  +15
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => restTimer.stop()}
              class={`px-4 h-10 rounded-lg text-sm font-bold ${
                isDone
                  ? 'bg-emerald-600 active:bg-emerald-700 text-white'
                  : 'bg-zinc-800 active:bg-zinc-700 text-zinc-300'
              }`}
            >
              {isDone ? 'OK' : 'Пропустить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
