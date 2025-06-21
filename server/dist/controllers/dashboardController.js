"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStandings = void 0;
const Player_1 = __importDefault(require("../models/Player"));
const getStandings = async (req, res) => {
    try {
        const players = await Player_1.default.find().lean();
        const standings = players.map((p) => ({
            _id: p._id,
            player: p.name,
            wins: p.wins || 0,
            losses: p.losses || 0,
            handicap: p.currentHandicap || 0,
        }));
        // Sort by most wins → fewest losses → lowest handicap
        standings.sort((a, b) => {
            if (b.wins !== a.wins)
                return b.wins - a.wins;
            if (a.losses !== b.losses)
                return a.losses - b.losses;
            return a.handicap - b.handicap;
        });
        res.json(standings);
    }
    catch (err) {
        console.error('Error fetching standings:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStandings = getStandings;
