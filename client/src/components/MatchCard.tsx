import { Link } from 'react-router-dom';

interface MatchCardProps {
  match: any;
  playerName?: string; // for profile W/L badge
  getAvatarUrl?: (name: string) => string;
  showWLBadge?: boolean;
  showAvatars?: boolean;
  avatarOffset?: string; // e.g., 'right-4' or 'right-12'
}

export default function MatchCard({
  match,
  playerName,
  getAvatarUrl = (name: string) => `/avatars/${name}.jpg`,
  showWLBadge = false,
  showAvatars = true,
  avatarOffset = 'right-4',
}: MatchCardProps) {
  const isWinner =
    playerName &&
    match.winners?.some((w: any) =>
      typeof w === 'string' ? w === playerName : w.name === playerName
    );

  const teamsWithScores = match.teams?.map((team: any) => {
    const total = (match.teamScores?.[team.teamId] || []).reduce(
      (sum: number, strokes: number) => sum + strokes,
      0
    );
    return { total };
  }) || [];

  const minScore = Math.min(...teamsWithScores.map((t: { total: number }) => t.total));

  return (
    <Link
      to={`/matches/${match._id}`}
      key={match._id}
      className={`relative flex flex-col justify-between bg-white border rounded-xl shadow-md px-6 py-5 h-40 transition hover:shadow-lg ${
        isWinner !== undefined
          ? isWinner
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      {/* W/L Badge */}
      {showWLBadge && (
        <div
          className={`absolute top-3 right-4 text-xs font-bold px-2 py-1 rounded-full shadow ${
            isWinner ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isWinner ? 'W' : 'L'}
        </div>
      )}

      {/* Top Info */}
      <div>
        <h3 className="text-lg font-semibold">
          {match.format.toUpperCase()} · {new Date(match.date).toLocaleDateString()}
        </h3>
        <p className="text-sm text-gray-600">
          {match.courseId?.name || 'Course'} · {(match.scoringType || '').replace(/^teams_/, '')}
        </p>
      </div>

      {/* Desktop: Centered Score Row */}
    <div className="hidden lg:flex justify-center items-center gap-2 text-xl font-extrabold tracking-wide mt-auto mb-auto">
    {teamsWithScores.map((team: { total: number }, index: number) => (
        <div key={index} className="flex items-center gap-1">
        <span
            className={`px-3 py-1 rounded-full shadow-sm ${
            team.total === minScore
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
        >
            {team.total}
        </span>
        {index < teamsWithScores.length - 1 && (
            <span className="text-gray-400 font-semibold">—</span>
        )}
        </div>
    ))}
    </div>

    {/* Mobile: Score Row under course info */}
    <div className="block lg:hidden flex gap-2 mt-2 text-lg font-bold tracking-wide">
    {teamsWithScores.map((team: { total: number }, index: number) => (
        <div key={index} className="flex items-center gap-1">
        <span
            className={`px-2 py-0.5 rounded-md ${
            team.total === minScore
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
        >
            {team.total}
        </span>
        {index < teamsWithScores.length - 1 && (
            <span className="text-gray-400 font-semibold">—</span>
        )}
        </div>
    ))}
    </div>




      {/* Avatars */}
      {showAvatars && (
        <div className={`absolute bottom-3 ${avatarOffset} flex -space-x-3`}>
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
      )}
    </Link>
  );
}
