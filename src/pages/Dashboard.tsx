import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToday, getWorkouts } from '../components/workouts/workoutData';
import { useFitness } from '../context/FitnessContext';
import { getExercisePreview, getExercisePreviewAlt } from '../lib/exercisePreviews';
import { DAYS, type Day, type Week, type Workout } from '../types';

const dayLabels: Record<Day, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
type RoutineGroup = 'Warm-up' | 'Strength' | 'Core' | 'Finish' | 'Cardio';

const groupWorkout = (workout: Workout): RoutineGroup => {
  if (workout.name === 'Warm-up Cardio') return 'Warm-up';
  if (workout.name === 'Post-lift Cardio' || workout.name === 'Cool-down') return 'Finish';
  if (workout.type === 'cardio') return 'Cardio';
  if (workout.input === 'duration' || ['Machine Crunch', 'Hanging Knee Raise'].includes(workout.name)) return 'Core';
  return 'Strength';
};

const estimatedLength = (workouts: Workout[]) => workouts.length >= 8 ? 'About 60–75 min' : workouts.length ? 'About 20–30 min' : '';

const missionCopy = (day: Day, workouts: Workout[]) => {
  if (!workouts.length) return { eyebrow: 'Recovery day', title: 'Restore & reset', body: 'An easy walk and a little mobility are enough today.', action: 'View recovery plan' };
  if (workouts.length === 1) return { eyebrow: 'Today’s mission', title: workouts[0].name, body: 'Move at a comfortable pace and build the habit.', action: 'Start session' };
  return { eyebrow: 'Today’s mission', title: day === 'monday' || day === 'wednesday' || day === 'friday' ? 'Full body strength' : 'Move with purpose', body: 'Balanced training to build strength and confidence.', action: 'Start workout' };
};

const MissionMark = () => <svg viewBox="0 0 160 110" aria-hidden="true"><g fill="none" stroke="currentColor" strokeLinecap="round"><path d="M15 55h130" strokeWidth="9" /><path d="M36 29v52M50 35v40M110 35v40M124 29v52" strokeWidth="10" /><path d="M77 35v40M84 35v40" strokeWidth="7" /></g></svg>;

export const Dashboard = () => {
  const today = getToday();
  const [day, setDay] = useState<Day>(today);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, warning, migratedLegacy, startSession, updateSettings } = useFitness();
  const week = data.settings.selectedWeek;
  const navigate = useNavigate();
  const dayRailRef = useRef<HTMLDivElement>(null);
  const workouts = getWorkouts(day, week);
  const completedToday = data.sessions.some((session) => session.day === day && session.week === week);
  const completedDays = new Set(data.sessions.filter((session) => session.week === week).map((session) => session.day));
  const groups = ['Warm-up', 'Strength', 'Core', 'Finish', 'Cardio'] as const;
  const mission = missionCopy(day, workouts);

  const begin = () => { startSession(day, week); navigate('/workout'); };
  const selectDay = (nextDay: Day, target: HTMLButtonElement) => {
    setDay(nextDay);
    setExpanded(null);
    const rail = dayRailRef.current;
    if (rail) {
      const left = Math.max(0, target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2);
      if (typeof rail.scrollTo === 'function') rail.scrollTo({ left, behavior: 'smooth' });
      else rail.scrollLeft = left;
    }
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div><p className="date-line">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p><h1>Today</h1><p className="dashboard-subtitle">Let’s get stronger, one lift at a time.</p></div>
        <label className="week-picker"><span>Program week</span><select value={week} onChange={(event) => updateSettings({ selectedWeek: Number(event.target.value) as Week })}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>Week {value}</option>)}</select></label>
      </header>
      {warning ? <div className="notice notice-warning" role="alert">{warning}</div> : null}
      {migratedLegacy ? <div className="notice">Previous completion markers were preserved under Settings.</div> : null}
      {data.activeDraft ? <button className="resume-banner" onClick={() => navigate('/workout')}><span><strong>Workout in progress</strong><small>{dayLabels[data.activeDraft.day]} · Week {data.activeDraft.week}</small></span><span>Resume →</span></button> : null}

      <section className="day-picker-section" aria-labelledby="days-heading">
        <div className="section-heading day-picker-heading"><div><h2 id="days-heading">This week</h2><p>{completedDays.size} of 7 days logged</p></div><span className="progress-copy">{completedDays.size}/7</span></div>
        <div ref={dayRailRef} className="day-rail" role="tablist" aria-label="Workout day">
          {DAYS.map((item) => <button key={item} role="tab" aria-selected={item === day} className={item === day ? 'active' : ''} onClick={(event) => selectDay(item, event.currentTarget)}><span>{dayLabels[item]}</span><small>{item === today ? 'Today' : completedDays.has(item) ? 'Logged' : getWorkouts(item, week).length ? `${getWorkouts(item, week).length} exercises` : 'Rest'}</small></button>)}
        </div>
      </section>

      <section className="routine-section" aria-labelledby="routine-heading">
        <div className="mission-card">
          <div className="mission-copy"><span className="mission-eyebrow">{mission.eyebrow}</span><h2 id="routine-heading">{mission.title}</h2><p>{mission.body}</p></div>
          <div className="mission-mark"><MissionMark /></div>
          <div className="mission-meta"><span>◷ {estimatedLength(workouts).replace('About ', '') || 'Easy day'}</span><span>▥ {workouts.length || 'Optional'} activities</span><span>◉ Week {week}</span></div>
          {workouts.length ? <button aria-label="Start workout" className="mission-action" onClick={begin} disabled={!!data.activeDraft}>{completedToday ? 'Log another workout' : mission.action}<span aria-hidden="true">→</span></button> : null}
        </div>
        {workouts.length ? <>
          <div className="highlight-heading"><h2>Workout highlights</h2><span>{workouts.length} activities</span></div>
          <div className="routine-groups">{groups.map((group) => {
            const items = workouts.filter((workout) => groupWorkout(workout) === group);
            if (!items.length) return null;
            return <section className="routine-group" key={group} aria-label={`${group} exercises`}><div className="routine-group-title"><h3>{group}</h3><span>{items.length}</span></div><ol className="exercise-list">{items.map((workout) => {
              const isExpanded = expanded === workout.id;
              return <li key={workout.id} className={isExpanded ? 'expanded' : ''}><span className="exercise-number">{workouts.indexOf(workout) + 1}</span><img className="exercise-preview" src={getExercisePreview(workout.name, week)} alt={getExercisePreviewAlt(workout.name)} width="56" height="56" loading="lazy" /><button className="exercise-copy" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : workout.id)}><strong>{workout.name}</strong><small>{workout.sets} sets · {workout.reps}</small>{workout.startingWeight ? <span className="target-chip">Start {workout.startingWeight}</span> : null}{isExpanded ? <span className="exercise-detail">{workout.restSeconds ? `Rest ${workout.restSeconds} sec. ` : ''}{workout.guidance ?? 'Use a controlled pace and adjust as needed.'}</span> : <span className="exercise-detail-toggle">Details</span>}</button></li>;
            })}</ol></section>;
          })}</div>
        </> : <div className="empty-state"><span aria-hidden="true">○</span><h3>Recovery day</h3><p>Take an easy 20-minute walk, hydrate, and give your training time to settle in.</p></div>}
      </section>
    </div>
  );
};
