import express from 'express';
import { getAllMatches, getMatchById, createMatch } from '../controllers/matchController';

const router = express.Router();

router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.post('/', createMatch);

export default router;


