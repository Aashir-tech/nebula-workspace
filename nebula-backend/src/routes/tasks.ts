import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, duplicateTask, archiveTask } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/duplicate', duplicateTask);
router.post('/:id/archive', archiveTask);

export default router;
