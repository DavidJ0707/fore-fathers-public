import express from 'express';
import { getAllPlayers, createPlayer, getPlayerById } from '../controllers/playerController';
const router = express.Router();

router.get('/', getAllPlayers);
router.post('/', createPlayer);
router.get('/:id', getPlayerById);

export default router;
