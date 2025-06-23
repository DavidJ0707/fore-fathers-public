import mongoose from 'mongoose';
import '../models/Match'

const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: String,
  currentHandicap: { type: Number, default: 0 },
  ffRating: { type: Number, default: null },
  totalRounds: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  teeColor: { type: String, default: 'White' },
  matchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  handicapDifferentials: [{ type: Number }],
  stats: {
    fairwaysHit: { type: Number, default: 0 },
    maxFairways: { type: Number, default: 0 },
    greensInRegulation: { type: Number, default: 0 },
    maxGreens: { type: Number, default: 0 },
    scrambleShotsUsed: { type: Number, default: 0 },
    maxScrambleShots: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
});

export default mongoose.model('Player', PlayerSchema);