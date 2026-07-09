export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type Day = (typeof DAYS)[number];
export type Week = 1 | 2 | 3 | 4;
export type WeightUnit = 'lb' | 'kg';
export type DistanceUnit = 'mi' | 'km';
export type WorkoutType = 'upper' | 'lower' | 'cardio';
export type ExerciseStatus = 'planned' | 'logged' | 'skipped';

export interface Workout {
  id: string;
  name: string;
  sets: number;
  reps: string;
  guidance?: string;
  startingWeight?: string;
  restSeconds?: number;
  videoUrl?: string;
  type: WorkoutType;
  input: 'strength' | 'reps' | 'duration' | 'cardio';
}

export type WorkoutSchedule = Record<Day, Record<Week, Workout[]>>;

export interface StrengthSet {
  id: string;
  weight: string;
  unit: WeightUnit;
  reps: string;
  durationSeconds: string;
  completed: boolean;
}

export interface CardioResult {
  durationMinutes: string;
  distance: string;
  distanceUnit: DistanceUnit;
  machine: string;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  videoUrl?: string;
  type: WorkoutType;
  input: Workout['input'];
  target: string;
  startingWeight?: string;
  restSeconds?: number;
  sets: StrengthSet[];
  cardio?: CardioResult;
  completed: boolean;
  status?: ExerciseStatus;
}

export interface WorkoutSession {
  id: string;
  week: Week;
  day: Day;
  startedAt: string;
  completedAt?: string;
  activeExerciseIndex: number;
  exercises: ExerciseLog[];
}

export interface LegacyCompletion {
  day: string;
  workoutIds: string[];
}

export interface AppSettings {
  defaultWeightUnit: WeightUnit;
  defaultDistanceUnit: DistanceUnit;
  selectedWeek: Week;
}

export interface AppData {
  version: 1;
  settings: AppSettings;
  activeDraft: WorkoutSession | null;
  sessions: WorkoutSession[];
  legacyCompletions: LegacyCompletion[];
  legacyImported: boolean;
}

export interface LoadResult {
  data: AppData;
  warning?: string;
  migratedLegacy: boolean;
}
