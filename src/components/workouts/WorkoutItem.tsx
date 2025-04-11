import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Workout } from './workoutData';

interface WorkoutItemProps {
  workout: Workout;
  isCompleted: boolean;
  onToggleCompletion: () => void;
}

const WorkoutItem: React.FC<WorkoutItemProps> = ({ 
  workout, 
  isCompleted, 
  onToggleCompletion 
}) => {
  const [showVideo, setShowVideo] = useState(false);

  // Get color based on workout type
  const getWorkoutTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'upper':
        return 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30';
      case 'lower':
        return 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30';
      case 'cardio':
        return 'bg-[#EC4899]/20 text-[#EC4899] border border-[#EC4899]/30';
      default:
        return 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-5 mb-4 rounded-xl shadow-md transition-all duration-300 ${
        isCompleted 
          ? 'bg-green-500/10 backdrop-blur-md border border-green-500/20' 
          : 'bg-gray-800/40 backdrop-blur-md border border-gray-700/50'
      } hover:shadow-lg`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center mb-2">
            {/* Workout Type Icon with larger touch area */}
            <span className="mr-3 text-xl text-white">
              {workout.type === 'upper' ? '💪' : 
               workout.type === 'lower' ? '🦵' : 
               workout.type === 'cardio' ? '🏃' : '🏋️'}
            </span>
            <h3 className="font-semibold text-lg text-white">{workout.name}</h3>
          </div>
          
          {workout.note && <p className="text-gray-300 mb-3">{workout.note}</p>}
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getWorkoutTypeColor(workout.type)}`}>
              {workout.type}
            </span>
            
            {workout.sets && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-200">
                {workout.sets} sets
              </span>
            )}
            
            {workout.reps && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-200">
                {workout.reps} reps
              </span>
            )}
          </div>

          {workout.videoUrl && (
            <button 
              onClick={() => setShowVideo(!showVideo)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center py-2 px-1 mt-1 mb-3 sm:mb-0"
            >
              <span className="mr-2 text-lg">🎬</span>
              {showVideo ? 'Hide' : 'Show'} video demo
            </button>
          )}
        </div>
        
        <button 
          onClick={onToggleCompletion}
          className={`mt-2 sm:mt-0 p-3 rounded-full transition-colors duration-300 ${
            isCompleted 
              ? 'text-green-500 hover:text-green-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <div className="bg-green-500/20 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center border border-green-500/30">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="border-2 border-gray-500/50 w-8 h-8 rounded-full"></div>
          )}
        </button>
      </div>
      
      {showVideo && workout.videoUrl && (
        <div className="mt-4 relative pt-[56.25%] bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700/50">
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-md"
            src={workout.videoUrl}
            title={`Video demo for ${workout.name}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </motion.div>
  );
};

export default WorkoutItem; 