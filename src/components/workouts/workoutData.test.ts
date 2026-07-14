import { describe, expect, it } from 'vitest';
import { getWorkout, getWorkouts } from './workoutData';

describe('full-body program schedule', () => {
  it('uses the prescribed full-body strength, core, cardio, and recovery rhythm', () => {
    const monday = getWorkouts('monday', 1);

    expect(monday.map((workout) => workout.name)).toEqual([
      'Warm-up Cardio', 'Leg Press', 'Leg Curls', 'Chest Press', 'Lat Pulldown',
      'Shoulder Press', 'Biceps Curl', 'Triceps Pushdown', 'Plank', 'Post-lift Cardio', 'Cool-down',
    ]);
    expect(getWorkouts('wednesday', 1).map((workout) => workout.name)).toContain('Smith Machine Squat');
    expect(getWorkouts('wednesday', 1).map((workout) => workout.name)).toContain('Machine Crunch');
    expect(getWorkouts('friday', 1).map((workout) => workout.name)).toContain('Dumbbell Hammer Curl');
    expect(getWorkouts('friday', 1).map((workout) => workout.name)).toContain('Hanging Knee Raise');
    expect(monday.find((workout) => workout.name === 'Leg Press')).toMatchObject({
      startingWeight: '90–140 lb / 40–64 kg',
      restSeconds: 90,
    });
    expect(getWorkouts('tuesday', 1)[0]).toMatchObject({ name: 'Steady-state Cardio', reps: '30 min' });
    expect(getWorkouts('thursday', 1)[0]).toMatchObject({ name: 'Active Recovery Cardio', reps: '20–30 min' });
    expect(getWorkouts('sunday', 1)).toEqual([]);
  });

  it('adds a form-first progression reminder after the first two weeks', () => {
    expect(getWorkouts('monday', 3).find((workout) => workout.name === 'Chest Press')?.guidance)
      .toContain('top of the range');
  });

  it('resolves repeated exercise ids within their day and week', () => {
    expect(getWorkout('monday', 1, 'warmup-cardio-1')?.name).toBe('Warm-up Cardio');
    expect(getWorkout('wednesday', 1, 'warmup-cardio-1')?.name).toBe('Warm-up Cardio');
    expect(getWorkout('tuesday', 1, 'warmup-cardio-1')).toBeUndefined();
  });
});
