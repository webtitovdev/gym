import Dexie, { type Table } from 'dexie';

export interface SessionRecord {
  id?: number;
  dayId: string;
  startedAt: number;
  completedAt: number;
  bodyWeight?: number;
  notes?: string;
}

export interface SetLogRecord {
  id?: number;
  sessionId: number;
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  rir: number;
  side?: 'left' | 'right';
  completedAt: number;
  notes?: string;
}

export interface UserSetting {
  key: string;
  value: unknown;
}

class WorkoutDB extends Dexie {
  sessions!: Table<SessionRecord, number>;
  setLogs!: Table<SetLogRecord, number>;
  settings!: Table<UserSetting, string>;

  constructor() {
    super('workout');
    this.version(1).stores({
      sessions: '++id, dayId, startedAt, completedAt',
      setLogs: '++id, sessionId, exerciseId, [exerciseId+completedAt]',
      settings: '&key',
    });
  }
}

export const db = new WorkoutDB();
