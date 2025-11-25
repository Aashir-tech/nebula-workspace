import express from 'express';
import { getWorkspaces, createWorkspace, joinWorkspace, getWorkspaceMembers, removeMember, updateWorkspace, deleteWorkspace } from '../controllers/workspaceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All workspace routes require authentication
router.use(authenticateToken);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.post('/join', joinWorkspace);
router.get('/:id/members', getWorkspaceMembers);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;
