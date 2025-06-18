import { Request, Response, RequestHandler } from 'express';
import Player from '../models/Player';

export const getAllPlayers = async (req: Request, res: Response) => {
  const players = await Player.find();
  res.json(players);
};

export const createPlayer = async (req: Request, res: Response) => {
  const newPlayer = new Player(req.body);
  await newPlayer.save();
  res.status(201).json(newPlayer);
};

export const getPlayerById: RequestHandler = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!player) {
      res.status(404).json({ message: 'Player not found' });
      return;
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ message: 'Server error' });
  }
};