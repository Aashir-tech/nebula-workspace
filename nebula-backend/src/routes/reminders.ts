import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Reminder from '../models/Reminder.js';
import Task from '../models/Task.js';

const router = express.Router();

// All reminder routes require authentication
router.use(authenticateToken);

// Get all reminders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const reminders = await Reminder.find({ userId, sent: false })
      .populate('taskId')
      .sort({ reminderTime: 1 });
    
    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a reminder for a task
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { taskId, reminderType, reminderTime } = req.body;

    // Verify task exists and belongs to user's workspace
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const reminder = new Reminder({
      taskId,
      userId,
      reminderType,
      reminderTime: reminderTime || calculateReminderTime(reminderType, task.dueDate),
      sent: false
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update a reminder
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    Object.assign(reminder, updates);
    await reminder.save();
    
    res.json(reminder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate reminder time based on type
function calculateReminderTime(type: string, dueDate?: Date): Date {
  if (!dueDate) {
    return new Date(); // Default to now if no due date
  }

  const due = new Date(dueDate);
  switch (type) {
    case '30min':
      return new Date(due.getTime() - 30 * 60 * 1000);
    case '1hour':
      return new Date(due.getTime() - 60 * 60 * 1000);
    case '3hours':
      return new Date(due.getTime() - 3 * 60 * 60 * 1000);
    case '1day':
      return new Date(due.getTime() - 24 * 60 * 60 * 1000);
    default:
      return due;
  }
}

export default router;
