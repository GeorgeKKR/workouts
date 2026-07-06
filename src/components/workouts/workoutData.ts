import type { Day, Week, Workout, WorkoutSchedule } from '../../types';

const youtube = (id: string) => `https://www.youtube.com/embed/${id}`;

const videoUrls = {
  chestPress: youtube('xUm0BiZCWlQ'),
  latPulldown: youtube('CAwf7n6Luuc'),
  seatedRow: youtube('GZbfZ033f74'),
  pushups: youtube('IODxDxX7oi4'),
  dumbbellBenchPress: youtube('VmB1G1K7v94'),
  dumbbellFlyes: youtube('eozdVDA78K0'),
  legPress: youtube('IZxyjW7MPJQ'),
  bodyweightSquats: youtube('YaXPRqUwItQ'),
  plank: youtube('ASdvN_XEl_c'),
  legExtensions: youtube('YyvSfVjQeL0'),
  legCurls: youtube('1Tq3QdYUuHs'),
  crunches: youtube('Xyd_fa5zoEU'),
  cableCrunch: youtube('AV5PmZJIrrw'),
  treadmill: youtube('bhBU_WYAKGk'),
  elliptical: youtube('xAB1LxfCpYA'),
  stationaryBike: youtube('BwAAR7yMuyc'),
};

const workout = (
  id: string,
  name: string,
  sets: number,
  reps: string,
  type: Workout['type'],
  input: Workout['input'],
  videoUrl: string,
  guidance?: string,
): Workout => ({ id, name, sets, reps, type, input, videoUrl, guidance });

const upper = (week: Week): Workout[] => {
  const reps = week === 1 ? '15' : '10–12';
  const guidance = week === 1 ? undefined : 'Increase weight when form stays clean';
  const items = [
    workout(`chest-press-${week}`, 'Chest Press', 3, reps, 'upper', 'strength', videoUrls.chestPress, guidance ?? 'Machine'),
    workout(`lat-pulldown-${week}`, 'Lat Pulldown', 3, reps, 'upper', 'strength', videoUrls.latPulldown, guidance),
    workout(`seated-row-${week}`, 'Seated Row', 3, reps, 'upper', 'strength', videoUrls.seatedRow, guidance),
    workout(`pushups-${week}`, 'Push-ups', 3, 'As many as possible', 'upper', 'reps', videoUrls.pushups),
  ];
  if (week >= 3) items.push(workout(`dumbbell-bench-${week}`, 'Dumbbell Bench Press', 3, '8–10', 'upper', 'strength', videoUrls.dumbbellBenchPress));
  if (week === 4) items.push(workout('dumbbell-flyes-4', 'Dumbbell Flyes', 3, '10–12', 'upper', 'strength', videoUrls.dumbbellFlyes));
  return items;
};

const lower = (week: Week): Workout[] => {
  const items = [
    workout(`leg-press-${week}`, 'Leg Press', 3, week === 1 ? '15' : '10–12', 'lower', 'strength', videoUrls.legPress),
    workout(`bodyweight-squats-${week}`, 'Bodyweight Squats', 3, week === 1 ? '12' : '15', 'lower', 'reps', videoUrls.bodyweightSquats),
    workout(`plank-${week}`, 'Plank', 3, `${15 + week * 15} sec`, 'lower', 'duration', videoUrls.plank),
  ];
  if (week >= 2) {
    items.push(workout(`leg-extensions-${week}`, 'Leg Extensions', 3, '12–15', 'lower', 'strength', videoUrls.legExtensions));
    items.push(workout(`leg-curls-${week}`, 'Leg Curls', 3, '12–15', 'lower', 'strength', videoUrls.legCurls));
  }
  if (week >= 3) {
    items.push(workout(`crunches-${week}`, 'Crunches', 3, '15–20', 'lower', 'reps', videoUrls.crunches));
    items.push(workout(`cable-crunch-${week}`, 'Cable Crunch', 3, '15–20', 'lower', 'strength', videoUrls.cableCrunch));
  }
  return items;
};

const cardio = (week: Week): Workout[] => [
  workout(
    `cardio-${week}`,
    'Cardio',
    1,
    week === 1 ? '20–30 min' : '30–40 min',
    'cardio',
    'cardio',
    week === 1 ? videoUrls.treadmill : week === 2 ? videoUrls.elliptical : videoUrls.stationaryBike,
    week === 1 ? 'Easy pace on treadmill, bike, or elliptical' : 'Add intervals and vary the machine',
  ),
];

const weeks = [1, 2, 3, 4] as const;
const buildDay = (builder: (week: Week) => Workout[]) =>
  Object.fromEntries(weeks.map((week) => [week, builder(week)])) as Record<Week, Workout[]>;

export const workoutSchedule: WorkoutSchedule = {
  monday: buildDay(upper),
  tuesday: buildDay(cardio),
  wednesday: buildDay(lower),
  thursday: buildDay(cardio),
  friday: buildDay(upper),
  saturday: buildDay(lower),
  sunday: buildDay(() => []),
};

export const getToday = (): Day => {
  const jsDays: Day[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return jsDays[new Date().getDay()];
};

export const getWorkouts = (day: Day, week: Week) => workoutSchedule[day][week];
