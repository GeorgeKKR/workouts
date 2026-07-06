import { describe, expect, it } from 'vitest';
import { buildExerciseTrend, fromMiles, fromPounds, sessionCompletion, toMiles, toPounds } from './metrics';
import type { WorkoutSession } from '../types';

const session: WorkoutSession = {
  id: 'session-1',
  day: 'monday',
  week: 1,
  startedAt: '2026-01-01T10:00:00.000Z',
  completedAt: '2026-01-01T11:00:00.000Z',
  activeExerciseIndex: 0,
  exercises: [{
    exerciseId: 'press',
    name: 'Press',
    input: 'strength',
    type: 'upper',
    target: '1 × 8',
    completed: true,
    sets: [{ id: 'set-1', weight: '100', unit: 'lb', reps: '8', durationSeconds: '', completed: true }],
  }],
};

describe('metrics', () => {
  it('converts weight units', () => {
    expect(toPounds(10, 'kg')).toBeCloseTo(22.046, 2);
    expect(fromPounds(22.046, 'kg')).toBeCloseTo(10, 2);
    expect(toMiles(5, 'km')).toBeCloseTo(3.107, 2);
    expect(fromMiles(3.107, 'km')).toBeCloseTo(5, 2);
  });

  it('calculates completion and trends', () => {
    expect(sessionCompletion(session)).toEqual({ total: 1, completed: 1, percentage: 100 });
    expect(buildExerciseTrend([session], 'press')[0]).toMatchObject({ bestWeightLb: 100, volumeLb: 800 });
  });

  it('excludes untouched exercises from trends', () => {
    const untouched: WorkoutSession = {
      ...session,
      id: 'session-2',
      exercises: [{
        ...session.exercises[0],
        completed: false,
        sets: [{ ...session.exercises[0].sets[0], weight: '', reps: '', completed: false }],
      }],
    };
    expect(buildExerciseTrend([untouched], 'press')).toEqual([]);
  });

  it('normalizes cardio distance and aggregates timed work', () => {
    const cardio: WorkoutSession = {
      ...session,
      exercises: [{
        exerciseId: 'cardio',
        name: 'Cardio',
        input: 'cardio',
        type: 'cardio',
        target: '30 min',
        completed: true,
        sets: [],
        cardio: { durationMinutes: '30', distance: '5', distanceUnit: 'km', machine: 'Bike' },
      }],
    };
    const timed: WorkoutSession = {
      ...session,
      id: 'session-3',
      exercises: [{
        exerciseId: 'plank',
        name: 'Plank',
        input: 'duration',
        type: 'lower',
        target: '2 × 30 sec',
        completed: true,
        sets: [
          { id: 'one', weight: '', unit: 'lb', reps: '', durationSeconds: '30', completed: true },
          { id: 'two', weight: '', unit: 'lb', reps: '', durationSeconds: '30', completed: true },
        ],
      }],
    };
    const cardioPoint = buildExerciseTrend([cardio], 'cardio')[0];
    expect(cardioPoint.durationMinutes).toBe(30);
    expect(cardioPoint.distanceMiles).toBeCloseTo(3.107, 3);
    expect(buildExerciseTrend([timed], 'plank')[0]).toMatchObject({ durationMinutes: 1 });
  });
});
