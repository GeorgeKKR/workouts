import type { DistanceUnit, ExerciseLog, WeightUnit, WorkoutSession } from '../types';

export const toPounds = (weight: number, unit: WeightUnit) => unit === 'kg' ? weight * 2.2046226218 : weight;
export const fromPounds = (weight: number, unit: WeightUnit) => unit === 'kg' ? weight / 2.2046226218 : weight;
export const toMiles = (distance: number, unit: DistanceUnit) => unit === 'km' ? distance / 1.609344 : distance;
export const fromMiles = (distance: number, unit: DistanceUnit) => unit === 'km' ? distance * 1.609344 : distance;

export const exerciseVolumeInPounds = (exercise: ExerciseLog) =>
  exercise.sets.reduce((total, set) => {
    if (!set.completed) return total;
    const weight = Number(set.weight);
    const reps = Number(set.reps);
    return total + (weight > 0 && reps > 0 ? toPounds(weight, set.unit) * reps : 0);
  }, 0);

export const sessionCompletion = (session: WorkoutSession) => {
  const total = session.exercises.length;
  const completed = session.exercises.filter((exercise) => exercise.completed).length;
  return { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 };
};

export interface TrendPoint {
  date: string;
  bestWeightLb?: number;
  volumeLb?: number;
  durationMinutes?: number;
  distanceMiles?: number;
}

export const buildExerciseTrend = (sessions: WorkoutSession[], exerciseKey: string): TrendPoint[] =>
  sessions
    .filter((session) => !!session.completedAt)
    .flatMap((session) => {
      const exercise = session.exercises.find((item) => item.exerciseId === exerciseKey || item.name === exerciseKey);
      if (!exercise) return [];
      const weights = exercise.sets
        .filter((set) => set.completed && set.weight.trim() !== '')
        .map((set) => toPounds(Number(set.weight), set.unit))
        .filter((weight) => Number.isFinite(weight) && weight > 0);
      const durationSeconds = exercise.sets
        .filter((set) => set.completed)
        .reduce((total, set) => total + (Number(set.durationSeconds) || 0), 0);
      const cardioDuration = exercise.cardio ? Number(exercise.cardio.durationMinutes) || undefined : undefined;
      const cardioDistance = exercise.cardio ? Number(exercise.cardio.distance) || undefined : undefined;
      if (!weights.length && durationSeconds <= 0 && !cardioDuration && !cardioDistance) return [];
      return [{
        date: session.completedAt ?? session.startedAt,
        bestWeightLb: weights.length ? Math.max(...weights) : undefined,
        volumeLb: weights.length ? exerciseVolumeInPounds(exercise) : undefined,
        durationMinutes: cardioDuration ?? (durationSeconds > 0 ? durationSeconds / 60 : undefined),
        distanceMiles: cardioDistance && exercise.cardio
          ? toMiles(cardioDistance, exercise.cardio.distanceUnit)
          : undefined,
      }];
    })
    .sort((a, b) => a.date.localeCompare(b.date));
