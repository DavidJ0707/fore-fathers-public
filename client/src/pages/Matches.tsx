import { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';

const baseUrl = import.meta.env.VITE_API_URL;

export default function Matches() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${baseUrl}/api/matches`)
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error('Error fetching matches', err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold">Match History</h2>

      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match._id} match={match} />
        ))}
      </div>
    </div>
  );
}
