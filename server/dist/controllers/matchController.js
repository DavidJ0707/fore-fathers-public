"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatch = exports.getMatchById = exports.getAllMatches = void 0;
const Match_1 = __importDefault(require("../models/Match"));
const getAllMatches = async (req, res) => {
    const matches = await Match_1.default.find()
        .sort({ date: -1 }) // 👈 newest to oldest
        .populate('courseId')
        .populate('teams.playerIds')
        .populate('winners');
    res.json(matches);
};
exports.getAllMatches = getAllMatches;
const getMatchById = async (req, res) => {
    try {
        const match = await Match_1.default.findById(req.params.id)
            .populate({
            path: 'courseId',
            select: 'name holes teeBoxes par slopeRating courseRating yardage',
        })
            .populate('teams.playerIds')
            .populate('holes.scores.playerId')
            .populate('winners');
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        res.json(match);
    }
    catch (err) {
        console.error('Error fetching match:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMatchById = getMatchById;
const createMatch = async (req, res) => {
    try {
        const match = new Match_1.default(req.body);
        await match.save();
        res.status(201).json(match);
    }
    catch (err) {
        console.error('Error creating match:', err);
        res.status(400).json({ message: 'Invalid match data' });
    }
};
exports.createMatch = createMatch;
