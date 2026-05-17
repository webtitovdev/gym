import { db, type SessionRecord, type SetLogRecord } from './schema';

export async function startSession(dayId: string): Promise<number> {
  const active = await db.sessions.where('completedAt').equals(0).toArray();
  for (const s of active) {
    if (s.id) await db.sessions.update(s.id, { completedAt: Date.now() });
  }
  return db.sessions.add({
    dayId,
    startedAt: Date.now(),
    completedAt: 0,
  });
}

export async function finishSession(sessionId: number): Promise<void> {
  await db.sessions.update(sessionId, { completedAt: Date.now() });
}

export async function logSet(
  data: Omit<SetLogRecord, 'id' | 'completedAt'> & { completedAt?: number }
): Promise<number> {
  return db.setLogs.add({
    ...data,
    completedAt: data.completedAt ?? Date.now(),
  });
}

export async function updateSetLog(
  id: number,
  data: Partial<Pick<SetLogRecord, 'weight' | 'reps' | 'rir' | 'notes'>>
): Promise<void> {
  await db.setLogs.update(id, data);
}

export async function deleteSetLog(id: number): Promise<void> {
  await db.setLogs.delete(id);
}

export async function getLastCompletedSession(
  dayId: string,
  excludeSessionId: number
): Promise<SessionRecord | undefined> {
  const arr = await db.sessions
    .where('dayId').equals(dayId)
    .filter((s) => s.completedAt > 0 && s.id !== excludeSessionId)
    .toArray();
  arr.sort((a, b) => b.completedAt - a.completedAt);
  return arr[0];
}

export async function getSetsForSession(sessionId: number): Promise<SetLogRecord[]> {
  return db.setLogs.where('sessionId').equals(sessionId).sortBy('setIndex');
}
