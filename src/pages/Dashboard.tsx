import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToday, getWorkouts } from '../components/workouts/workoutData';
import { useFitness } from '../context/FitnessContext';
import { getExercisePreview, getExercisePreviewAlt } from '../lib/exercisePreviews';
import { DAYS, type Day, type Week } from '../types';

const dayLabels: Record<Day, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const Dashboard = () => {
  const today = getToday();
  const [day, setDay] = useState<Day>(today);
  const { data, warning, migratedLegacy, startSession, updateSettings } = useFitness();
  const week = data.settings.selectedWeek;
  const navigate = useNavigate();
  const selectedDayRef = useRef<HTMLButtonElement>(null);
  const workouts = getWorkouts(day, week);
  const completedToday = data.sessions.some((session) => session.day === day && session.week === week);
  const completedDays = new Set(data.sessions.filter((session) => session.week === week).map((session) => session.day));

  useEffect(() => {
    selectedDayRef.current?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [day]);

  const begin = () => {
    startSession(day, week);
    navigate('/workout');
  };

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="date-line">{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
          <h1>Today’s workout</h1>
        </div>
        <label className="week-picker">
          <span>Program week</span>
          <select value={week} onChange={(event) => updateSettings({ selectedWeek: Number(event.target.value) as Week })}>
            {[1, 2, 3, 4].map((value) => <option key={value} value={value}>Week {value}</option>)}
          </select>
        </label>
      </header>

      {warning ? <div className="notice notice-warning" role="alert">{warning}</div> : null}
      {migratedLegacy ? <div className="notice">Previous completion markers were preserved under Settings.</div> : null}
      {data.activeDraft ? (
        <button className="resume-banner" onClick={() => navigate('/workout')}>
          <span><strong>Workout in progress</strong><small>{dayLabels[data.activeDraft.day]} · Week {data.activeDraft.week}</small></span>
          <span>Resume →</span>
        </button>
      ) : null}

      <section aria-labelledby="days-heading">
        <div className="section-heading">
          <div>
            <h2 id="days-heading">Choose a day</h2>
            <p>{completedDays.size} of 7 days logged for this program week</p>
          </div>
          <span className="progress-copy">{completedDays.size}/7</span>
        </div>
        <div className="progress-track" aria-label={`${completedDays.size} of 7 days logged`}>
          <span style={{ width: `${(completedDays.size / 7) * 100}%` }} />
        </div>
        <div className="day-rail" role="tablist" aria-label="Workout day">
          {DAYS.map((item) => (
            <button
              key={item}
              ref={item === day ? selectedDayRef : undefined}
              role="tab"
              aria-selected={item === day}
              className={item === day ? 'active' : ''}
              onClick={() => setDay(item)}
            >
              <span>{dayLabels[item]}</span>
              <small>{item === today ? 'Today' : completedDays.has(item) ? 'Logged' : getWorkouts(item, week).length ? `${getWorkouts(item, week).length} exercises` : 'Rest'}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="routine-section" aria-labelledby="routine-heading">
        <div className="section-heading">
          <div>
            <h2 id="routine-heading">{dayLabels[day]} routine</h2>
            <p>{workouts.length ? `${workouts.length} exercises · Week ${week}` : 'Recovery day'}</p>
          </div>
          {completedToday ? <span className="status-success">Logged</span> : null}
        </div>
        {workouts.length ? (
          <>
            <ol className="exercise-list">
              {workouts.map((workout, index) => (
                <li key={workout.id}>
                  <span className="exercise-number">{index + 1}</span>
                  <img
                    className="exercise-preview"
                    src={getExercisePreview(workout.name, week)}
                    alt={getExercisePreviewAlt(workout.name)}
                    width="56"
                    height="56"
                    loading="lazy"
                  />
                  <span className="exercise-copy">
                    <strong>{workout.name}</strong>
                    <small>{workout.sets} sets · {workout.reps}{workout.guidance ? ` · ${workout.guidance}` : ''}</small>
                  </span>
                  <span className="exercise-type">{workout.type}</span>
                </li>
              ))}
            </ol>
            <button className="button button-primary button-wide" onClick={begin} disabled={!!data.activeDraft}>
              {completedToday ? 'Log another workout' : 'Start workout'} <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">○</span>
            <h3>Recovery day</h3>
            <p>Hydrate, eat well, and give your training time to settle in.</p>
          </div>
        )}
      </section>
    </div>
  );
};
