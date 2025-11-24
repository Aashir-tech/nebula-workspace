import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/:workspaceId', authenticateToken, getLeaderboard);

export default router;
