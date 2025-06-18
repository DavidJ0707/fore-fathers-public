import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import path from 'path';
import Player from '../models/Player';
import Course from '../models/Course';
import Match from '../models/Match';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const MATCH_FILE = path.resolve(__dirname, '../uploads/06-15-2025-stroke.xlsx');

type TeamKey = 'A' | 'B' | 'C' | 'D';

function parseBoolean(val: any): boolean | undefined {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return undefined;
}

async function getOrCreatePlayer(name: string) {
  let player = await Player.findOne({ name });
  if (!player) player = await Player.create({ name });
  return player;
}

async function getOrCreateCourse(name: string, sheet: XLSX.Sheet) {
  const course = await Course.findOne({ name });
  if (course) return course;

  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  return await Course.create({
    name,
    teeBoxes: rows.map(row => {
      const parList = typeof row['hole_par'] === 'string'
        ? row['hole_par'].split(',').map((val: string) => parseInt(val.trim(), 10))
        : [];

      const distanceList = typeof row['hole_distance'] === 'string'
        ? row['hole_distance'].split(',').map((val: string) => parseInt(val.trim(), 10))
        : [];

      const holes = parList.map((par, index) => ({
        holeNumber: index + 1,
        par,
        distance: distanceList[index] || 0,
      }));

      return {
        teeColor: row['Tee Color'],
        courseRating: row['Rating'],
        slopeRating: row['Slope'],
        par: row['Par'],
        yardage: row['Yardage'],
        holes,
      };
    }),
  });
}

async function importMatch() {
  const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in your environment variables');
}

await mongoose.connect(MONGO_URI);
  const workbook = XLSX.readFile(MATCH_FILE);

  const info = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Match Info'])[0];
  const format = info['Format'].toLowerCase();
  const scoringType = info['Scoring Type'];

  const course = await getOrCreateCourse(info['Course Name'], workbook.Sheets['Courses']);
  const playersRaw = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Players']);
  const scoresRaw = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Hole Scores']);
  const drivesUsed = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Drives Used']);

  const playerMap: Record<string, any> = {};
  for (const p of playersRaw) {
    const doc = await getOrCreatePlayer(p['Player Name']);
    playerMap[p['Player Name']] = {
      _id: doc._id,
      team: p['Team'] as TeamKey,
      teeColor: p['Tee Color'],
      doc,
    };
  }

  const teamGroups: Record<string, any[]> = {};
  for (const p of playersRaw) {
    const team = p['Team'] as TeamKey;
    if (!teamGroups[team]) teamGroups[team] = [];
    teamGroups[team].push(playerMap[p['Player Name']]._id);
  }

  const teams = Object.entries(teamGroups).map(([teamId, playerIds]) => ({
    teamId,
    name: `Team ${teamId}`,
    playerIds,
  }));

  const groupedHoles: Record<number, any[]> = {};
  for (const row of scoresRaw) {
    const hole = row['Hole'];
    if (!groupedHoles[hole]) groupedHoles[hole] = [];
    groupedHoles[hole].push({
      playerId: playerMap[row['Player Name']]?._id,
      strokes: row['Strokes'],
      fairwayHit: parseBoolean(row['Fairway Hit']),
    });
  }

  const holes = [];
  for (let i = 1; i <= 18; i++) {
    const driveRow = drivesUsed.find(d => d['Hole'] === i);
    holes.push({
      holeNumber: i,
      scores: groupedHoles[i] || [],
      driveUsedByTeam: driveRow
        ? {
            A: playerMap[driveRow['Drive Used - Team A']]?._id || null,
            B: playerMap[driveRow['Drive Used - Team B']]?._id || null,
            C: playerMap[driveRow['Drive Used - Team C']]?._id || null,
            D: playerMap[driveRow['Drive Used - Team D']]?._id || null,
          }
        : null,
    });
  }

  const totalScores: Record<string, number> = {};
  const teamTotals: Record<string, number> = {};
  const teamScores: Record<string, number[]> = {};

  // Always calculate individual scores
  for (const hole of holes) {
    for (const s of hole.scores) {
      totalScores[s.playerId] = (totalScores[s.playerId] || 0) + s.strokes;
    }
  }

  // Then calculate team scores based on match type
  if (format === 'shamble' && scoringType === 'teams_4v4') {
    for (const hole of holes) {
      const holeScores: Record<string, number[]> = {};

      for (const s of hole.scores) {
        const playerTeam = Object.values(playerMap).find(p => p._id.toString() === s.playerId.toString())?.team;
        if (!playerTeam) continue;
        if (!holeScores[playerTeam]) holeScores[playerTeam] = [];
        holeScores[playerTeam].push(s.strokes);
      }

      for (const [teamId, strokes] of Object.entries(holeScores)) {
        const top3 = strokes.sort((a, b) => a - b).slice(0, 3);
        const sum = top3.reduce((a, b) => a + b, 0);
        teamScores[teamId] = [...(teamScores[teamId] || []), sum];
        teamTotals[teamId] = (teamTotals[teamId] || 0) + sum;
      }
    }
  } else if (format === 'stroke' && scoringType === 'teams_2v2v2v2') {
    for (const hole of holes) {
      const holeScores: Record<string, number> = {};

      for (const s of hole.scores) {
        const playerTeam = Object.values(playerMap).find(p => p._id.toString() === s.playerId.toString())?.team;
        if (!playerTeam) continue;
        holeScores[playerTeam] = (holeScores[playerTeam] || 0) + s.strokes;
      }

      for (const [teamId, sum] of Object.entries(holeScores)) {
        teamScores[teamId] = [...(teamScores[teamId] || []), sum];
        teamTotals[teamId] = (teamTotals[teamId] || 0) + sum;
      }
    }
  }

  let winners: string[] = [];
  if (scoringType.startsWith('teams')) {
    const lowest = Math.min(...Object.values(teamTotals));
    winners = Object.entries(teamTotals)
      .filter(([, score]) => score === lowest)
      .flatMap(([teamId]) => teamGroups[teamId]);
  } else {
    const entries = Object.entries(totalScores);
    const lowest = Math.min(...entries.map(([, score]) => score));
    winners = entries.filter(([, score]) => score === lowest).map(([id]) => id);
  }

  const match = await Match.create({
    date: new Date(info['Match Date']),
    courseId: course._id,
    format,
    scoringType,
    teams,
    holes,
    totalScores,
    teamScores,
    winners,
  });

  const ownBallTypes = ['individual', 'teams_2v2v2v2'];
  const isOwnBallStroke = format === 'stroke' && ownBallTypes.includes(scoringType);

  for (const [name, player] of Object.entries(playerMap)) {
    const doc = await Player.findById(player._id);
    if (!doc) continue;

    doc.totalRounds += 1;
    doc.matchHistory = [...(doc.matchHistory || []), match._id];

    const total = totalScores[player._id];
    const fairways = holes.flatMap(h =>
      h.scores.filter(s => s.playerId.toString() === player._id.toString() && s.fairwayHit)
    );
    const usedScrambles = holes.filter(h => {
      const driveUsed = h.driveUsedByTeam;
      const team = player.team;
      if (!driveUsed || !['A', 'B', 'C', 'D'].includes(team)) return false;
      return driveUsed[team as TeamKey]?.toString() === player._id.toString();
    });

    const isWinner = winners.some(id => id.toString() === player._id.toString());

    doc.wins = (doc.wins || 0) + (isWinner ? 1 : 0);
    doc.losses = (doc.losses || 0) + (isWinner ? 0 : 1);

    doc.stats = doc.stats || {
      fairwaysHit: 0,
      maxFairways: 0,
      greensInRegulation: 0,
      maxGreens: 0,
      scrambleShotsUsed: 0,
      maxScrambleShots: 0,
      averageScore: 0,
    };

    if (!isNaN(total)) {
      const prevTotal = doc.stats.averageScore * (doc.totalRounds - 1);
      doc.stats.averageScore = Math.round((prevTotal + total) / doc.totalRounds);
    }

    if (fairways.length > 0) {
      doc.stats.fairwaysHit += fairways.length;
      doc.stats.maxFairways += 18;
    }

    if (['scramble', 'shamble'].includes(match.format)) {
      doc.stats.scrambleShotsUsed += usedScrambles.length;
      doc.stats.maxScrambleShots += 18;
    }

    if (isOwnBallStroke) {
        const teeData = course.teeBoxes.find(tb => tb.teeColor === player.teeColor);
        if (teeData) {
            const differential = ((total - teeData.courseRating) * 113) / teeData.slopeRating;

            doc.handicapDifferentials = [...(doc.handicapDifferentials || []), differential];
            const diffs = doc.handicapDifferentials.slice(-20);
            const best8 = [...diffs].sort((a, b) => a - b).slice(0, 8);
            const handicapIndex = best8.reduce((sum, d) => sum + d, 0) / best8.length;

            doc.currentHandicap = Math.min(Math.round(handicapIndex * 10) / 10, 54); // ⛳️ apply max limit
        }
    }


    await doc.save();
  }

  console.log('✅ Match imported and processed successfully!');
  process.exit();
}

importMatch().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
