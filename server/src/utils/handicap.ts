export function calculateScoreDifferential(
  adjustedGrossScore: number,
  courseRating: number,
  slopeRating: number,
  pcc: number = 0 // optional, default to 0 if not tracked
): number {
  return ((adjustedGrossScore - courseRating - pcc) * 113) / slopeRating;
}

export function calculateHandicapIndex(scoreDifferentials: number[]): number {
  if (scoreDifferentials.length < 5) return 0;

  const sorted = [...scoreDifferentials].sort((a, b) => a - b);
  const count = scoreDifferentials.length >= 20 ? 8 : Math.floor(scoreDifferentials.length / 2);
  const avg = sorted.slice(0, count).reduce((a, b) => a + b, 0) / count;

  const index = Math.round(avg * 10) / 10;
  return Math.min(index, 54);
}


export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number
): number {
  return Math.round(handicapIndex * (slopeRating / 113) + (courseRating - par));
}

export function calculatePlayingHandicap(
  courseHandicap: number,
  allowance: number = 1
): number {
  return Math.round(courseHandicap * allowance);
}