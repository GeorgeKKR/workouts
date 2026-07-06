import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getWorkouts } from '../components/workouts/workoutData';
import { loadAppData, saveAppData } from '../lib/storage';
import type {
  AppData,
  AppSettings,
  Day,
  ExerciseLog,
  Workout,
  WorkoutSession,
  Week,
} from '../types';

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createExerciseLog = (workout: Workout, settings: AppSettings): ExerciseLog => ({
  exerciseId: workout.id,
  name: workout.name,
  videoUrl: workout.videoUrl,
  type: workout.type,
  input: workout.input,
  target: `${workout.sets} × ${workout.reps}`,
  sets: workout.input === 'cardio'
    ? []
    : Array.from({ length: workout.sets }, () => ({
      id: createId(),
      weight: '',
      unit: settings.defaultWeightUnit,
      reps: '',
      durationSeconds: '',
      completed: false,
    })),
  cardio: workout.input === 'cardio'
    ? {
      durationMinutes: '',
      distance: '',
      distanceUnit: settings.defaultDistanceUnit,
      machine: '',
    }
    : undefined,
  completed: false,
});

interface FitnessContextValue {
  data: AppData;
  warning?: string;
  migratedLegacy: boolean;
  startSession: (day: Day, week: Week) => WorkoutSession;
  updateDraft: (updater: (draft: WorkoutSession) => WorkoutSession) => void;
  finishSession: () => void;
  abandonDraft: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  replaceData: (data: AppData) => void;
}

const FitnessContext = createContext<FitnessContextValue | null>(null);

export const FitnessProvider = ({ children }: { children: ReactNode }) => {
  const [{ data: initialData, warning, migratedLegacy }] = useState(() => loadAppData());
  const [data, setData] = useState(initialData);

  const commit = useCallback((updater: (previous: AppData) => AppData) => {
    setData((previous) => {
      const next = updater(previous);
      saveAppData(next);
      return next;
    });
  }, []);

  const startSession = useCallback((day: Day, week: Week) => {
    if (data.activeDraft) return data.activeDraft;
    const session: WorkoutSession = {
      id: createId(),
      day,
      week,
      startedAt: new Date().toISOString(),
      activeExerciseIndex: 0,
      exercises: getWorkouts(day, week).map((workout) => createExerciseLog(workout, data.settings)),
    };
    commit((previous) => ({ ...previous, activeDraft: session }));
    return session;
  }, [commit, data.activeDraft, data.settings]);

  const updateDraft = useCallback((updater: (draft: WorkoutSession) => WorkoutSession) => {
    commit((previous) => previous.activeDraft
      ? { ...previous, activeDraft: updater(previous.activeDraft) }
      : previous);
  }, [commit]);

  const finishSession = useCallback(() => {
    commit((previous) => {
      if (!previous.activeDraft) return previous;
      const completed: WorkoutSession = {
        ...previous.activeDraft,
        completedAt: new Date().toISOString(),
        exercises: previous.activeDraft.exercises,
      };
      return {
        ...previous,
        activeDraft: null,
        sessions: [completed, ...previous.sessions],
      };
    });
  }, [commit]);

  const abandonDraft = useCallback(() => {
    commit((previous) => ({ ...previous, activeDraft: null }));
  }, [commit]);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    commit((previous) => ({ ...previous, settings: { ...previous.settings, ...settings } }));
  }, [commit]);

  const replaceData = useCallback((replacement: AppData) => {
    saveAppData(replacement);
    setData(replacement);
  }, []);

  const value = useMemo(() => ({
    data,
    warning,
    migratedLegacy,
    startSession,
    updateDraft,
    finishSession,
    abandonDraft,
    updateSettings,
    replaceData,
  }), [
    abandonDraft,
    data,
    finishSession,
    migratedLegacy,
    replaceData,
    startSession,
    updateDraft,
    updateSettings,
    warning,
  ]);

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) throw new Error('useFitness must be used inside FitnessProvider');
  return context;
};
