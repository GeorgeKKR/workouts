import { describe, expect, it } from 'vitest';
import { createDefaultData, isAppData, loadAppData, parseBackup, serializeBackup } from './storage';

describe('workout storage', () => {
  it('round-trips a versioned backup', () => {
    const data = createDefaultData();
    expect(parseBackup(serializeBackup(data))).toEqual(data);
    expect(isAppData(data)).toBe(true);
  });

  it('recovers from corrupt saved data with a warning', () => {
    const storage = new MapStorage({ 'lifttrack:data': '{not-json' });
    const result = loadAppData(storage);
    expect(result.data.version).toBe(1);
    expect(result.warning).toMatch(/could not be read/i);
  });

  it('preserves legacy completion markers without dates', () => {
    const storage = new MapStorage({ completedWorkouts: JSON.stringify({ monday: ['chest-press-1'] }) });
    const result = loadAppData(storage);
    expect(result.migratedLegacy).toBe(true);
    expect(result.data.legacyCompletions).toEqual([{ day: 'monday', workoutIds: ['chest-press-1'] }]);
  });

  it('rejects unsupported backups', () => {
    expect(() => parseBackup('{"version":2}')).toThrow(/not a valid LiftTrack/i);
  });

  it('rejects malformed nested workout data', () => {
    const data = createDefaultData();
    const malformed = {
      ...data,
      activeDraft: {
        id: 'draft',
        week: 1,
        day: 'monday',
        startedAt: '2026-01-01T10:00:00.000Z',
        activeExerciseIndex: 0,
        exercises: [{ exerciseId: 'press' }],
      },
    };
    expect(isAppData(malformed)).toBe(false);
  });
});

class MapStorage implements Storage {
  private values = new Map<string, string>();
  constructor(seed: Record<string, string> = {}) { Object.entries(seed).forEach(([key, value]) => this.values.set(key, value)); }
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}
