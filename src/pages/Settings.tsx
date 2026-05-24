import { useState } from 'preact/hooks';
import { db } from '../db/schema';
import { pal } from '../lib/designTokens';
import { BottomNav } from '../components/BottomNav';

export function Settings() {
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const sessions = await db.sessions.toArray();
      const setLogs = await db.setLogs.toArray();
      const settings = await db.settings.toArray();
      const data = { version: 1, exportedAt: Date.now(), sessions, setLogs, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
      if (!confirm(`Импортировать ${sessionsCount} сессий и ${setsCount} сетов? Текущие данные будут заменены.`)) {
        input.value = '';
        return;
      }
      await db.transaction('rw', db.sessions, db.setLogs, db.settings, async () => {
        await db.sessions.clear();
        await db.setLogs.clear();
        await db.settings.clear();
        if (data.sessions) await db.sessions.bulkAdd(data.sessions);
        if (data.setLogs) await db.setLogs.bulkAdd(data.setLogs);
        if (data.settings) await db.settings.bulkAdd(data.settings);
      });
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
      await db.transaction('rw', db.sessions, db.setLogs, db.settings, async () => {
        await db.sessions.clear();
        await db.setLogs.clear();
        await db.settings.clear();
      });
      setMessage('Все данные удалены');
    } catch (e) {
      setMessage('Ошибка: ' + String(e));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: pal.bg, paddingBottom: 110, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '34px 20px 0' }}>
        <div style={{ fontSize: 12, color: pal.mute, fontWeight: 700 }}>Аккаунт</div>
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, color: pal.ink }}>Настройки</div>
      </div>

      <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={handleExport}
          style={cardBtn()}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: pal.ink }}>📥 Экспорт данных</div>
          <div style={{ fontSize: 11, color: pal.mute, marginTop: 2, fontWeight: 600 }}>
            Скачать JSON со всеми сессиями и сетами
          </div>
        </button>

        <label style={{ ...cardBtn(), cursor: 'pointer', display: 'block' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: pal.ink }}>📤 Импорт данных</div>
          <div style={{ fontSize: 11, color: pal.mute, marginTop: 2, fontWeight: 600 }}>
            Загрузить ранее экспортированный JSON (заменит текущие)
          </div>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>

        <button
          type="button"
          onClick={handleClear}
          style={{ ...cardBtn(), background: pal.rose, borderColor: pal.roseD }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: pal.plum }}>🗑 Очистить все данные</div>
          <div style={{ fontSize: 11, color: pal.plum, marginTop: 2, fontWeight: 600, opacity: 0.7 }}>
            Удалить сессии и сеты. Программа и техника не затрагиваются.
          </div>
        </button>

        {message && (
          <div style={{ padding: '10px 14px', background: pal.bgSoft, borderRadius: 14, fontSize: 12, color: pal.ink2, fontWeight: 700, marginTop: 4 }}>
            {message}
          </div>
        )}

        <div style={{ padding: '20px 4px 0', fontSize: 11, color: pal.muteSoft, fontWeight: 600 }}>
          <div>Workout v0.2 · Full Body ×3</div>
          <div style={{ marginTop: 2 }}>Данные хранятся локально в браузере (IndexedDB)</div>
          <div style={{ marginTop: 2 }}>Программа и упражнения — в <code style={{ fontFamily: 'ui-monospace,monospace' }}>public/data/</code></div>
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}

function cardBtn(): import('preact').JSX.CSSProperties {
  return {
    width: '100%',
    padding: '14px 16px',
    background: pal.card,
    border: `1px solid ${pal.line}`,
    borderRadius: 18,
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}
