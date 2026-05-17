/** Epley 1RM estimate. */
export function epley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function bestEstimated1RM(
  sets: Array<{ weight: number; reps: number }>
): number {
  if (sets.length === 0) return 0;
  return Math.max(...sets.map((s) => epley(s.weight, s.reps)));
}
