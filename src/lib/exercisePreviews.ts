import type { Week } from '../types';

const previewFiles: Record<string, string> = {
  'Chest Press': 'chest-press.webp',
  'Lat Pulldown': 'lat-pulldown.webp',
  'Seated Row': 'seated-row.webp',
  'Push-ups': 'push-ups.webp',
  'Dumbbell Bench Press': 'dumbbell-bench-press.webp',
  'Dumbbell Flyes': 'dumbbell-flyes.webp',
  'Leg Press': 'leg-press.webp',
  'Bodyweight Squats': 'bodyweight-squats.webp',
  Plank: 'plank.webp',
  'Leg Extensions': 'leg-extensions.webp',
  'Leg Curls': 'leg-curls.webp',
  Crunches: 'crunches.webp',
  'Cable Crunch': 'cable-crunch.webp',
  'Shoulder Press': 'shoulder-press.webp',
  'Biceps Curl': 'biceps-curl.webp',
  'Triceps Pushdown': 'triceps-pushdown.webp',
};

export const getExercisePreview = (name: string, week: Week) => {
  const file = name.includes('Cardio') || name === 'Cool-down'
    ? week === 1
      ? 'cardio-treadmill.webp'
      : week === 2
        ? 'cardio-elliptical.webp'
        : 'cardio-bike.webp'
    : previewFiles[name];

  return file
    ? `${import.meta.env.BASE_URL}exercises/${file}`
    : `${import.meta.env.BASE_URL}lifttrack.svg`;
};

export const getExercisePreviewAlt = (name: string) => `${name} form preview`;
