import express from 'express';
import { 
  getWorkspaces, 
  createWorkspace, 
  updateWorkspace, 
  deleteWorkspace,
  getWorkspaceMembers,
  addMember,
  removeMember
} from '../controllers/workspaceController.js';
import { leaveWorkspace } from '../controllers/leaveWorkspaceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWorkspaces);
router.post('/', createWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);
router.post('/:id/leave', leaveWorkspace);
router.get('/:id/members', getWorkspaceMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
