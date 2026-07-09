import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildExerciseTrend, fromMiles, fromPounds } from '../lib/metrics';
import { getExercisePreview, getExercisePreviewAlt } from '../lib/exercisePreviews';
import { useFitness } from '../context/FitnessContext';
import type { DistanceUnit, WeightUnit, WorkoutSession } from '../types';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

type TrendMetric = 'weight' | 'volume' | 'duration' | 'distance';

const metricLabels: Record<TrendMetric, string> = {
  weight: 'Best weight',
  volume: 'Volume',
  duration: 'Duration',
  distance: 'Distance',
};

const getTrendMetrics = (points: ReturnType<typeof buildExerciseTrend>): TrendMetric[] => {
  const metrics: TrendMetric[] = [];
  if (points.some((point) => point.bestWeightLb !== undefined)) metrics.push('weight');
  if (points.some((point) => point.volumeLb !== undefined)) metrics.push('volume');
  if (points.some((point) => point.durationMinutes !== undefined)) metrics.push('duration');
  if (points.some((point) => point.distanceMiles !== undefined)) metrics.push('distance');
  return metrics;
};

const TrendChart = ({
  points,
  metric,
  weightUnit,
  distanceUnit,
}: {
  points: ReturnType<typeof buildExerciseTrend>;
  metric: TrendMetric;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
}) => {
  const chartPoints = points.flatMap((point) => {
    const rawValue = metric === 'weight'
      ? point.bestWeightLb
      : metric === 'volume'
        ? point.volumeLb
        : metric === 'duration'
          ? point.durationMinutes
          : point.distanceMiles;
    if (rawValue === undefined) return [];
    const value = metric === 'weight' || metric === 'volume'
      ? fromPounds(rawValue, weightUnit)
      : metric === 'distance'
        ? fromMiles(rawValue, distanceUnit)
        : rawValue;
    return [{ ...point, value }];
  });
  const values = chartPoints.map((point) => point.value);
  if (chartPoints.length < 2) return <div className="chart-empty">Complete this exercise twice to see a trend.</div>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const coordinates = values.map((value, index) => ({
    x: 8 + (index / (values.length - 1)) * 84,
    y: 84 - ((value - min) / range) * 66,
  }));
  const unitLabel = metric === 'weight'
    ? weightUnit
    : metric === 'volume'
      ? `${weightUnit}·reps`
      : metric === 'duration'
        ? 'min'
        : distanceUnit;

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 100 100" role="img" aria-label="Exercise progress over time" preserveAspectRatio="none">
        <line x1="8" y1="84" x2="94" y2="84" className="chart-axis" />
        <line x1="8" y1="18" x2="8" y2="84" className="chart-axis" />
        <polyline points={coordinates.map((point) => `${point.x},${point.y}`).join(' ')} className="chart-line" />
        {coordinates.map((point, index) => <circle key={chartPoints[index].date} cx={point.x} cy={point.y} r="1.7" className="chart-point" />)}
      </svg>
      <div className="chart-labels">
        <span>{formatDate(chartPoints[0].date)}</span>
        <strong>{values[values.length - 1].toFixed(1)} {unitLabel}</strong>
        <span>{formatDate(chartPoints[chartPoints.length - 1].date)}</span>
      </div>
    </div>
  );
};

const SessionDetail = ({ session }: { session: WorkoutSession }) => (
  <div className="session-detail">
    {session.exercises.map((exercise) => (
      <div className="session-exercise" key={exercise.exerciseId}>
        <img
          className="session-exercise-preview"
          src={getExercisePreview(exercise.name, session.week)}
          alt={getExercisePreviewAlt(exercise.name)}
          width="44"
          height="44"
          loading="lazy"
        />
        <span className="session-exercise-copy"><strong>{exercise.name}</strong></span>
        <span>
          {exercise.status === 'skipped'
            ? 'Skipped'
            : exercise.cardio
            ? `${exercise.cardio.durationMinutes || '—'} min${exercise.cardio.distance ? ` · ${exercise.cardio.distance} ${exercise.cardio.distanceUnit}` : ''}`
            : `${exercise.sets.filter((set) => set.completed).length}/${exercise.sets.length} sets`}
        </span>
      </div>
    ))}
  </div>
);

export const History = () => {
  const { data } = useFitness();
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState<'sessions' | 'progress'>('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState(data.sessions[0]?.id ?? '');
  const selectedSession = data.sessions.find((session) => session.id === selectedSessionId) ?? data.sessions[0];
  const exerciseOptions = useMemo(() => {
    const seen = new Map<string, string>();
    data.sessions.forEach((session) => session.exercises.forEach((exercise) => {
      if (buildExerciseTrend(data.sessions, exercise.name).length) seen.set(exercise.name, exercise.name);
    }));
    return [...seen.entries()];
  }, [data.sessions]);
  const [exerciseId, setExerciseId] = useState(exerciseOptions[0]?.[0] ?? '');
  const [metric, setMetric] = useState<TrendMetric>('weight');
  const trend = buildExerciseTrend(data.sessions, exerciseId);
  const metricOptions = getTrendMetrics(trend);
  const selectedMetric = metricOptions.includes(metric) ? metric : metricOptions[0];

  return (
    <div className="page history-page">
      <header className="page-header">
        <div><p className="date-line">Your training record</p><h1>History &amp; trends</h1></div>
      </header>
      {data.sessions.length ? (
        <>
          <div className="history-tabs" role="group" aria-label="History view">
            <button aria-pressed={mobileView === 'sessions'} onClick={() => setMobileView('sessions')}>Sessions</button>
            <button aria-pressed={mobileView === 'progress'} onClick={() => setMobileView('progress')}>Progress</button>
          </div>
          <div className="history-layout">
          <section className={`sessions-panel ${mobileView !== 'sessions' ? 'mobile-hidden' : ''}`} aria-labelledby="sessions-heading">
            <div className="section-heading"><div><h2 id="sessions-heading">Recent sessions</h2><p>{data.sessions.length} completed workouts</p></div></div>
            <div className="session-list">
              {data.sessions.map((session) => (
                <button key={session.id} className={session.id === selectedSession?.id ? 'active' : ''} onClick={() => setSelectedSessionId(session.id)}>
                  <span><strong>{formatDate(session.completedAt ?? session.startedAt)}</strong><small>Week {session.week} · {session.day}</small></span>
                  <span>{session.exercises.length} exercises</span>
                </button>
              ))}
            </div>
            {selectedSession ? <SessionDetail session={selectedSession} /> : null}
          </section>
          <section className={`trend-panel ${mobileView !== 'progress' ? 'mobile-hidden' : ''}`} aria-labelledby="trend-heading">
            <div className="section-heading">
              <div><h2 id="trend-heading">Exercise progress</h2><p>Completed sessions only</p></div>
              <div className="trend-controls">
                <select aria-label="Exercise trend" value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
                  {exerciseOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
                {metricOptions.length ? (
                  <select aria-label="Trend metric" value={selectedMetric} onChange={(event) => setMetric(event.target.value as TrendMetric)}>
                    {metricOptions.map((option) => <option key={option} value={option}>{metricLabels[option]}</option>)}
                  </select>
                ) : null}
              </div>
            </div>
            {exerciseOptions.length
              ? (
                <TrendChart
                  points={trend}
                  metric={selectedMetric}
                  weightUnit={data.settings.defaultWeightUnit}
                  distanceUnit={data.settings.defaultDistanceUnit}
                />
              )
              : <div className="chart-empty">Log at least one completed set or cardio result to see progress.</div>}
          </section>
          </div>
        </>
      ) : (
        <div className="empty-state history-empty">
          <span aria-hidden="true">↗</span>
          <h2>Your history starts with one workout</h2>
          <p>Finished sessions will appear here with exercise details and progress trends.</p>
          <button className="button button-primary" onClick={() => navigate('/')}>Start today’s workout</button>
        </div>
      )}
    </div>
  );
};
