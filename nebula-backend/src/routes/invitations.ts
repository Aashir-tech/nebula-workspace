import express from 'express';
import {
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  getWorkspaceInvitations
} from '../controllers/invitationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', createInvitation);
router.get('/me', getMyInvitations);
router.post('/:id/accept', acceptInvitation);
router.post('/:id/reject', rejectInvitation);
router.get('/workspace/:workspaceId', getWorkspaceInvitations);

export default router;
