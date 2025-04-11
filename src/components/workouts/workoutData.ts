export interface Workout {
  id: string;
  name: string;
  sets: string;
  reps: string;
  note?: string;
  videoUrl: string;
  type: 'upper' | 'lower' | 'cardio';
}

interface DaySchedule {
  week1?: Workout[];
  week2?: Workout[];
  week3?: Workout[];
  week4?: Workout[];
}

interface Schedule {
  [key: string]: DaySchedule;
}

// Video URLs for exercise demonstrations
const videoUrls = {
  // Upper body
  chestPress: 'https://www.youtube.com/embed/xUm0BiZCWlQ',
  latPulldown: 'https://www.youtube.com/embed/CAwf7n6Luuc',
  seatedRow: 'https://www.youtube.com/embed/GZbfZ033f74',
  pushups: 'https://www.youtube.com/embed/IODxDxX7oi4',
  dumbbellBenchPress: 'https://www.youtube.com/embed/VmB1G1K7v94',
  dumbbellFlyes: 'https://www.youtube.com/embed/eozdVDA78K0',
  
  // Lower body & Core
  legPress: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
  bodyweightSquats: 'https://www.youtube.com/embed/YaXPRqUwItQ',
  plank: 'https://www.youtube.com/embed/ASdvN_XEl_c',
  legExtensions: 'https://www.youtube.com/embed/YyvSfVjQeL0',
  legCurls: 'https://www.youtube.com/embed/1Tq3QdYUuHs',
  crunches: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
  cableCrunch: 'https://www.youtube.com/embed/AV5PmZJIrrw',
  
  // Cardio
  treadmill: 'https://www.youtube.com/embed/bhBU_WYAKGk',
  elliptical: 'https://www.youtube.com/embed/xAB1LxfCpYA',
  stationaryBike: 'https://www.youtube.com/embed/BwAAR7yMuyc'
};

// Workouts for Workout A: Upper Body Focus
const upperBodyWorkouts = {
  week1: [
    { id: 'chest-press-1', name: 'Chest Press', sets: '3', reps: '15', note: 'Machine', type: 'upper' as const, videoUrl: videoUrls.chestPress },
    { id: 'lat-pulldown-1', name: 'Lat Pulldown', sets: '3', reps: '15', type: 'upper' as const, videoUrl: videoUrls.latPulldown },
    { id: 'seated-row-1', name: 'Seated Row', sets: '3', reps: '15', type: 'upper' as const, videoUrl: videoUrls.seatedRow },
    { id: 'pushups-1', name: 'Push-ups', sets: '3', reps: 'As many as possible', type: 'upper' as const, videoUrl: videoUrls.pushups }
  ],
  week2: [
    { id: 'chest-press-2', name: 'Chest Press', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.chestPress },
    { id: 'lat-pulldown-2', name: 'Lat Pulldown', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.latPulldown },
    { id: 'seated-row-2', name: 'Seated Row', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.seatedRow },
    { id: 'pushups-2', name: 'Push-ups', sets: '3', reps: 'As many as possible', type: 'upper' as const, videoUrl: videoUrls.pushups }
  ],
  week3: [
    { id: 'chest-press-3', name: 'Chest Press', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.chestPress },
    { id: 'lat-pulldown-3', name: 'Lat Pulldown', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.latPulldown },
    { id: 'seated-row-3', name: 'Seated Row', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.seatedRow },
    { id: 'pushups-3', name: 'Push-ups', sets: '3', reps: 'As many as possible', type: 'upper' as const, videoUrl: videoUrls.pushups },
    { id: 'dumbbell-bench-3', name: 'Dumbbell Bench Press', sets: '3', reps: '8-10', type: 'upper' as const, videoUrl: videoUrls.dumbbellBenchPress }
  ],
  week4: [
    { id: 'chest-press-4', name: 'Chest Press', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.chestPress },
    { id: 'lat-pulldown-4', name: 'Lat Pulldown', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.latPulldown },
    { id: 'seated-row-4', name: 'Seated Row', sets: '3', reps: '10-12', note: 'Increase weight', type: 'upper' as const, videoUrl: videoUrls.seatedRow },
    { id: 'pushups-4', name: 'Push-ups', sets: '3', reps: 'As many as possible', type: 'upper' as const, videoUrl: videoUrls.pushups },
    { id: 'dumbbell-bench-4', name: 'Dumbbell Bench Press', sets: '3', reps: '8-10', type: 'upper' as const, videoUrl: videoUrls.dumbbellBenchPress },
    { id: 'dumbbell-flyes-4', name: 'Dumbbell Flyes', sets: '3', reps: '10-12', type: 'upper' as const, videoUrl: videoUrls.dumbbellFlyes }
  ]
};

// Workouts for Workout B: Lower Body & Core
const lowerBodyWorkouts = {
  week1: [
    { id: 'leg-press-1', name: 'Leg Press', sets: '3', reps: '15', type: 'lower' as const, videoUrl: videoUrls.legPress },
    { id: 'bodyweight-squats-1', name: 'Bodyweight Squats', sets: '3', reps: '12', type: 'lower' as const, videoUrl: videoUrls.bodyweightSquats },
    { id: 'plank-1', name: 'Plank', sets: '3', reps: '30 sec', type: 'lower' as const, videoUrl: videoUrls.plank }
  ],
  week2: [
    { id: 'leg-press-2', name: 'Leg Press', sets: '3', reps: '10-12', note: 'Increase weight', type: 'lower' as const, videoUrl: videoUrls.legPress },
    { id: 'bodyweight-squats-2', name: 'Bodyweight Squats', sets: '3', reps: '15', type: 'lower' as const, videoUrl: videoUrls.bodyweightSquats },
    { id: 'plank-2', name: 'Plank', sets: '3', reps: '45 sec', type: 'lower' as const, videoUrl: videoUrls.plank },
    { id: 'leg-extensions-2', name: 'Leg Extensions', sets: '3', reps: '12-15', type: 'lower' as const, videoUrl: videoUrls.legExtensions },
    { id: 'leg-curls-2', name: 'Leg Curls', sets: '3', reps: '12-15', type: 'lower' as const, videoUrl: videoUrls.legCurls }
  ],
  week3: [
    { id: 'leg-press-3', name: 'Leg Press', sets: '3', reps: '10-12', note: 'Increase weight', type: 'lower' as const, videoUrl: videoUrls.legPress },
    { id: 'bodyweight-squats-3', name: 'Bodyweight Squats', sets: '3', reps: '15', type: 'lower' as const, videoUrl: videoUrls.bodyweightSquats },
    { id: 'plank-3', name: 'Plank', sets: '3', reps: '60 sec', type: 'lower' as const, videoUrl: videoUrls.plank },
    { id: 'leg-extensions-3', name: 'Leg Extensions', sets: '3', reps: '12-15', type: 'lower' as const, videoUrl: videoUrls.legExtensions },
    { id: 'leg-curls-3', name: 'Leg Curls', sets: '3', reps: '12-15', type: 'lower' as const, videoUrl: videoUrls.legCurls },
    { id: 'crunches-3', name: 'Crunches', sets: '3', reps: '15-20', type: 'lower' as const, videoUrl: videoUrls.crunches },
    { id: 'cable-crunch-3', name: 'Cable Crunch', sets: '3', reps: '15-20', type: 'lower' as const, videoUrl: videoUrls.cableCrunch }
  ],
  week4: [
    { id: 'leg-press-4', name: 'Leg Press', sets: '3', reps: '10-12', note: 'Increase weight', type: 'lower' as const, videoUrl: videoUrls.legPress },
    { id: 'bodyweight-squats-4', name: 'Bodyweight Squats', sets: '3', reps: '15', type: 'lower' as const, videoUrl: videoUrls.bodyweightSquats },
    { id: 'plank-4', name: 'Plank', sets: '3', reps: '75 sec', type: 'lower' as const, videoUrl: videoUrls.plank },
    { id: 'leg-extensions-4', name: 'Leg Extensions', sets: '3', reps: '12-15', type: 'lower' as const, videoUrl: videoUrls.legExtensions },
    { id: 'leg-curls-4', name: 'Leg Curls', sets: '3', reps: '12-15', type: 'lower' as const, videoUrl: videoUrls.legCurls },
    { id: 'crunches-4', name: 'Crunches', sets: '3', reps: '15-20', type: 'lower' as const, videoUrl: videoUrls.crunches },
    { id: 'cable-crunch-4', name: 'Cable Crunch', sets: '3', reps: '15-20', type: 'lower' as const, videoUrl: videoUrls.cableCrunch }
  ]
};

// Cardio workouts
const cardioWorkouts = {
  week1: [
    { id: 'cardio-1', name: 'Cardio', sets: '1', reps: '20-30 min', note: 'Easy pace on treadmill, bike, or elliptical', type: 'cardio' as const, videoUrl: videoUrls.treadmill }
  ],
  week2: [
    { id: 'cardio-2', name: 'Cardio', sets: '1', reps: '30-40 min', note: 'Add 30-sec faster intervals', type: 'cardio' as const, videoUrl: videoUrls.elliptical }
  ],
  week3: [
    { id: 'cardio-3', name: 'Cardio', sets: '1', reps: '30-40 min', note: 'Try different machines & increase intervals', type: 'cardio' as const, videoUrl: videoUrls.stationaryBike }
  ],
  week4: [
    { id: 'cardio-4', name: 'Cardio', sets: '1', reps: '30-40 min', note: 'Try different machines & increase intervals', type: 'cardio' as const, videoUrl: videoUrls.stationaryBike }
  ]
};

// Create a 4-week workout schedule
export const workoutSchedule: Schedule = {
  monday: {
    week1: upperBodyWorkouts.week1,
    week2: upperBodyWorkouts.week2,
    week3: upperBodyWorkouts.week3,
    week4: upperBodyWorkouts.week4
  },
  tuesday: {
    week1: cardioWorkouts.week1,
    week2: cardioWorkouts.week2,
    week3: cardioWorkouts.week3,
    week4: cardioWorkouts.week4
  },
  wednesday: {
    week1: lowerBodyWorkouts.week1,
    week2: lowerBodyWorkouts.week2,
    week3: lowerBodyWorkouts.week3,
    week4: lowerBodyWorkouts.week4
  },
  thursday: {
    week1: cardioWorkouts.week1,
    week2: cardioWorkouts.week2,
    week3: cardioWorkouts.week3,
    week4: cardioWorkouts.week4
  },
  friday: {
    week1: upperBodyWorkouts.week1,
    week2: upperBodyWorkouts.week2,
    week3: upperBodyWorkouts.week3,
    week4: upperBodyWorkouts.week4
  },
  saturday: {
    week1: lowerBodyWorkouts.week1,
    week2: lowerBodyWorkouts.week2,
    week3: lowerBodyWorkouts.week3,
    week4: lowerBodyWorkouts.week4
  },
  sunday: {} // Rest day
}; 