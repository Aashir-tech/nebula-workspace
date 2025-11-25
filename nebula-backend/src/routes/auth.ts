import express from 'express';
import { register, login, getMe, updateUserProfile, deleteUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateUserProfile);
router.delete('/me', authenticateToken, deleteUser);

export default router;
