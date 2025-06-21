"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerById = exports.createPlayer = exports.getAllPlayers = void 0;
const Player_1 = __importDefault(require("../models/Player"));
const getAllPlayers = async (req, res) => {
    const players = await Player_1.default.find();
    res.json(players);
};
exports.getAllPlayers = getAllPlayers;
const createPlayer = async (req, res) => {
    const newPlayer = new Player_1.default(req.body);
    await newPlayer.save();
    res.status(201).json(newPlayer);
};
exports.createPlayer = createPlayer;
const getPlayerById = async (req, res) => {
    try {
        const player = await Player_1.default.findById(req.params.id)
            .select('-__v')
            .lean();
        if (!player) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }
        res.json(player);
    }
    catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPlayerById = getPlayerById;
