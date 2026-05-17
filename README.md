# Workout App

Личное PWA-приложение для тренировочной программы.

## Стек

- Preact + TypeScript + Vite
- Tailwind CSS
- Dexie (IndexedDB) — для логов сетов (фаза 3+)
- vite-plugin-pwa — оффлайн + установка на домашний экран
- Деплой: GitHub Pages через Actions

## Разработка

```bash
npm install
npm run dev         # localhost:5173 + LAN (для теста с телефона)
npm run build       # сборка в dist/
npm run preview     # предпросмотр прод-сборки
```

## Данные

- `public/data/program.json` — программа тренировок (дни, упражнения, целевые сеты/повторы/RIR/отдых)
- `public/data/exercises.json` — библиотека упражнений с техникой, ошибками, мышцами

Эти файлы редактируются вручную. После изменения `npm run build` + push в `main` → автодеплой.

## Структура

```
src/
  components/        # переиспользуемые UI-блоки
  pages/             # экраны (Today, DayDetail, ExerciseView)
  lib/               # роутер, загрузка данных, утилиты
  db/                # Dexie схема (фаза 3+)
  types.ts           # типы Program / Exercise / SetLog
```

## Текущий статус

- ✅ Phase 0-1-2: просмотр программы, экран упражнения с техникой и ошибками
- ⏳ Phase 3: логирование сетов с IndexedDB
- ⏳ Phase 4: rest timer с Wake Lock
- ⏳ Phase 5: double progression hint
- ⏳ Phase 6: графики прогресса, история, объём по мышцам, 1RM
- ⏳ Phase 7: export/import JSON, polish, iOS install screen
