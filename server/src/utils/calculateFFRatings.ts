import mongoose from 'mongoose';
import Match from '../models/Match';
import Course from '../models/Course';
import Player from '../models/Player';
import dotenv from 'dotenv';
dotenv.config();

function adjustShambleScores({
  match,
  course,
  playerId,
}: {
  match: any;
  course: any;
  playerId: string | mongoose.Types.ObjectId;
}) {
  const pid = String(playerId);
  const driveStreaks: Record<string, number> = { [pid]: 0 };
  let adjustedTotal = 0;

  for (const hole of match.holes) {
    const teamId = match.teams.find((team: any) =>
      team.playerIds.some((id: any) => String(id) === pid)
    )?.teamId;

    const playerScore = hole.scores.find((s: any) => String(s.playerId) === pid)?.strokes ?? 0;
    const driveUsed = String(hole.driveUsedByTeam?.[teamId]) === pid;
    const hitFairway = hole.fairwayHit?.[pid] === true;

    let penalty = 0;
    const streak = driveStreaks[pid] || 0;

    if (!hitFairway) {
      if (streak === 1) penalty = 1;
      if (streak >= 2) penalty = 2;
    }

    driveStreaks[pid] = driveUsed ? 0 : streak + 1;
    adjustedTotal += playerScore + penalty;
  }

  return adjustedTotal;
}

function calculateDifferential(score: number, courseRating: number, slopeRating: number) {
  return ((score - courseRating) * 113) / slopeRating;
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('Connected.');
  const players = await Player.find();

  for (const player of players) {
    console.log(`Processing: ${player.name}`);
    const differentials: number[] = [];

    for (const matchId of player.matchHistory) {
      const match = await Match.findById(matchId)
        .populate('courseId')
        .lean();

      if (!match || !match.courseId || !match.totalScores) continue;

      const playerIdStr = String(player._id);
      if (!match.totalScores[playerIdStr]) continue;

      const course: any = match.courseId;
      const teeBox = course.teeBoxes?.find((tb: any) => tb.teeColor === player.teeColor);
      if (!teeBox) continue;

      let adjustedScore = 0;

      if (match.format === 'stroke') {
        adjustedScore = match.totalScores[playerIdStr];
      } else if (match.format === 'shamble') {
        adjustedScore = adjustShambleScores({
          match,
          course,
          playerId: player._id,
        });
      }

      const differential = calculateDifferential(
        adjustedScore,
        teeBox.courseRating,
        teeBox.slopeRating
      );
      differentials.push(differential);
    }

    const last20 = differentials.slice(-20);
    const best8 = [...last20].sort((a, b) => a - b).slice(0, 8);
    const ffIndex =
      best8.length > 0 ? best8.reduce((sum, d) => sum + d, 0) / best8.length : null;

    if (ffIndex !== null) {
      player.ffRating = Math.round(ffIndex * 10) / 10;
      await player.save();
      console.log(`Updated ${player.name}: FF Rating = ${player.ffRating}`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);

