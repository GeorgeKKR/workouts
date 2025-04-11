import React from 'react';
import { motion } from 'framer-motion';
import WorkoutItem from './WorkoutItem';
import { Workout } from './workoutData';

interface WorkoutDayProps {
  day: string;
  week: number;
  workouts: Workout[];
  completedWorkouts: string[];
  onToggleCompletion: (workoutId: string) => void;
}

const WorkoutDay: React.FC<WorkoutDayProps> = ({ 
  day, 
  week, 
  workouts, 
  completedWorkouts, 
  onToggleCompletion 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  // Calculate completion percentage for this day
  const completionPercentage = workouts.length > 0
    ? Math.round((completedWorkouts.length / workouts.length) * 100)
    : 0;

  // Rest day content
  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">😴</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Rest Day</h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Recovery is just as important as exercise. Take time to rest and recover.
        </p>
        
        <div className="mt-8 w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-white">Rest Day Tips</h4>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
              <div className="flex">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-sm">💧</span>
                </div>
                <div>
                  <h5 className="font-medium text-white text-sm">Stay Hydrated</h5>
                  <p className="text-xs text-gray-400 mt-1">Drink plenty of water to aid in muscle recovery</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
              <div className="flex">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-sm">🍎</span>
                </div>
                <div>
                  <h5 className="font-medium text-white text-sm">Proper Nutrition</h5>
                  <p className="text-xs text-gray-400 mt-1">Focus on protein intake to help repair muscle tissue</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
              <div className="flex">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-sm">💤</span>
                </div>
                <div>
                  <h5 className="font-medium text-white text-sm">Quality Sleep</h5>
                  <p className="text-xs text-gray-400 mt-1">Aim for 7-9 hours of sleep to maximize recovery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workout type emojis based on day
  const getWorkoutTypeEmoji = () => {
    const dayLower = day.toLowerCase();
    if (dayLower === 'monday' || dayLower === 'friday') return '🏋️';
    if (dayLower === 'wednesday' || dayLower === 'saturday') return '💪';
    if (dayLower === 'tuesday' || dayLower === 'thursday') return '🏃';
    return '😴';
  };

  return (
    <div>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <div className="mr-3">
            {completionPercentage === 100 ? (
              <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-xl">{getWorkoutTypeEmoji()}</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-300">{completedWorkouts.length} of {workouts.length} completed</span>
              {completionPercentage === 100 && (
                <span className="ml-2 text-xs bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-full">Completed</span>
              )}
            </div>
            <div className="mt-1.5 w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3B82F6]" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Workouts list */}
      <motion.div 
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {workouts.map(workout => (
          <WorkoutItem 
            key={workout.id}
            workout={workout}
            isCompleted={completedWorkouts.includes(workout.id)}
            onToggleCompletion={() => onToggleCompletion(workout.id)}
          />
        ))}
      </motion.div>
      
      {/* Completion message */}
      {workouts.length > 0 && completionPercentage === 100 && (
        <div className="mt-5 bg-[#3B82F6]/5 rounded-xl p-4 border border-[#3B82F6]/20">
          <div className="flex">
            <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
              <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-white text-sm">Great job!</h5>
              <p className="text-xs text-gray-400 mt-1">
                You've completed all workouts for today. Keep up the momentum!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Next workout button */}
      {workouts.length > 0 && completionPercentage < 100 && (
        <button className="mt-5 w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center">
          <span>Start Next Workout</span>
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default WorkoutDay; 