import mongoose from 'mongoose';
import '../models/Course'

const PlayerScoreSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  strokes: Number,
  fairwayHit: Boolean,
});

const HoleSchema = new mongoose.Schema({
  holeNumber: Number,
  scores: [PlayerScoreSchema],
  driveUsedByTeam: {
    type: Map,
    of: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
    },
    default: {},
    },
});

const MatchSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  format: { type: String, enum: ['stroke', 'scramble', 'shamble'], required: true },
  scoringType: {
    type: String,
    enum: ['teams_4v4', 'teams_2v2v2v2', 'individual'],
    required: true,
  },
  teamScores: {
    type: Map,
    of: [Number],
  },
  teams: [
    {
      teamId: String,
      name: String,
      playerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    },
  ],
  holes: [HoleSchema],
  totalScores: { type: Map, of: Number },
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
});

export default mongoose.model('Match', MatchSchema);

