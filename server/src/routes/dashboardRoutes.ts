import express from 'express';
import { getStandings } from '../controllers/dashboardController';

const router = express.Router();

router.get('/standings', getStandings);

export default router;
