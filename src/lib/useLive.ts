import { useEffect, useState } from 'preact/hooks';
import { liveQuery } from 'dexie';

export function useLive<T>(
  querier: () => Promise<T> | T,
  deps: unknown[] = []
): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);
  useEffect(() => {
    const sub = liveQuery(querier).subscribe({
      next: setValue,
      error: (e) => console.error('liveQuery error:', e),
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
