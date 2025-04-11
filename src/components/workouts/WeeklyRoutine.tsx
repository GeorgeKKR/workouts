import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import WorkoutDay from './WorkoutDay';
import { workoutSchedule, Workout } from './workoutData';

interface WeeklyRoutineProps {
  currentWeek: number;
}

type WeekKey = `week${number}`;

// Using Record<string, any> to bypass TypeScript strict checking
// This is a workaround for the dynamic nature of the workoutSchedule object
type ScheduleDay = Record<string, any>;

const WeeklyRoutine: React.FC<WeeklyRoutineProps> = ({ currentWeek }) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, string[]>>({});
  
  // Get current day name
  useEffect(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    setSelectedDay(today);
  }, []);
  
  // Load completed workouts from localStorage
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('completedWorkouts');
    if (savedWorkouts) {
      setCompletedWorkouts(JSON.parse(savedWorkouts));
    }
  }, []);

  // Save completed workouts to localStorage
  useEffect(() => {
    localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  const toggleWorkoutCompletion = (day: string, workoutId: string) => {
    setCompletedWorkouts(prev => {
      const dayWorkouts = prev[day] || [];
      const newDayWorkouts = dayWorkouts.includes(workoutId)
        ? dayWorkouts.filter(id => id !== workoutId)
        : [...dayWorkouts, workoutId];
      
      return {
        ...prev,
        [day]: newDayWorkouts
      };
    });
  };

  const getCompletionStats = () => {
    const weekKey = `week${currentWeek}` as WeekKey;
    
    // Use explicit casting to work around TypeScript limitations with the dynamic object structure
    const totalWorkouts = Object.values(workoutSchedule as Record<string, ScheduleDay>)
      .reduce((total: number, day: ScheduleDay) => {
        const workouts = (day[weekKey] || []) as Workout[];
        return total + workouts.length;
      }, 0);
    
    const completedCount = Object.entries(completedWorkouts)
      .reduce((total: number, [day, workouts]) => {
        // Safe access with type assertions
        const schedule = workoutSchedule as Record<string, ScheduleDay>;
        const daySchedule = schedule[day] ? (schedule[day][weekKey] || []) as Workout[] : [];
        
        const validCompletions = workouts.filter(id => 
          daySchedule.some((workout: Workout) => workout.id === id)
        );
        return total + validCompletions.length;
      }, 0);
    
    return {
      total: totalWorkouts,
      completed: completedCount,
      percentage: totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0
    };
  };

  const stats = getCompletionStats();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };
  
  const dayButtonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Image backgrounds for different workout types
  const getWorkoutTypeImage = (day: string) => {
    const dayLower = day.toLowerCase();
    if (dayLower === 'monday' || dayLower === 'friday') return 'upper-body';
    if (dayLower === 'wednesday' || dayLower === 'saturday') return 'lower-body';
    if (dayLower === 'tuesday' || dayLower === 'thursday') return 'cardio';
    return 'rest';
  };
  
  // Get workout count for each day
  const getWorkoutCount = (day: string) => {
    const weekKey = `week${currentWeek}` as WeekKey;
    const schedule = workoutSchedule as Record<string, ScheduleDay>;
    if (!schedule[day] || !schedule[day][weekKey]) return 0;
    return (schedule[day][weekKey] as Workout[]).length;
  };
  
  return (
    <div className="bg-[#2A2A3C] rounded-xl shadow-xl border border-gray-700 overflow-hidden">
      {/* Header image based on selected workout type */}
      <div className="relative h-48 overflow-hidden">
        {selectedDay && (
          <div className="absolute inset-0">
            {getWorkoutTypeImage(selectedDay) === 'upper-body' && (
              <img 
                src="https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Upper body workout" 
                className="w-full h-full object-cover"
              />
            )}
            {getWorkoutTypeImage(selectedDay) === 'lower-body' && (
              <img 
                src="https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80" 
                alt="Lower body workout" 
                className="w-full h-full object-cover"
              />
            )}
            {getWorkoutTypeImage(selectedDay) === 'cardio' && (
              <img 
                src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80" 
                alt="Cardio workout" 
                className="w-full h-full object-cover"
              />
            )}
            {getWorkoutTypeImage(selectedDay) === 'rest' && (
              <img 
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Rest day" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A3C] to-black/60"></div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white capitalize">
                {selectedDay ? `${selectedDay}'s Workout` : 'Weekly Plan'}
              </h2>
              {selectedDay && (
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-300 mr-3">
                    Week {currentWeek}
                  </span>
                  <span className="bg-[#3B82F6] text-white text-xs font-medium px-2 py-1 rounded">
                    {getWorkoutTypeImage(selectedDay) !== 'rest' ? getWorkoutTypeImage(selectedDay).replace('-', ' ') : 'Rest Day'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Day selector */}
      <div className="px-6 pt-4">
        <LazyMotion features={domAnimation}>
          <motion.div 
            className="flex space-x-3 overflow-x-auto pb-4 -mx-2 px-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Object.keys(workoutSchedule).map((day) => {
              const isToday = new Date().getDay() === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day.toLowerCase());
              const workoutCount = getWorkoutCount(day);
              
              return (
                <motion.button
                  key={day}
                  variants={dayButtonVariants}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 rounded-xl p-3 transition-all duration-200 ${
                    selectedDay === day 
                      ? 'bg-[#3B82F6] text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center justify-center min-w-[55px]">
                    <span className="text-xs font-medium uppercase mb-2">
                      {day.slice(0, 3)}
                      {isToday && <span className="ml-1 text-[8px] font-bold bg-gray-900/30 px-1 rounded">TODAY</span>}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      selectedDay === day ? 'bg-[#2563EB]/30' : 'bg-gray-700/50'
                    }`}>
                      {day === 'monday' && <span className="text-xl">🏋️</span>}
                      {day === 'tuesday' && <span className="text-xl">🏃</span>}
                      {day === 'wednesday' && <span className="text-xl">💪</span>}
                      {day === 'thursday' && <span className="text-xl">🏃</span>}
                      {day === 'friday' && <span className="text-xl">🏋️</span>}
                      {day === 'saturday' && <span className="text-xl">💪</span>}
                      {day === 'sunday' && <span className="text-xl">😴</span>}
                    </div>
                    {workoutCount > 0 ? (
                      <span className="text-xs">
                        {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
                      </span>
                    ) : (
                      <span className="text-xs">Rest day</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
          
          {/* Overall progress bar */}
          <div className="flex items-center mb-6 px-1">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden mr-3">
              <div 
                className="h-full bg-[#3B82F6] rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
              {stats.completed}/{stats.total} complete
            </span>
          </div>
          
          {/* Selected day workouts */}
          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 0.1, 0.25, 1.0],
                  staggerChildren: 0.1 
                }}
                className="pb-6 px-1"
              >
                <WorkoutDay
                  day={selectedDay}
                  week={currentWeek}
                  workouts={
                    selectedDay in workoutSchedule 
                      ? ((workoutSchedule as Record<string, ScheduleDay>)[selectedDay][`week${currentWeek}`] as Workout[] || [])
                      : []
                  }
                  completedWorkouts={completedWorkouts[selectedDay] || []}
                  onToggleCompletion={(workoutId: string) => toggleWorkoutCompletion(selectedDay, workoutId)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </LazyMotion>
      </div>
    </div>
  );
};

export default WeeklyRoutine; 