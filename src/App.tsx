import React, { useState } from 'react';
import WeeklyRoutine from './components/workouts/WeeklyRoutine';

function App() {
  // Set started to true by default to skip welcome screen
  const [started, setStarted] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  
  return (
    <div className="min-h-screen bg-[#1E1E2E] text-gray-200 flex flex-col">
      {!started ? (
        // Welcome screen with hero image
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/2 relative flex flex-col justify-center p-8 md:p-16 z-10">
            <div className="max-w-lg">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Protect<br />Your Health<br />Companion</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Elevate Fitness Journey with a Cutting-Edge to Fuel Your Motivation & Crush Your Goals
              </p>
              <button 
                onClick={() => setStarted(true)}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-4 px-8 rounded-lg transition-all duration-300 shadow-lg text-lg flex items-center justify-center w-full md:w-auto"
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="md:w-1/2 h-80 md:h-auto relative overflow-hidden">
            <img 
              className="absolute inset-0 w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
              alt="Person working out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E2E] via-transparent to-transparent md:bg-gradient-to-r md:from-[#1E1E2E] md:via-transparent md:to-transparent"></div>
          </div>
        </div>
      ) : (
        // Dashboard content
        <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Program Progress */}
            <div className="lg:col-span-4">
              <div className="rounded-xl shadow-xl border border-gray-700 bg-[#2A2A3C] p-6 mb-6 sticky top-8">
                {/* Week selector with more visual design */}
                <div>
                  <h3 className="text-md font-medium text-white mb-4">Program Progress</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((week) => (
                      <button
                        key={week}
                        onClick={() => setCurrentWeek(week)}
                        className={`py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden
                          ${currentWeek === week 
                            ? 'bg-[#3B82F6] text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                      >
                        <span className="relative z-10">Week {week}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 overflow-hidden h-3 text-xs flex rounded-full bg-gray-800 relative">
                    <div 
                      style={{ width: `${currentWeek * 25}%` }} 
                      className="bg-[#3B82F6] h-full rounded-full transition-all duration-700 ease-in-out"
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Form</span>
                    <span>Build</span>
                    <span>Target</span>
                    <span>Refine</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Workout routine */}
            <div className="lg:col-span-8">
              <WeeklyRoutine currentWeek={currentWeek} />
            </div>
          </div>
        </div>
      )}
      
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .shadow-glow {
          box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.3);
        }
        `}
      </style>
    </div>
  );
}

export default App;
