import { useApiData } from '../api/useApiData.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const { data, error, loading } = useApiData<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
  const leaderboard = data?.leaderboard ?? [];

  return <section><h2>Leaderboard</h2>
    {loading && <p role="status">Loading leaderboard...</p>}
    {error && <p role="alert">Unable to load leaderboard: {error}</p>}
    {!loading && !error && leaderboard.length === 0 && <p>No leaderboard scores yet.</p>}
    {!loading && !error && leaderboard.length > 0 && <ol className="list-group list-group-numbered">{leaderboard.map((entry) => <li className="list-group-item d-flex justify-content-between" key={entry.teamName}>
      <span>{entry.teamName}</span><strong>{entry.totalPoints} points</strong>
    </li>)}</ol>}
  </section>;
}
