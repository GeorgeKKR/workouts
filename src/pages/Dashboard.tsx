import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getToday, getWorkouts } from '../components/workouts/workoutData';
import { useFitness } from '../context/FitnessContext';
import { getExercisePreview } from '../lib/exercisePreviews';
import { DAYS, type Day, type Week, type Workout } from '../types';

const dayLabels: Record<Day, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const fullDayLabels: Record<Day, string> = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };
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
  const { data, warning, migratedLegacy, startSession, updateSettings } = useFitness();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDay = searchParams.get('day');
  const day = DAYS.includes(requestedDay as Day) ? requestedDay as Day : today;
  const requestedWeek = Number(searchParams.get('week'));
  const week = ([1, 2, 3, 4] as const).includes(requestedWeek as Week)
    ? requestedWeek as Week
    : data.settings.selectedWeek;
  const navigate = useNavigate();
  const dayRailRef = useRef<HTMLDivElement>(null);
  const workouts = getWorkouts(day, week);
  const completedToday = data.sessions.some((session) => session.day === day && session.week === week);
  const completedDays = new Set(data.sessions.filter((session) => session.week === week).map((session) => session.day));
  const scheduledDays = DAYS.filter((item) => getWorkouts(item, week).length > 0);
  const completedScheduledDays = scheduledDays.filter((item) => completedDays.has(item)).length;
  const groups = ['Warm-up', 'Strength', 'Core', 'Finish', 'Cardio'] as const;
  const mission = missionCopy(day, workouts);

  useEffect(() => {
    if (week !== data.settings.selectedWeek) updateSettings({ selectedWeek: week });
  }, [data.settings.selectedWeek, updateSettings, week]);

  const begin = () => { startSession(day, week); navigate('/workout'); };
  const selectDay = (nextDay: Day, target: HTMLButtonElement) => {
    setSearchParams({ day: nextDay, week: String(week) }, { replace: true });
    const rail = dayRailRef.current;
    if (rail) {
      const left = Math.max(0, target.offsetLeft - (rail.clientWidth - target.offsetWidth) / 2);
      if (typeof rail.scrollTo === 'function') {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        rail.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      else rail.scrollLeft = left;
    }
  };
  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % DAYS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + DAYS.length) % DAYS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = DAYS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const target = dayRailRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex];
    if (target) {
      selectDay(DAYS[nextIndex], target);
      target.focus();
    }
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div key={`${day}-${week}`}><p className="date-line">{day === today ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()) : `Week ${week} plan`}</p><h1>{day === today ? 'Today' : fullDayLabels[day]}</h1><p className="dashboard-subtitle">{day === today ? 'Let’s get stronger, one lift at a time.' : 'A clear look at the work ahead.'}</p></div>
        <label className="week-picker"><span>Program week</span><select aria-label="Program week" value={week} onChange={(event) => { const nextWeek = Number(event.target.value) as Week; updateSettings({ selectedWeek: nextWeek }); setSearchParams({ day, week: String(nextWeek) }, { replace: true }); }}>{[1, 2, 3, 4].map((value) => <option key={value} value={value}>Week {value}</option>)}</select></label>
      </header>
      {warning ? <div className="notice notice-warning" role="alert">{warning}</div> : null}
      {migratedLegacy ? <div className="notice">Previous completion markers were preserved under Settings.</div> : null}
      {data.activeDraft ? <button className="resume-banner" onClick={() => navigate('/workout')}><span><strong>Workout in progress</strong><small>{dayLabels[data.activeDraft.day]} · Week {data.activeDraft.week}</small></span><span>Resume →</span></button> : null}

      <section className="day-picker-section" aria-labelledby="days-heading">
        <div className="section-heading day-picker-heading"><div><h2 id="days-heading">This week</h2><p>{completedScheduledDays} of {scheduledDays.length} training days logged</p></div><span className="progress-copy">{completedScheduledDays}/{scheduledDays.length}</span></div>
        <div ref={dayRailRef} className="day-rail" role="tablist" aria-label="Workout day">
          {DAYS.map((item) => {
            const exerciseCount = getWorkouts(item, week).length;
            const status = item === today ? 'Today' : completedDays.has(item) ? 'Done' : exerciseCount ? String(exerciseCount) : 'Rest';
            const accessibleStatus = item === today
              ? 'today'
              : completedDays.has(item)
                ? 'logged'
                : exerciseCount
                  ? `${exerciseCount} exercises`
                  : 'recovery day';
            return <button key={item} id={`day-${item}-tab`} role="tab" tabIndex={item === day ? 0 : -1} aria-controls="routine-panel" aria-label={`${dayLabels[item]}, ${accessibleStatus}`} aria-selected={item === day} className={item === day ? 'active' : ''} onKeyDown={(event) => handleDayKeyDown(event, DAYS.indexOf(item))} onClick={(event) => selectDay(item, event.currentTarget)}><span>{dayLabels[item]}</span><small>{status}</small></button>;
          })}
        </div>
      </section>

      <section id="routine-panel" role="tabpanel" className="routine-section" aria-labelledby={`day-${day}-tab`}>
        <div className="mission-card" key={`${day}-${week}-mission`}>
          <div className="mission-copy"><span className="mission-eyebrow">{mission.eyebrow}</span><h2 id="routine-heading">{mission.title}</h2><p>{mission.body}</p></div>
          <div className="mission-mark"><MissionMark /></div>
          <div className="mission-meta"><span>{estimatedLength(workouts).replace('About ', '') || 'Easy day'}</span><span>{workouts.length || 'Optional'} activities</span><span>Week {week}</span></div>
          {workouts.length ? <button aria-label="Start workout" className="mission-action" onClick={begin} disabled={!!data.activeDraft}>{completedToday ? 'Log another workout' : mission.action}</button> : null}
        </div>
        {workouts.length ? <>
          <div className="highlight-heading"><h2>Workout highlights</h2><span>{workouts.length} activities</span></div>
          <div className="routine-groups">{groups.map((group) => {
            const items = workouts.filter((workout) => groupWorkout(workout) === group);
            if (!items.length) return null;
            return <section className="routine-group" key={`${day}-${week}-${group}`} aria-label={`${group} exercises`}><div className="routine-group-title"><h3>{group}</h3><span>{items.length}</span></div><ol className="exercise-list">{items.map((workout) => (
              <li key={workout.id}>
                <span className="exercise-number">{workouts.indexOf(workout) + 1}</span>
                <img className="exercise-preview" src={getExercisePreview(workout.name, week)} alt="" width="56" height="56" loading="lazy" />
                <Link className="exercise-link" to={`/exercise/${day}/${week}/${encodeURIComponent(workout.id)}`} aria-label={`View ${workout.name} details`}>
                  <span className="exercise-copy"><strong>{workout.name}</strong><small>{workout.sets} sets · {workout.reps}</small>{workout.startingWeight ? <span className="target-chip">Start {workout.startingWeight}</span> : null}</span>
                  <span className="exercise-row-action" aria-hidden="true">View</span>
                </Link>
              </li>
            ))}</ol></section>;
          })}</div>
        </> : <div className="empty-state"><h3>Take it easy</h3><p>Take an easy 20-minute walk, hydrate, and give your training time to settle in.</p></div>}
      </section>
    </div>
  );
};
