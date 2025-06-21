"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Match.ts
const mongoose_1 = __importDefault(require("mongoose"));
require("../models/Course");
const PlayerScoreSchema = new mongoose_1.default.Schema({
    playerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player' },
    strokes: Number,
    fairwayHit: Boolean,
});
const HoleSchema = new mongoose_1.default.Schema({
    holeNumber: Number,
    scores: [PlayerScoreSchema],
    driveUsedByTeam: {
        type: Map,
        of: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Player',
        },
        default: {},
    },
});
const MatchSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course', required: true },
    format: { type: String, enum: ['stroke', 'scramble', 'shamble'], required: true },
    scoringType: {
        type: String,
        enum: ['teams_4v4', 'teams_2v2v2v2', 'individual'],
        required: true,
    },
    teamScores: {
        type: Map,
        of: [Number], // per-hole team scores
    },
    teams: [
        {
            teamId: String,
            name: String,
            playerIds: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player' }],
        },
    ],
    holes: [HoleSchema],
    totalScores: { type: Map, of: Number },
    winners: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player' }],
});
exports.default = mongoose_1.default.model('Match', MatchSchema);
