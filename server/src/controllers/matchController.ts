// src/controllers/matchController.ts
import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import Match from '../models/Match';
import Course from '../models/Course';

export const getAllMatches: RequestHandler = async (req, res) => {
  const matches = await Match.find()
    .sort({ date: -1 }) // 👈 newest to oldest
    .populate('courseId')
    .populate('teams.playerIds')
    .populate('winners');

  res.json(matches);
};


export const getMatchById: RequestHandler = async (req, res): Promise<void> => {
  try {
    const match = await Match.findById(req.params.id)
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
  } catch (err) {
    console.error('Error fetching match:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMatch: RequestHandler = async (req, res): Promise<void> => {
  try {
    const match = new Match(req.body);
    await match.save();
    res.status(201).json(match);
  } catch (err) {
    console.error('Error creating match:', err);
    res.status(400).json({ message: 'Invalid match data' });
  }
};
