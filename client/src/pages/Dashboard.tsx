import { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';
import { Link } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [upcomingMatch] = useState({ course: 'TBD', date: '2025-06-30' });
  const [standings, setStandings] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'wins' | 'handicap' | 'ffRating'>('wins');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFFRating, setShowFFRating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [standRes, matchRes] = await Promise.all([
          fetch(`${baseUrl}/api/dashboard/standings`),
          fetch(`${baseUrl}/api/matches?limit=3`),
        ]);
        if (!standRes.ok || !matchRes.ok) throw new Error('Failed to fetch data');
        setStandings(await standRes.json());
        setRecentMatches(await matchRes.json());
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    }

    fetchData();
  }, []);

  function getAvatarUrl(name: string): string {
    return `/avatars/${name}.jpg`;
  }

  function handleSort(field: 'wins' | 'handicap' | 'ffRating') {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  function sortArrow(field: string) {
    return sortBy === field ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : '';
  }

  function getSortedStandings() {
    return [...standings].sort((a, b) => {
      const factor = sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'handicap') {
        const aHcp = a.handicap && a.handicap > 0 ? a.handicap : Infinity;
        const bHcp = b.handicap && b.handicap > 0 ? b.handicap : Infinity;
        return factor * (aHcp - bHcp);
      }

      if (sortBy === 'ffRating') {
        const aFF = a.ffRating ?? Infinity;
        const bFF = b.ffRating ?? Infinity;
        return factor * (aFF - bFF);
      }

      if (b.wins !== a.wins) return factor * (b.wins - a.wins);
      return factor * (a.losses - b.losses);
    });
  }

  return (
    <div className="space-y-10 px-4 py-6 max-w-4xl mx-auto">

      {/* Upcoming Match */}
      <section className="bg-[#F0FAF4] border border-[#B3D9C3] rounded-xl p-4 shadow">
        <h2 className="text-xl font-bold mb-2 border-b pb-1 text-[#3B7A57]">Upcoming Match</h2>
        <div className="mt-2 text-base space-y-1">
          <p><strong>Course:</strong> {upcomingMatch.course}</p>
          <p><strong>Date:</strong> {new Date(upcomingMatch.date).toLocaleDateString()} @ TBD</p>
        </div>
      </section>

      {/* Standings */}
      <section>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-[#3B7A57]">Standings</h2>

        <div className="flex justify-end items-center mb-2 text-sm">
          <label className="mr-2 font-medium">Showing:</label>
          <button
            onClick={() => {
              const toggle = !showFFRating;
              setShowFFRating(toggle);
              setSortBy(toggle ? 'ffRating' : 'handicap');
            }}
            className="px-2 py-1 border rounded hover:bg-gray-100 transition text-sm"
          >
            {showFFRating ? 'FF Rating' : 'Handicap'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-[#f9fefb] border border-[#cbe5d3] rounded-xl shadow-sm text-sm text-[#1e1e1e]">
            <thead>
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Player</th>
                <th
                  className="px-4 py-2 cursor-pointer select-none"
                  onClick={() => handleSort('wins')}
                >
                  W–L{sortArrow('wins')}
                </th>
                <th
                  className="px-4 py-2 cursor-pointer select-none"
                  onClick={() => handleSort(showFFRating ? 'ffRating' : 'handicap')}
                >
                  {showFFRating ? 'FF Rating' : 'Handicap'}
                  {sortArrow(showFFRating ? 'ffRating' : 'handicap')}
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedStandings().map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/players/${s._id}`}
                      className="flex items-center gap-2 hover:underline hover:text-blue-600 transition"
                    >
                      <img
                        src={getAvatarUrl(s.player)}
                        alt={s.player}
                        className="w-8 h-8 rounded-full object-cover border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/avatars/default.png';
                        }}
                      />
                      {s.player}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{s.wins}–{s.losses}</td>
                  <td className="px-4 py-2">
                    {showFFRating
                      ? s.ffRating != null ? s.ffRating.toFixed(1) : 'N/A'
                      : s.handicap != null ? s.handicap : 'TBD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Matches */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-[#3B7A57]">Recent Matches</h2>
        <div className="space-y-4">
          {recentMatches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-6 text-center">
          <Link
            to="/matches"
            className="inline-block bg-[#3B7A57] text-white font-medium px-5 py-2 rounded-md shadow hover:bg-[#2F6648] transition"
          >
            See Full Match History
          </Link>
        </div>
      </section>
    </div>
  );
}



