import type { Day, Week, Workout, WorkoutSchedule } from '../../types';

const youtube = (id: string) => `https://www.youtube.com/embed/${id}`;

const videoUrls = {
  chestPress: youtube('xUm0BiZCWlQ'),
  shoulderPress: youtube('qEwKCR5JCog'),
  latPulldown: youtube('CAwf7n6Luuc'),
  seatedRow: youtube('GZbfZ033f74'),
  legPress: youtube('IZxyjW7MPJQ'),
  legCurls: youtube('1Tq3QdYUuHs'),
  bicepsCurl: youtube('ykJmrZ5v0Oo'),
  tricepsPushdown: youtube('2-LAMcpzODU'),
  plank: youtube('ASdvN_XEl_c'),
  treadmill: youtube('bhBU_WYAKGk'),
  elliptical: youtube('xAB1LxfCpYA'),
  stationaryBike: youtube('BwAAR7yMuyc'),
};

type WorkoutOptions = Pick<Workout, 'guidance' | 'startingWeight' | 'restSeconds' | 'videoUrl'>;

const workout = (
  id: string,
  name: string,
  sets: number,
  reps: string,
  type: Workout['type'],
  input: Workout['input'],
  options: WorkoutOptions = {},
): Workout => ({ id, name, sets, reps, type, input, ...options });

const strength = (
  week: Week,
  id: string,
  name: string,
  sets: number,
  reps: string,
  type: Workout['type'],
  startingWeight: string,
  restSeconds: number,
  videoUrl?: string,
) => workout(`${id}-${week}`, name, sets, reps, type, 'strength', {
  startingWeight,
  restSeconds,
  videoUrl,
  guidance: week <= 2
    ? 'Starting target only—leave 2–3 reps in reserve with clean form'
    : 'Increase only after all sets reach the top of the range with clean form',
});

const warmup = (week: Week) => workout(`warmup-cardio-${week}`, 'Warm-up Cardio', 1, '5–10 min', 'cardio', 'cardio', {
  videoUrl: videoUrls.treadmill,
  guidance: 'Easy pace, then dynamic stretches',
});

const postLiftCardio = (week: Week) => workout(`post-lift-cardio-${week}`, 'Post-lift Cardio', 1, '20–30 min', 'cardio', 'cardio', {
  videoUrl: videoUrls.elliptical,
  guidance: 'Moderate, conversational pace (Zone 2)',
});

const cooldown = (week: Week) => workout(`cooldown-${week}`, 'Cool-down', 1, '5–10 min', 'cardio', 'cardio', {
  videoUrl: videoUrls.stationaryBike,
  guidance: 'Easy pace, then stretch major muscles',
});

const monday = (week: Week): Workout[] => [
  warmup(week),
  strength(week, 'leg-press-mon', 'Leg Press', 3, '8–12', 'lower', '90–140 lb / 40–64 kg', 90, videoUrls.legPress),
  strength(week, 'leg-curls-mon', 'Leg Curls', 3, '10–12', 'lower', '40–70 lb / 18–32 kg', 75, videoUrls.legCurls),
  strength(week, 'chest-press-mon', 'Chest Press', 3, '8–12', 'upper', '50–80 lb / 23–36 kg', 90, videoUrls.chestPress),
  strength(week, 'lat-pulldown-mon', 'Lat Pulldown', 3, '8–12', 'upper', '60–90 lb / 27–41 kg', 90, videoUrls.latPulldown),
  strength(week, 'shoulder-press-mon', 'Shoulder Press', 3, '8–12', 'upper', '30–50 lb / 14–23 kg', 75, videoUrls.shoulderPress),
  strength(week, 'biceps-curl-mon', 'Biceps Curl', 2, '10–12', 'upper', '15–25 lb dumbbells / 7–11 kg', 60, videoUrls.bicepsCurl),
  strength(week, 'triceps-pushdown-mon', 'Triceps Pushdown', 2, '10–12', 'upper', '30–50 lb / 14–23 kg', 60, videoUrls.tricepsPushdown),
  workout(`plank-mon-${week}`, 'Plank', 2, '20–40 sec', 'lower', 'duration', { restSeconds: 60, videoUrl: videoUrls.plank, guidance: 'Bodyweight · brace your core and keep a neutral spine' }),
  postLiftCardio(week),
  cooldown(week),
];

const wednesday = (week: Week): Workout[] => [
  warmup(week),
  strength(week, 'smith-squat-wed', 'Smith Machine Squat', 3, '8–10', 'lower', 'Bar + 10–25 lb per side', 90),
  strength(week, 'romanian-deadlift-wed', 'Dumbbell Romanian Deadlift', 3, '10–12', 'lower', '25–40 lb dumbbells', 90),
  strength(week, 'incline-press-wed', 'Incline Dumbbell Press', 3, '8–12', 'upper', '25–35 lb dumbbells', 90),
  strength(week, 'cable-row-wed', 'Seated Cable Row', 3, '8–12', 'upper', '60–90 lb / 27–41 kg', 90),
  strength(week, 'lateral-raise-wed', 'Dumbbell Lateral Raise', 2, '12–15', 'upper', '10–15 lb dumbbells', 60),
  strength(week, 'cable-curl-wed', 'Cable Curl', 2, '10–12', 'upper', '25–45 lb / 11–20 kg', 60),
  strength(week, 'assisted-dip-wed', 'Assisted Dip Machine', 2, '10–12', 'upper', '70–110 lb assistance', 60),
  strength(week, 'machine-crunch-wed', 'Machine Crunch', 2, '10–15', 'lower', '30–60 lb / 14–27 kg', 60),
  postLiftCardio(week),
  cooldown(week),
];

const friday = (week: Week): Workout[] => [
  warmup(week),
  strength(week, 'leg-press-fri', 'Leg Press', 3, '8–12', 'lower', '100–150 lb / 45–68 kg', 90, videoUrls.legPress),
  strength(week, 'leg-curls-fri', 'Leg Curls', 3, '10–12', 'lower', '45–75 lb / 20–34 kg', 75, videoUrls.legCurls),
  strength(week, 'chest-press-fri', 'Chest Press', 3, '8–12', 'upper', '55–85 lb / 25–39 kg', 90, videoUrls.chestPress),
  strength(week, 'lat-pulldown-fri', 'Lat Pulldown', 3, '8–12', 'upper', '65–95 lb / 29–43 kg', 90, videoUrls.latPulldown),
  strength(week, 'machine-row-fri', 'Machine Row', 3, '8–12', 'upper', '60–90 lb / 27–41 kg', 90),
  strength(week, 'hammer-curl-fri', 'Dumbbell Hammer Curl', 2, '10–12', 'upper', '15–25 lb dumbbells / 7–11 kg', 60),
  strength(week, 'triceps-pushdown-fri', 'Triceps Pushdown', 2, '10–12', 'upper', '35–55 lb / 16–25 kg', 60, videoUrls.tricepsPushdown),
  workout(`hanging-knee-raise-fri-${week}`, 'Hanging Knee Raise', 2, '8–12', 'lower', 'reps', { restSeconds: 60, guidance: 'Bodyweight · control each rep without swinging' }),
  postLiftCardio(week),
  cooldown(week),
];

const cardio = (week: Week, id: string, name: string, reps: string, guidance: string, videoUrl: string): Workout[] => [
  workout(`${id}-${week}`, name, 1, reps, 'cardio', 'cardio', { guidance, videoUrl }),
];

const weeks = [1, 2, 3, 4] as const;
const buildDay = (builder: (week: Week) => Workout[]) =>
  Object.fromEntries(weeks.map((week) => [week, builder(week)])) as Record<Week, Workout[]>;

export const workoutSchedule: WorkoutSchedule = {
  monday: buildDay(monday),
  tuesday: buildDay((week) => cardio(week, 'steady-cardio', 'Steady-state Cardio', '30 min', 'Moderate pace—you should still be able to hold a conversation', videoUrls.treadmill)),
  wednesday: buildDay(wednesday),
  thursday: buildDay((week) => cardio(week, 'active-recovery', 'Active Recovery Cardio', '20–30 min', 'Light walk, bike, or elliptical; finish with gentle stretching', videoUrls.stationaryBike)),
  friday: buildDay(friday),
  saturday: buildDay((week) => cardio(week, 'optional-cardio', 'Optional Cardio', '20–30 min', 'Choose an easy activity you enjoy—walk, bike, or elliptical', videoUrls.elliptical)),
  sunday: buildDay(() => []),
};

export const getToday = (): Day => {
  const jsDays: Day[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return jsDays[new Date().getDay()];
};

export const getWorkouts = (day: Day, week: Week) => workoutSchedule[day][week];
