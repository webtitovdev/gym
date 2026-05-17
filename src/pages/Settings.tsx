import { useState } from 'preact/hooks';
import { Link } from '../lib/hashRouter';
import { db } from '../db/schema';

export function Settings() {
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const sessions = await db.sessions.toArray();
      const setLogs = await db.setLogs.toArray();
      const settings = await db.settings.toArray();
      const data = {
        version: 1,
        exportedAt: Date.now(),
        sessions,
        setLogs,
        settings,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(`Экспортировано: ${sessions.length} сессий, ${setLogs.length} сетов`);
    } catch (e) {
      setMessage('Ошибка экспорта: ' + String(e));
    }
  };

  const handleImport = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const sessionsCount = data.sessions?.length ?? 0;
      const setsCount = data.setLogs?.length ?? 0;

      if (
        !confirm(
          `Импортировать ${sessionsCount} сессий и ${setsCount} сетов? Текущие данные будут заменены.`
        )
      ) {
        input.value = '';
        return;
      }

      await db.transaction(
        'rw',
        db.sessions,
        db.setLogs,
        db.settings,
        async () => {
          await db.sessions.clear();
          await db.setLogs.clear();
          await db.settings.clear();
          if (data.sessions) await db.sessions.bulkAdd(data.sessions);
          if (data.setLogs) await db.setLogs.bulkAdd(data.setLogs);
          if (data.settings) await db.settings.bulkAdd(data.settings);
        }
      );
      setMessage(`Импортировано: ${sessionsCount} сессий, ${setsCount} сетов`);
    } catch (err) {
      setMessage('Ошибка импорта: ' + String(err));
    } finally {
      input.value = '';
    }
  };

  const handleClear = async () => {
    if (!confirm('Удалить ВСЕ записанные данные? Сделай сначала экспорт.')) return;
    if (!confirm('Точно? Это нельзя отменить.')) return;
    try {
      await db.transaction(
        'rw',
        db.sessions,
        db.setLogs,
        db.settings,
        async () => {
          await db.sessions.clear();
          await db.setLogs.clear();
          await db.settings.clear();
        }
      );
      setMessage('Все данные удалены');
    } catch (e) {
      setMessage('Ошибка: ' + String(e));
    }
  };

  return (
    <div class="min-h-screen bg-black text-white pb-8">
      <header class="sticky top-0 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 py-3 z-10">
        <Link href="/" class="text-sm text-zinc-400 active:text-white">
          ← Главная
        </Link>
        <h1 class="text-xl font-bold mt-1">Настройки</h1>
      </header>

      <div class="px-4 mt-5 space-y-3">
        <button
          type="button"
          onClick={handleExport}
          class="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl active:bg-zinc-800 text-left"
        >
          <div class="font-semibold">📥 Экспорт данных</div>
          <div class="text-sm text-zinc-500 mt-0.5">
            Скачать JSON со всеми сессиями и сетами
          </div>
        </button>

        <label class="block p-4 bg-zinc-900 border border-zinc-800 rounded-xl active:bg-zinc-800 cursor-pointer">
          <div class="font-semibold">📤 Импорт данных</div>
          <div class="text-sm text-zinc-500 mt-0.5">
            Загрузить ранее экспортированный JSON (заменит текущие данные)
          </div>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            class="hidden"
          />
        </label>

        <div class="pt-4">
          <button
            type="button"
            onClick={handleClear}
            class="w-full p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl active:bg-rose-900/40 text-left"
          >
            <div class="font-semibold text-rose-300">🗑 Очистить все данные</div>
            <div class="text-sm text-rose-400/70 mt-0.5">
              Удалить сессии и сеты. Программа и техника не затрагиваются.
            </div>
          </button>
        </div>

        {message && (
          <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 mt-4">
            {message}
          </div>
        )}

        <div class="pt-6 px-2 text-xs text-zinc-600 space-y-1">
          <div>Версия 0.1 · Phase 1-6 готовы</div>
          <div>Данные хранятся локально в браузере (IndexedDB).</div>
          <div>
            Программа и упражнения — в{' '}
            <code class="font-mono text-zinc-500">public/data/</code> в репо.
          </div>
        </div>
      </div>
    </div>
  );
}
