export function formatWeight(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.?0+$/, '');
}

export function formatNum(n: number): string {
  return formatWeight(n);
}

export function formatRange(min: number, max: number): string {
  return min === max ? String(min) : `${min}–${max}`;
}
