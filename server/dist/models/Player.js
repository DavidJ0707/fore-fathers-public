"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("../models/Match");
const PlayerSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    avatarUrl: String,
    currentHandicap: { type: Number, default: 0 },
    totalRounds: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    matchHistory: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Match' }],
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
exports.default = mongoose_1.default.model('Player', PlayerSchema);
