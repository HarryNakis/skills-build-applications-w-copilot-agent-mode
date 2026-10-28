import { useApiData } from '../api/useApiData.js';

type Team = { _id?: string; name: string; mascot: string; members: string[] };

export default function Teams() {
  const { data, error, loading } = useApiData<{ teams: Team[] }>('/api/teams');
  const teams = data?.teams ?? [];

  return <section><h2>Teams</h2>
    {loading && <p role="status">Loading teams...</p>}
    {error && <p role="alert">Unable to load teams: {error}</p>}
    {!loading && !error && teams.length === 0 && <p>No teams yet.</p>}
    {!loading && !error && teams.length > 0 && <ul className="list-group">{teams.map((team, index) => <li className="list-group-item d-flex justify-content-between" key={team._id ?? team.name ?? index}>
      <span><strong>{team.name}</strong> · {team.mascot}</span><span>{team.members?.length ?? 0} members</span>
    </li>)}</ul>}
  </section>;
}
