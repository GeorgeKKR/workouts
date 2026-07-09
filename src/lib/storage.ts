import type {
  AppData,
  CardioResult,
  Day,
  ExerciseLog,
  LegacyCompletion,
  LoadResult,
  StrengthSet,
  Week,
  WorkoutSession,
} from '../types';
import { DAYS } from '../types';

export const STORAGE_KEY = 'lifttrack:data';
export const LEGACY_KEY = 'completedWorkouts';

export const createDefaultData = (): AppData => ({
  version: 1,
  settings: { defaultWeightUnit: 'lb', defaultDistanceUnit: 'mi', selectedWeek: 1 },
  activeDraft: null,
  sessions: [],
  legacyCompletions: [],
  legacyImported: false,
});

const isWeek = (value: unknown): value is Week => [1, 2, 3, 4].includes(value as number);
const isDay = (value: unknown): value is Day => typeof value === 'string' && DAYS.includes(value as Day);
const isDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value));
const isStringOrUndefined = (value: unknown) => value === undefined || typeof value === 'string';

const isStrengthSet = (value: unknown): value is StrengthSet => {
  if (!value || typeof value !== 'object') return false;
  const set = value as Partial<StrengthSet>;
  return (
    typeof set.id === 'string' &&
    typeof set.weight === 'string' &&
    (set.unit === 'lb' || set.unit === 'kg') &&
    typeof set.reps === 'string' &&
    typeof set.durationSeconds === 'string' &&
    typeof set.completed === 'boolean'
  );
};

const isCardioResult = (value: unknown): value is CardioResult => {
  if (!value || typeof value !== 'object') return false;
  const cardio = value as Partial<CardioResult>;
  return (
    typeof cardio.durationMinutes === 'string' &&
    typeof cardio.distance === 'string' &&
    (cardio.distanceUnit === 'mi' || cardio.distanceUnit === 'km') &&
    typeof cardio.machine === 'string'
  );
};

const isExerciseLog = (value: unknown): value is ExerciseLog => {
  if (!value || typeof value !== 'object') return false;
  const exercise = value as Partial<ExerciseLog>;
  return (
    typeof exercise.exerciseId === 'string' &&
    typeof exercise.name === 'string' &&
    isStringOrUndefined(exercise.videoUrl) &&
    (exercise.type === 'upper' || exercise.type === 'lower' || exercise.type === 'cardio') &&
    (exercise.input === 'strength' || exercise.input === 'reps' || exercise.input === 'duration' || exercise.input === 'cardio') &&
    typeof exercise.target === 'string' &&
    isStringOrUndefined(exercise.startingWeight) &&
    (exercise.restSeconds === undefined || (Number.isInteger(exercise.restSeconds) && exercise.restSeconds > 0)) &&
    Array.isArray(exercise.sets) &&
    exercise.sets.every(isStrengthSet) &&
    (exercise.cardio === undefined || isCardioResult(exercise.cardio)) &&
    typeof exercise.completed === 'boolean' &&
    (exercise.status === undefined || exercise.status === 'planned' || exercise.status === 'logged' || exercise.status === 'skipped')
  );
};

const normalizeSession = (session: WorkoutSession): WorkoutSession => ({
  id: session.id,
  week: session.week,
  day: session.day,
  startedAt: session.startedAt,
  completedAt: session.completedAt,
  activeExerciseIndex: session.activeExerciseIndex,
  exercises: session.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    videoUrl: exercise.videoUrl,
    type: exercise.type,
    input: exercise.input,
    target: exercise.target,
    startingWeight: exercise.startingWeight,
    restSeconds: exercise.restSeconds,
    sets: exercise.sets,
    cardio: exercise.cardio,
    completed: exercise.completed,
    status: exercise.status ?? (exercise.completed ? 'logged' : 'planned'),
  })),
});

const normalizeAppData = (data: AppData): AppData => ({
  ...data,
  settings: {
    ...data.settings,
    selectedWeek: isWeek(data.settings.selectedWeek) ? data.settings.selectedWeek : 1,
  },
  activeDraft: data.activeDraft ? normalizeSession(data.activeDraft) : null,
  sessions: data.sessions.map(normalizeSession),
});

export const isWorkoutSession = (value: unknown): value is WorkoutSession => {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<WorkoutSession>;
  return (
    typeof session.id === 'string' &&
    isWeek(session.week) &&
    isDay(session.day) &&
    isDate(session.startedAt) &&
    (session.completedAt === undefined || isDate(session.completedAt)) &&
    Number.isInteger(session.activeExerciseIndex) &&
    (session.activeExerciseIndex ?? -1) >= 0 &&
    Array.isArray(session.exercises) &&
    session.exercises.length > 0 &&
    (session.activeExerciseIndex ?? 0) < session.exercises.length &&
    session.exercises.every(isExerciseLog)
  );
};

export const isAppData = (value: unknown): value is AppData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<AppData>;
  return (
    data.version === 1 &&
    !!data.settings &&
    (data.settings.defaultWeightUnit === 'lb' || data.settings.defaultWeightUnit === 'kg') &&
    (data.settings.defaultDistanceUnit === 'mi' || data.settings.defaultDistanceUnit === 'km') &&
    (data.settings.selectedWeek === undefined || isWeek(data.settings.selectedWeek)) &&
    (data.activeDraft === null || isWorkoutSession(data.activeDraft)) &&
    Array.isArray(data.sessions) &&
    data.sessions.every(isWorkoutSession) &&
    Array.isArray(data.legacyCompletions) &&
    data.legacyCompletions.every((item) =>
      !!item &&
      typeof item === 'object' &&
      typeof item.day === 'string' &&
      Array.isArray(item.workoutIds) &&
      item.workoutIds.every((id) => typeof id === 'string')) &&
    typeof data.legacyImported === 'boolean'
  );
};

const readLegacy = (storage: Storage): LegacyCompletion[] => {
  const raw = storage.getItem(LEGACY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
    return Object.entries(parsed)
      .filter(([, ids]) => Array.isArray(ids) && ids.every((id) => typeof id === 'string'))
      .map(([day, ids]) => ({ day, workoutIds: ids as string[] }));
  } catch {
    return [];
  }
};

export const loadAppData = (storage: Storage = window.localStorage): LoadResult => {
  const raw = storage.getItem(STORAGE_KEY);
  let data = createDefaultData();
  let warning: string | undefined;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isAppData(parsed)) data = normalizeAppData(parsed);
      else warning = 'Saved workout data had an unsupported format. A clean local workspace was loaded.';
    } catch {
      warning = 'Saved workout data could not be read. A clean local workspace was loaded.';
    }
  }

  if (!data.legacyImported) {
    const legacyCompletions = readLegacy(storage);
    data = { ...data, legacyCompletions, legacyImported: true };
    return { data, warning, migratedLegacy: legacyCompletions.length > 0 };
  }

  return { data, warning, migratedLegacy: false };
};

export const saveAppData = (data: AppData, storage: Storage = window.localStorage) => {
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const parseBackup = (text: string): AppData => {
  const value = JSON.parse(text) as unknown;
  if (!isAppData(value)) throw new Error('This file is not a valid LiftTrack version 1 backup.');
  return normalizeAppData(value);
};

export const serializeBackup = (data: AppData) => JSON.stringify(data, null, 2);
