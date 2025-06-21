import { Request, Response } from 'express';
import Player from '../models/Player';

export const getStandings = async (req: Request, res: Response) => {
  try {
    const players = await Player.find().lean();

    const standings = players.map((p) => ({
      _id: p._id,
      player: p.name,
      wins: p.wins || 0,
      losses: p.losses || 0,
      handicap: p.currentHandicap || 0,
    }));

    standings.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return a.handicap - b.handicap;
    });

    res.json(standings);
  } catch (err) {
    console.error('Error fetching standings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

