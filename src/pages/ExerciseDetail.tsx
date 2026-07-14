import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getWorkout } from '../components/workouts/workoutData';
import { useFitness } from '../context/FitnessContext';
import { getExercisePreview, getExercisePreviewAlt } from '../lib/exercisePreviews';
import { DAYS, type Day, type ExerciseLog, type Week } from '../types';

const dayNames: Record<Day, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const isDay = (value: string | undefined): value is Day => DAYS.includes(value as Day);
const isWeek = (value: number): value is Week => ([1, 2, 3, 4] as const).includes(value as Week);
const toWatchUrl = (url: string) => url.replace('/embed/', '/watch?v=');
const toPrivacyEmbedUrl = (url: string) => url.replace('www.youtube.com', 'www.youtube-nocookie.com');

const formatPreviousResult = (exercise: ExerciseLog) => {
  if (exercise.cardio) {
    return `${exercise.cardio.durationMinutes || '—'} min${exercise.cardio.distance ? ` · ${exercise.cardio.distance} ${exercise.cardio.distanceUnit}` : ''}`;
  }
  return exercise.sets
    .filter((set) => set.completed)
    .map((set) => set.weight
      ? `${set.weight} ${set.unit} × ${set.reps || '—'}`
      : set.durationSeconds
        ? `${set.durationSeconds} sec`
        : `${set.reps || '—'} reps`)
    .join(', ') || 'No completed sets yet';
};

export const ExerciseDetail = () => {
  const { day: dayParam, week: weekParam, exerciseId } = useParams();
  const navigate = useNavigate();
  const { data, startSession } = useFitness();
  const [showVideo, setShowVideo] = useState(false);
  const parsedWeek = Number(weekParam);
  const day = isDay(dayParam) ? dayParam : null;
  const week = isWeek(parsedWeek) ? parsedWeek : null;
  const exercise = day && week && exerciseId ? getWorkout(day, week, exerciseId) : undefined;

  if (!day || !week || !exercise) {
    return (
      <div className="page exercise-detail-page">
        <Link className="detail-back-link" to="/">Back to Today</Link>
        <section className="detail-not-found">
          <p className="date-line">Exercise guide</p>
          <h1>That exercise isn’t in this plan</h1>
          <p>The workout may have changed, or this link may be incomplete.</p>
          <Link className="button button-primary" to="/">Return to Today</Link>
        </section>
      </div>
    );
  }

  const previous = [...data.sessions]
    .reverse()
    .flatMap((session) => session.exercises)
    .find((item) => item.name === exercise.name && item.status !== 'skipped');
  const preview = getExercisePreview(exercise.name, week);
  const activeDraft = data.activeDraft;
  const activeDraftMatches = activeDraft?.day === day && activeDraft.week === week;
  const primaryAction = activeDraft
    ? activeDraftMatches
      ? 'Resume this workout'
      : 'Resume current workout'
    : 'Start full workout';

  const handlePrimaryAction = () => {
    if (!activeDraft) startSession(day, week);
    navigate('/workout');
  };

  return (
    <div className="page exercise-detail-page">
      <header className="exercise-detail-header">
        <Link className="detail-back-link" to={`/?day=${day}&week=${week}`}>Back to {dayNames[day]} plan</Link>
        <span>Week {week} · Exercise guide</span>
      </header>

      <main>
        <section className="exercise-detail-hero" aria-labelledby="exercise-detail-title">
          <img src={preview} alt={getExercisePreviewAlt(exercise.name)} width="144" height="144" />
          <div>
            <p className="date-line">{exercise.type === 'cardio' ? 'Cardio' : exercise.type === 'upper' ? 'Upper body' : 'Lower body'}</p>
            <h1 id="exercise-detail-title">{exercise.name}</h1>
            <p>{exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'} · {exercise.reps}</p>
          </div>
        </section>

        <div className="exercise-detail-layout">
          <section className="demo-card" aria-labelledby="demo-heading">
            <div className="detail-section-heading">
              <div><span>Form guide</span><h2 id="demo-heading">Demo video</h2></div>
              {exercise.videoUrl ? <a href={toWatchUrl(exercise.videoUrl)} target="_blank" rel="noreferrer">Open in YouTube</a> : null}
            </div>
            {exercise.videoUrl ? (
              showVideo ? (
                <div className="demo-frame">
                  <iframe
                    src={toPrivacyEmbedUrl(exercise.videoUrl)}
                    title={`${exercise.name} demonstration`}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button className="demo-poster" onClick={() => setShowVideo(true)}>
                  <img src={preview} alt="" />
                  <span><strong>Play demo</strong><small>Loads from YouTube</small></span>
                </button>
              )
            ) : (
              <div className="demo-unavailable">
                <img src={preview} alt="" />
                <div><strong>Demo coming soon</strong><p>Use the form guidance below while this exercise’s video is being added.</p></div>
              </div>
            )}
          </section>

          <aside className="exercise-plan-card" aria-labelledby="plan-heading">
            <div className="detail-section-heading"><div><span>Your plan</span><h2 id="plan-heading">Training targets</h2></div></div>
            <dl className="exercise-targets">
              <div><dt>Work</dt><dd>{exercise.sets} × {exercise.reps}</dd></div>
              <div><dt>Starting target</dt><dd>{exercise.startingWeight ?? 'Comfortable effort'}</dd></div>
              <div><dt>Rest</dt><dd>{exercise.restSeconds ? `${exercise.restSeconds} seconds` : 'As needed'}</dd></div>
            </dl>
            {previous ? <div className="detail-previous"><span>Last time</span><strong>{formatPreviousResult(previous)}</strong></div> : null}
          </aside>
        </div>

        <section className="form-guidance" aria-labelledby="guidance-heading">
          <p className="date-line">Form focus</p>
          <h2 id="guidance-heading">Move with control</h2>
          <p>{exercise.guidance ?? 'Use a controlled pace, stay within a comfortable range of motion, and stop if anything feels painful.'}</p>
        </section>
      </main>

      <footer className="exercise-detail-actions">
        <div><strong>{exercise.name}</strong><span>Browsing this guide won’t change your workout log.</span></div>
        <button className="button button-primary" onClick={handlePrimaryAction}>{primaryAction}</button>
      </footer>
    </div>
  );
};
