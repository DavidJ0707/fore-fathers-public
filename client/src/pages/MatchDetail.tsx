import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const baseUrl = import.meta.env.VITE_API_URL;

export default function MatchDetail() {
  const { matchId } = useParams();
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/matches/${matchId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched match:', data);
        setMatch(data);
      })
      .catch(console.error);
  }, [matchId]);

  const hasHoles =
    !!match?.courseId?.holes?.length ||
    !!match?.courseId?.teeBoxes?.[0]?.holes?.length;

  if (!match || !hasHoles) {
    return <p className="text-center text-gray-600">Loading match and course info...</p>;
  }

  const isWinner = (playerId: string) =>
    match.winners?.some((w: any) => w._id === playerId || w === playerId);

  const getDriveUsed = (hole: any, teamId: string) =>
    hole.driveUsedByTeam?.[teamId]?._id || hole.driveUsedByTeam?.[teamId];

  const getPlayerScore = (playerId: string, holeScores: any[]) =>
    holeScores.find((s: any) => s.playerId._id === playerId || s.playerId === playerId)?.strokes ?? null;

  const getFinalTeamOrder = () => {
    const teamsWithTotals = match.teams.map((team: any) => {
      const total = (match.teamScores?.[team.teamId] || []).reduce(
        (sum: number, s: number) => sum + s,
        0
      );
      return { ...team, total };
    });

    return teamsWithTotals
      .sort((a: { total: number }, b: { total: number }) => a.total - b.total)
      .map((team: any, index: number) => ({
        ...team,
        rank: index + 1,
      }));
  };

  const getSortedPlayersByScore = (playerIds: any[]) => {
    return [...playerIds].sort((a: any, b: any) => {
      const idA = a._id || a;
      const idB = b._id || b;
      const scoreA = match.totalScores?.[idA] ?? Infinity;
      const scoreB = match.totalScores?.[idB] ?? Infinity;
      return scoreA - scoreB;
    });
  };

  const getMidRoundScores = () => {
    return getFinalTeamOrder().map((team: any) => {
      const scoreArr = match.teamScores?.[team.teamId] || [];
      const score = scoreArr.slice(0, 9).reduce((sum: number, s: number) => sum + s, 0);
      return { teamId: team.teamId, name: team.name, score };
    });
  };

  const getWinningTeamIdsForHole = (holeIndex: number): string[] => {
    const scoresByTeam = match.teams.map((team: any) => {
      const score = match.teamScores?.[team.teamId]?.[holeIndex];
      return { teamId: team.teamId, score };
    }).filter((t: { score: any }) => typeof t.score === 'number');

    const lowest = Math.min(...scoresByTeam.map((t: { score: any; }) => t.score));
    return scoresByTeam.filter((t: { score: number; }) => t.score === lowest).map((t: { teamId: any; }) => t.teamId);
  };

  return (
    <div className="space-y-10 px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#4C9A6A]">
          {match.format.toUpperCase()} Match · {new Date(match.date).toLocaleDateString()}
        </h2>
        <p className="text-gray-600 font-semibold">
        Format: {match.scoringType.replace(/^teams_/, '')} · Course: {match.courseId?.name || match.courseId}
        </p>
      </div>

      {/* Teams Overview */}
        <section>
        <h3 className="text-2xl font-semibold mb-6 text-[#1e1e1e]">Teams</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFinalTeamOrder().map((team: any) => (
            <div
                key={team.teamId}
                className="bg-[#f9fefb] border border-[#cbe5d3] p-5 pb-10 rounded-2xl shadow hover:shadow-lg transition"
            >
                <h4 className="font-bold text-[#1e1e1e] text-lg mb-3">
                {team.name} ·{' '}
                {team.rank === 1
                    ? '🥇 1st'
                    : team.rank === 2
                    ? '🥈 2nd'
                    : team.rank === 3
                    ? '🥉 3rd'
                    : `#${team.rank}`}{' '}
                · {team.total} strokes
                </h4>
                <ul className="flex flex-wrap gap-3 mt-2">
                {getSortedPlayersByScore(team.playerIds).map((p: any) => {
                    const id = p._id || p;
                    const name = p.name || id;
                    const isWinning = isWinner(id);
                    const avatarSrc = `/avatars/${name}.jpg`;

                    return (
                    <li key={id} className="relative group">
                        <img
                        src={avatarSrc}
                        alt={name}
                        title={`${name} · ${match.totalScores?.[id] || '-'} strokes`}
                        className={`w-12 h-12 rounded-full border-2 ${
                            isWinning ? 'border-[#4C9A6A]' : 'border-white'
                        } object-cover shadow-sm`}
                        onError={(e) =>
                            ((e.target as HTMLImageElement).src = '/avatars/default.png')
                        }
                        />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-[#333] whitespace-nowrap">
                        {match.totalScores?.[id] || '-'}
                        </span>
                        {isWinning && (
                        <span className="absolute -top-2 -right-2 text-lg">🏆</span>
                        )}
                    </li>
                    );
                })}
                </ul>
            </div>
            ))}
        </div>
        </section>


      {/* Hole Breakdown */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Hole Breakdown</h3>
        <div className="space-y-6">
          {match.holes.map((hole: any, holeIdx: number) => {
            const courseHole =
              match.courseId?.holes?.[holeIdx] ??
              match.courseId?.teeBoxes?.[0]?.holes?.[holeIdx];

            const par = courseHole?.par ?? '-';
            const distance = courseHole?.distance ?? '-';

            return (
              <div key={hole.holeNumber}>
                {/* Mid-Round Scores */}
                {holeIdx === 9 && (
                <div className="bg-[#e6f6ec] border border-[#b5e3c7] p-4 rounded-xl shadow mb-5">
                    <h4 className="text-lg font-bold mb-3 text-[#1e1e1e]">🏌️ Mid-Round Scores (After 9 Holes)</h4>
                    <ul className="space-y-3">
                    {getMidRoundScores().map((team: any) => {
                        const teamData = match.teams.find((t: any) => t.teamId === team.teamId);

                        return (
                        <li key={team.teamId}>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Avatars */}
                                <div className="flex -space-x-3">
                                {teamData?.playerIds.map((p: any) => {
                                    const id = p._id || p;
                                    const name = p.name || id;
                                    const avatarSrc = `/avatars/${name}.jpg`;

                                    return (
                                    <img
                                        key={id}
                                        src={avatarSrc}
                                        alt={name}
                                        title={name}
                                        className="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
                                        onError={(e) =>
                                        ((e.target as HTMLImageElement).src = '/avatars/default.png')
                                        }
                                    />
                                    );
                                })}
                                </div>
                                <span className="font-medium text-[#1e1e1e]">{teamData?.name}</span>
                            </div>
                            <span className="text-[#4C9A6A] font-semibold text-sm">{team.score} strokes</span>
                            </div>
                        </li>
                        );
                    })}
                    </ul>
                </div>
                )}

                <div className="bg-white p-4 rounded-xl shadow-md border border-[#d9f2e1]">
                  <h4 className="font-bold mb-4 text-[#1e1e1e] flex justify-between items-center">
                    <span>Hole {hole.holeNumber}</span>
                    <span>Par {par}</span>
                    <span>{distance} yds</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getFinalTeamOrder().map((team: any) => {
                      const holeScore = match.teamScores?.[team.teamId]?.[holeIdx] ?? '-';

                      return (
                        <div key={team.teamId}>
                          <h5 className="text-sm font-bold mb-1">
                            {team.name} · {holeScore} strokes{' '}
                            {getWinningTeamIdsForHole(holeIdx).includes(team.teamId) && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-1">
                                🏆 Won Hole
                              </span>
                            )}
                          </h5>
                          <ul className="text-sm space-y-1">
                            {team.playerIds.map((p: any) => {
                              const id = p._id || p;
                              const strokes = getPlayerScore(id, hole.scores);
                              const driveUsed = getDriveUsed(hole, team.teamId) === id;
                              return (
                                <li
                                  key={id}
                                  className={`px-2 py-1 rounded ${driveUsed ? 'bg-yellow-100 font-bold' : ''}`}
                                >
                                  {p.name || id}: {strokes ?? '-'} strokes
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
