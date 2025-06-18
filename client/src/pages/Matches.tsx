import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Matches() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/matches`)
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error('Error fetching matches', err));
  }, []);

  function getAvatarUrl(name: string): string {
    return `/avatars/${name}.jpg`;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold">Match History</h2>

      <div className="space-y-4">
        {matches.map((match) => (
          <Link
            to={`/matches/${match._id}`}
            key={match._id}
            className="relative block bg-white border rounded-xl shadow-md px-6 py-4 hover:shadow-lg hover:bg-gray-50 transition duration-200"
          >
            <div>
              <h3 className="text-lg font-semibold">
                {match.format.toUpperCase()} · {new Date(match.date).toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-600">
                {match.courseId?.name || 'Course'} · {(match.scoringType || '').replace(/^teams_/, '')}
              </p>
            </div>

            {/* Winner Avatars - Bottom Right */}
            <div className="absolute bottom-3 right-4 flex -space-x-3">
              {match.winners?.map((w: any, i: number) => {
                const name = typeof w === 'string' ? w : w.name;
                return (
                  <img
                    key={i}
                    src={getAvatarUrl(name)}
                    alt={name}
                    title={name}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/default.png';
                    }}
                  />
                );
              })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
