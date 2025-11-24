import express from 'express';
import { getWorkspaces, createWorkspace, joinWorkspace } from '../controllers/workspaceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All workspace routes require authentication
router.use(authenticateToken);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.post('/join', joinWorkspace);

export default router;
