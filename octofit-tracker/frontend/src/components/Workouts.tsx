import { useApiData } from '../api/useApiData.js';

type Workout = { _id?: string; title: string; focus: string; minutes: number; difficulty: string; reason?: string };

export default function Workouts() {
  const { data, error, loading } = useApiData<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
  const suggestions = data?.suggestions ?? [];

  return <section><h2>Workout suggestions</h2>
    {loading && <p role="status">Loading workout suggestions...</p>}
    {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
    {!loading && !error && suggestions.length === 0 && <p>No workout suggestions yet.</p>}
    {!loading && !error && suggestions.length > 0 && <ul className="list-group">{suggestions.map((workout, index) => <li className="list-group-item" key={workout._id ?? workout.title ?? index}>
      <h3 className="h5">{workout.title}</h3><p>{workout.focus} · {workout.minutes} minutes · {workout.difficulty}</p>
      {workout.reason && <p className="mb-0">{workout.reason}</p>}
    </li>)}</ul>}
  </section>;
}
