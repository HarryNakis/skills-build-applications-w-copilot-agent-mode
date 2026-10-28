import { useApiData } from '../api/useApiData.js';

type Activity = { _id?: string; type: string; minutes: number; points: number; occurredAt?: string };

export default function Activities() {
  const { data, error, loading } = useApiData<{ activities: Activity[] }>('/api/activities');
  const activities = data?.activities ?? [];

  return <section><h2>Activities</h2>
    {loading && <p role="status">Loading activities...</p>}
    {error && <p role="alert">Unable to load activities: {error}</p>}
    {!loading && !error && activities.length === 0 && <p>No activities yet.</p>}
    {!loading && !error && activities.length > 0 && <ul className="list-group">{activities.map((activity, index) => <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
      <strong>{activity.type}</strong> · {activity.minutes} minutes · {activity.points} points
      {activity.occurredAt && <time className="ms-2" dateTime={activity.occurredAt}>{new Date(activity.occurredAt).toLocaleDateString()}</time>}
    </li>)}</ul>}
  </section>;
}
