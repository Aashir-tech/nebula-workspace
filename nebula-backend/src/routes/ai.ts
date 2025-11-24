import express from 'express';
import rateLimit from 'express-rate-limit';
import { enhanceText, generateInsights, generateStandup } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for AI endpoints - 50 requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many AI requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI routes require authentication and rate limiting
router.use(authenticateToken);
router.use(aiLimiter);

router.post('/enhance', enhanceText);
router.post('/insights', generateInsights);
router.post('/standup', generateStandup);

export default router;
