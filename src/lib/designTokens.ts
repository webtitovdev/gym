// Design tokens — pastel R5 palette (from design handoff).
// Source: workout/project/flow-core.jsx

export const pal = {
  bg:        '#FBF7F1',
  bgSoft:    '#F5EFE4',
  ink:       '#2A2421',
  ink2:      '#4E4339',
  mute:      '#9A8A78',
  muteSoft:  '#C8BBA9',
  line:      'rgba(42,36,33,0.07)',
  lineSoft:  'rgba(42,36,33,0.04)',
  card:      '#FFFFFF',
  peach:     '#F7B894',
  peachL:    '#FFD8C2',
  peachD:    '#E89A7A',
  rose:      '#F0C8C8',
  roseD:     '#D9A5A5',
  lavender:  '#D6CFE8',
  butter:    '#F5E0A4',
  terra:     '#DC9176',
  terraD:    '#B8745A',
  plum:      '#8A5F66',
  sand:      '#E8D8C4',
} as const;

export const FONT = '"Nunito","SF Pro Rounded",-apple-system,"Inter",system-ui';

// Tint palette for ExerciseGif cards
export const tints: Record<string, [string, string]> = {
  peach:    ['#FFD8C2', '#F7B894'],
  rose:     ['#FAD6D6', '#F0C8C8'],
  lavender: ['#E2DBF1', '#D6CFE8'],
  butter:   ['#FAEEC4', '#F5E0A4'],
  sand:     ['#EFE2CC', '#E0CDB0'],
};

// Display Russian weekday from JS getDay()
export const DOW_RU_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
export const DOW_RU_LONG = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

// Day code mapping (program day IDs → letter display)
const DAY_CODE_MAP: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C' };
export function dayCode(id: string): string {
  return DAY_CODE_MAP[id] || id;
}

// Format date as "Пятница · 25 мая"
const MONTH_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export function formatDayDate(d: Date = new Date()): string {
  return `${DOW_RU_LONG[d.getDay()]} · ${d.getDate()} ${MONTH_RU[d.getMonth()]}`;
}
export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTH_RU[d.getMonth()].slice(0, 3)}`;
}
