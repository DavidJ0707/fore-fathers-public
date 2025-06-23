import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const baseUrl = import.meta.env.VITE_API_URL;

export default function PlayerProfile() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlayerStats() {
      const res = await fetch(`${baseUrl}/api/players/${playerId}`);
      const data = await res.json();
      setPlayer(data);

      const matchDetails = await Promise.all(
        data.matchHistory.map((matchId: string) =>
          fetch(`${baseUrl}/api/matches/${matchId}`).then(res => res.json())
        )
      );
      setMatches(
        matchDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }

    fetchPlayerStats();
  }, [playerId]);

  if (!player) return <p className="text-center mt-10">Loading player stats...</p>;

  const getAvatarUrl = (name: string) => `/avatars/${name}.jpg`;

  const differentialData = player.handicapDifferentials?.map((value: number, index: number) => ({
    round: index + 1,
    differential: parseFloat(value.toFixed(2)),
  })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img
          src={getAvatarUrl(player.name)}
          alt={player.name}
          className="w-24 h-24 rounded-full object-cover border shadow"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/avatars/default.png';
          }}
        />
        <div>
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <p className="text-gray-600">Total Rounds: {player.totalRounds}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
        {[
          { label: 'Current Handicap', value: player.currentHandicap },
          { label: 'Wins', value: player.wins },
          { label: 'Losses', value: player.losses },
          { label: 'Avg Score', value: player.stats?.averageScore ?? 'N/A' },
          {
            label: 'Scramble Shots Used',
            value:
              player.stats?.maxScrambleShots && player.stats.maxScrambleShots > 0
                ? `${Math.round((player.stats.scrambleShotsUsed / player.stats.maxScrambleShots) * 100)}%`
                : '-',
          },
          {
            label: 'Fairways Hit',
            value:
              player.stats?.maxFairways && player.stats.maxFairways > 0
                ? `${Math.round((player.stats.fairwaysHit / player.stats.maxFairways) * 100)}%`
                : '-',
          },

        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Handicap Differential Graph */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">📉 Handicap Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={differentialData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }} />
            <YAxis domain={[0, 60]} label={{ value: 'Differential', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="differential" stroke="#3b82f6" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Match History */}
      <section>
        <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2">📝 Match History</h2>
        <div className="space-y-3">
          {matches.map((match: any) => {
            const playerName = player.name;
            const isWinner = match.winners?.some((w: any) =>
              typeof w === 'string' ? w === playerName : w.name === playerName
            );

            return (
              <Link
                key={match._id}
                to={`/matches/${match._id}`}
                className={`relative block border rounded-lg shadow px-4 py-3 hover:bg-gray-50 transition ${
                  isWinner ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}
              >
                {/* W/L Badge */}
                <div className={`absolute top-3 right-4 text-xs font-bold px-2 py-1 rounded-full shadow ${
                  isWinner ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {isWinner ? 'W' : 'L'}
                </div>

                {/* Match Details */}
                <div>
                  <h3 className="text-lg font-semibold">
                    {match.format.toUpperCase()} · {new Date(match.date).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {match.courseId?.name || 'Course'} · {(match.scoringType || '').replace(/^teams_/, '')}
                  </p>
                </div>

                {/* Winner Avatars */}
                <div className="absolute bottom-3 right-12 flex -space-x-3">
                  {match.winners?.map((w: any, i: number) => {
                    const name = typeof w === 'string' ? w : w.name;
                    return (
                      <img
                        key={i}
                        src={`/avatars/${name}.jpg`}
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
            );
          })}
        </div>
      </section>
    </div>
  );
}
