import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useFitness } from '../context/FitnessContext';
import { getExercisePreview, getExercisePreviewAlt } from '../lib/exercisePreviews';
import type { ExerciseLog } from '../types';

const updateExercise = (exercises: ExerciseLog[], index: number, updater: (exercise: ExerciseLog) => ExerciseLog) =>
  exercises.map((exercise, exerciseIndex) => exerciseIndex === index ? updater(exercise) : exercise);

const hasLoggedWork = (exercise: ExerciseLog) =>
  exercise.cardio
    ? Number(exercise.cardio.durationMinutes) > 0
    : exercise.sets.some((set) => set.completed);

export const ActiveWorkout = () => {
  const { data, updateDraft, finishSession, abandonDraft } = useFitness();
  const navigate = useNavigate();
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showCardioDetails, setShowCardioDetails] = useState(false);
  const draft = data.activeDraft;

  useEffect(() => { setShowCardioDetails(false); }, [draft?.activeExerciseIndex]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setRestSeconds((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    if (finishing && !data.activeDraft) navigate('/history', { replace: true });
  }, [data.activeDraft, finishing, navigate]);

  if (!draft) {
    if (finishing) return <div className="page workout-page workout-saving" role="status">Saving workout…</div>;
    return <Navigate to="/" replace />;
  }
  const exercise = draft.exercises[draft.activeExerciseIndex];
  const completedCount = draft.exercises.filter((item) => item.status === 'logged').length;
  const skippedCount = draft.exercises.filter((item) => item.status === 'skipped').length;
  const progress = ((draft.activeExerciseIndex + 1) / draft.exercises.length) * 100;
  const previous = data.sessions
    .flatMap((session) => session.exercises)
    .find((item) => item.name === exercise.name);

  const changeExercise = (updater: (current: ExerciseLog) => ExerciseLog) => {
    updateDraft((current) => ({
      ...current,
      exercises: updateExercise(current.exercises, current.activeExerciseIndex, updater),
    }));
  };

  const moveTo = (nextIndex: number) => {
    updateDraft((current) => ({
      ...current,
      exercises: updateExercise(current.exercises, current.activeExerciseIndex, (item) => ({
        ...item,
        completed: hasLoggedWork(item),
        status: hasLoggedWork(item) ? 'logged' : item.status,
      })),
      activeExerciseIndex: nextIndex,
    }));
    setTimerRunning(false);
    setRestSeconds(draft.exercises[nextIndex].restSeconds ?? 90);
  };

  const finish = () => {
    changeExercise((current) => ({ ...current, completed: hasLoggedWork(current), status: hasLoggedWork(current) ? 'logged' : current.status }));
    setFinishing(true);
    finishSession();
  };

  const abandon = () => {
    if (window.confirm('Abandon this workout? The saved draft will be deleted.')) {
      abandonDraft();
      navigate('/');
    }
  };

  const toggleTimer = () => {
    if (restSeconds === 0) setRestSeconds(exercise.restSeconds ?? 90);
    setTimerRunning((running) => !running);
  };

  const toggleSetCompletion = (setId: string) => {
    const willComplete = !exercise.sets.find((item) => item.id === setId)?.completed;
    changeExercise((current) => ({ ...current, status: willComplete ? 'logged' : current.status, sets: current.sets.map((item) => item.id === setId ? { ...item, completed: !item.completed } : item) }));
    if (willComplete) { setRestSeconds(exercise.restSeconds ?? 90); setTimerRunning(true); }
  };

  const skip = () => {
    if (draft.activeExerciseIndex >= draft.exercises.length - 1) return;
    updateDraft((current) => ({ ...current, exercises: updateExercise(current.exercises, current.activeExerciseIndex, (item) => ({ ...item, completed: false, status: 'skipped' })), activeExerciseIndex: current.activeExerciseIndex + 1 }));
    setTimerRunning(false);
    setRestSeconds(draft.exercises[draft.activeExerciseIndex + 1].restSeconds ?? 90);
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="page workout-page">
      <header className="workout-header">
        <div className="session-toolbar">
          <button className="icon-text-button" onClick={() => navigate('/')} aria-label="Back to dashboard">←</button>
          <strong>{draft.activeExerciseIndex + 1} of {draft.exercises.length}</strong>
          <div className="session-toolbar-actions">{draft.activeExerciseIndex < draft.exercises.length - 1 ? <button className="text-button" onClick={skip}>Skip</button> : null}<button className="text-button danger" onClick={abandon}>Abandon</button></div>
        </div>
        <div className="session-progress" aria-label={`Exercise ${draft.activeExerciseIndex + 1} of ${draft.exercises.length}`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="exercise-heading">
          <div className="exercise-heading-main">
            <img
              className="active-exercise-preview"
              src={getExercisePreview(exercise.name, draft.week)}
              alt={getExercisePreviewAlt(exercise.name)}
              width="88"
              height="88"
            />
            <div>
              <h1>{exercise.name}</h1>
              <p className="target-copy">{exercise.target}</p>
              {exercise.startingWeight ? <p className="target-copy">Starting target: {exercise.startingWeight}</p> : null}
              {exercise.restSeconds ? <p className="target-copy">Rest: {exercise.restSeconds} sec</p> : null}
            </div>
          </div>
          <span className="completion-count">{completedCount} logged{skippedCount ? ` · ${skippedCount} skipped` : ''}</span>
        </div>
      </header>

      {previous ? (
        <div className="previous-result">
          <span>Previous</span>
          <strong>
            {previous.cardio
              ? `${previous.cardio.durationMinutes || '—'} min`
              : previous.sets.filter((set) => set.completed).map((set) => set.weight ? `${set.weight} ${set.unit} × ${set.reps || '—'}` : set.durationSeconds ? `${set.durationSeconds} sec` : `${set.reps || '—'} reps`).join(', ') || 'No sets logged'}
          </strong>
        </div>
      ) : null}

      <section className="logging-panel" aria-labelledby="logging-heading">
        <div className="logging-title">
          <h2 id="logging-heading">Sets</h2>
          {exercise.videoUrl ? <a className="video-link" href={exercise.videoUrl.replace('/embed/', '/watch?v=')} target="_blank" rel="noreferrer">Watch demo ↗</a> : null}
        </div>
        {exercise.input === 'cardio' && exercise.cardio ? (
          <div className="form-grid cardio-grid">
            <label>Minutes<input inputMode="decimal" value={exercise.cardio.durationMinutes} onChange={(event) => changeExercise((current) => ({ ...current, status: event.target.value ? 'logged' : current.status, cardio: { ...current.cardio!, durationMinutes: event.target.value } }))} /></label>
            <button className="cardio-details-toggle" aria-expanded={showCardioDetails} onClick={() => setShowCardioDetails((value) => !value)}>Add distance or machine details</button>
            {showCardioDetails ? <div className="cardio-optional-fields"><label>Distance<input inputMode="decimal" value={exercise.cardio.distance} onChange={(event) => changeExercise((current) => ({ ...current, cardio: { ...current.cardio!, distance: event.target.value } }))} /></label><label>Distance unit<select value={exercise.cardio.distanceUnit} onChange={(event) => changeExercise((current) => ({ ...current, cardio: { ...current.cardio!, distanceUnit: event.target.value as 'mi' | 'km' } }))}><option value="mi">miles</option><option value="km">kilometers</option></select></label><label>Machine<input value={exercise.cardio.machine} onChange={(event) => changeExercise((current) => ({ ...current, cardio: { ...current.cardio!, machine: event.target.value } }))} placeholder="Treadmill, bike…" /></label></div> : null}
          </div>
        ) : (
          <div className="set-table">
            <div className="set-row set-row-head">
              <span>Set</span><span>{exercise.input === 'strength' ? 'Weight' : exercise.input === 'duration' ? 'Seconds' : 'Reps'}</span><span>{exercise.input === 'strength' ? 'Reps' : 'Status'}</span><span>Done</span>
            </div>
            {exercise.sets.map((set, setIndex) => (
              <div className={`set-row ${set.completed ? 'completed' : ''}`} key={set.id}>
                <strong className="set-number">Set {setIndex + 1}</strong>
                <div className="set-field">
                  <span>{exercise.input === 'strength' ? 'Weight' : exercise.input === 'duration' ? 'Seconds' : 'Reps'}</span>
                  {exercise.input === 'strength' ? (
                    <div className="joined-input"><input aria-label={`Set ${setIndex + 1} weight`} inputMode="decimal" value={set.weight} onChange={(event) => changeExercise((current) => ({ ...current, sets: current.sets.map((item) => item.id === set.id ? { ...item, weight: event.target.value } : item) }))} /><select aria-label={`Set ${setIndex + 1} weight unit`} value={set.unit} onChange={(event) => changeExercise((current) => ({ ...current, sets: current.sets.map((item) => item.id === set.id ? { ...item, unit: event.target.value as 'lb' | 'kg' } : item) }))}><option>lb</option><option>kg</option></select></div>
                  ) : exercise.input === 'duration' ? (
                    <input aria-label={`Set ${setIndex + 1} seconds`} inputMode="numeric" value={set.durationSeconds} onChange={(event) => changeExercise((current) => ({ ...current, sets: current.sets.map((item) => item.id === set.id ? { ...item, durationSeconds: event.target.value } : item) }))} />
                  ) : (
                    <input aria-label={`Set ${setIndex + 1} reps`} inputMode="numeric" value={set.reps} onChange={(event) => changeExercise((current) => ({ ...current, sets: current.sets.map((item) => item.id === set.id ? { ...item, reps: event.target.value } : item) }))} />
                  )}
                </div>
                <div className="set-field">
                  <span>{exercise.input === 'strength' ? 'Reps' : 'Status'}</span>
                  {exercise.input === 'strength'
                    ? <input aria-label={`Set ${setIndex + 1} reps`} inputMode="numeric" value={set.reps} onChange={(event) => changeExercise((current) => ({ ...current, sets: current.sets.map((item) => item.id === set.id ? { ...item, reps: event.target.value } : item) }))} />
                    : <span className="set-status">{set.completed ? 'Completed' : 'Pending'}</span>}
                </div>
                <button aria-label={`${set.completed ? 'Mark incomplete' : 'Complete'} set ${setIndex + 1}`} className="check-button" onClick={() => toggleSetCompletion(set.id)}>{set.completed ? '✓' : '○'}</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="workout-actions">
        <button className="button button-secondary previous-button" disabled={draft.activeExerciseIndex === 0} onClick={() => moveTo(draft.activeExerciseIndex - 1)}>← <span>Previous</span></button>
        <div className="rest-control">
          <button className={`button timer-button ${timerRunning ? 'active' : ''}`} onClick={toggleTimer}>
            <small>{timerRunning ? 'Pause rest' : restSeconds === 0 ? 'Restart rest' : 'Rest timer'}</small>
            <strong>{formatTime(restSeconds)}</strong>
          </button>
          <div>
            <button onClick={() => setRestSeconds((seconds) => seconds + 30)}>+30</button>
            <button onClick={() => { setTimerRunning(false); setRestSeconds(exercise.restSeconds ?? 90); }}>Reset</button>
          </div>
        </div>
        {draft.activeExerciseIndex < draft.exercises.length - 1 ? (
          <button aria-label="Next exercise" className="button button-primary next-button" onClick={() => moveTo(draft.activeExerciseIndex + 1)}>Next <span>{draft.exercises[draft.activeExerciseIndex + 1].name} →</span></button>
        ) : (
          <button className="button button-primary next-button" onClick={finish}>Finish <span>workout ✓</span></button>
        )}
      </footer>
    </div>
  );
};
