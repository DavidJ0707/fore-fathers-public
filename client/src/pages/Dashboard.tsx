import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [upcomingMatch] = useState({
    course: 'TBD',
    date: '2025-06-30',
  });

  const [standings, setStandings] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'wins' | 'handicap'>('wins');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    async function fetchData() {
      try {
        const standingsRes = await fetch(`${baseUrl}/api/dashboard/standings`);
        const matchesRes = await fetch(`${baseUrl}/api/matches?limit=3`);

        if (!standingsRes.ok || !matchesRes.ok) throw new Error('Failed to fetch data');
        const standingsData = await standingsRes.json();
        const matchData = await matchesRes.json();

        setStandings(standingsData);
        setRecentMatches(matchData);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    }

    fetchData();
  }, []);

  function getAvatarUrl(name: string): string {
    const filename = `${name}.jpg`;
    return `/avatars/${filename}`;
    }


  function getSortedStandings() {
    return [...standings].sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;

        if (sortBy === 'handicap') {
        const aHcp = a.handicap && a.handicap > 0 ? a.handicap : Infinity;
        const bHcp = b.handicap && b.handicap > 0 ? b.handicap : Infinity;
        return factor * (aHcp - bHcp);
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
    <div className="overflow-x-auto">
        <table className="w-full bg-[#f9fefb] border border-[#cbe5d3] rounded-xl shadow-sm text-sm text-[#1e1e1e]">
        <thead>
            <tr className="bg-gray-100 text-left text-sm">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Player</th>
            <th
                className="px-4 py-2 cursor-pointer select-none"
                onClick={() => {
                setSortBy('wins');
                setSortOrder(() => sortBy === 'wins' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
            >
                W–L {sortBy === 'wins' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th
                className="px-4 py-2 cursor-pointer select-none"
                onClick={() => {
                setSortBy('handicap');
                setSortOrder(() => sortBy === 'handicap' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
            >
                Handicap {sortBy === 'handicap' && (sortOrder === 'asc' ? '▲' : '▼')}
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
                <td className="px-4 py-2">{!s.handicap ? 'TBD' : s.handicap}</td>
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
        {recentMatches.map((match: any) => (
            <Link
            key={match._id}
            to={`/matches/${match._id}`}
            className="relative block bg-white border border-gray-200 rounded-xl shadow-md px-6 py-4 hover:shadow-lg hover:bg-[#f9fdfb] transition duration-200"
            >

            {/* Match Info */}
            <div>
            <h3 className="text-lg font-semibold">
                {match.format.toUpperCase()} · {new Date(match.date).toLocaleDateString()}
            </h3>
            <p className="text-sm text-gray-600">
                {match.courseId?.name || 'Course'} · {(match.scoringType || '').replace(/^teams_/, '')}
            </p>
            </div>

            {/* Winner Avatars - Positioned to bottom right */}
            <div className="absolute bottom-3 right-4 flex -space-x-3">
            {match.winners.map((w: any, i: number) => {
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

