import { Request, Response } from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';
import { CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../types/index.js';

// Helper function to update streak
const updateUserStreak = async (userId: string): Promise<void> => {
  console.log('Updating streak for user:', userId);
  const user = await User.findById(userId);
  if (!user) {
    console.log('User not found for streak update');
    return;
  }

  const now = new Date();
  const lastDate = user.lastTaskDate ? new Date(user.lastTaskDate) : null;
  console.log('Current streak:', user.streak, 'Last task date:', lastDate);

  if (!lastDate) {
    // First task ever
    user.streak = 1;
    user.lastTaskDate = now;
    console.log('First task! Streak set to 1');
  } else {
    // Check if it's the same day
    const isSameDay = 
      now.getFullYear() === lastDate.getFullYear() &&
      now.getMonth() === lastDate.getMonth() &&
      now.getDate() === lastDate.getDate();

    if (isSameDay) {
      // Same day, just update timestamp
      user.lastTaskDate = now;
      console.log('Same day task. Streak remains:', user.streak);
    } else {
      // Different day - check if consecutive
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isYesterday = 
        yesterday.getFullYear() === lastDate.getFullYear() &&
        yesterday.getMonth() === lastDate.getMonth() &&
        yesterday.getDate() === lastDate.getDate();

      if (isYesterday) {
        // Consecutive day - increment streak
        user.streak += 1;
        user.lastTaskDate = now;
        console.log('Consecutive day! Streak incremented to:', user.streak);
      } else {
        // Streak broken - reset to 1
        user.streak = 1;
        user.lastTaskDate = now;
        console.log('Streak broken. Reset to 1');
      }
    }
  }

  await user.save();
  console.log('User saved with new streak:', user.streak);
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { workspaceId } = req.query;

    if (!workspaceId) {
      throw new ApiError(400, 'Workspace ID is required');
    }

    const tasks = await Task.find({ workspaceId })
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB _id to id and timestamps to numbers
    const formattedTasks = tasks.map(task => ({
      id: task._id.toString(),
      workspaceId: task.workspaceId.toString(),
      title: task.title,
      contentBlocks: task.contentBlocks,
      status: task.status,
      tags: task.tags,
      assigneeId: task.assigneeId?.toString(),
      aiEnhanced: task.aiEnhanced,
      dueDate: task.dueDate,
      createdAt: new Date(task.createdAt).getTime()
    }));

    res.json(formattedTasks);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { workspaceId, title, contentBlocks, tags, dueDate } = req.body as CreateTaskRequest;

    if (!workspaceId || !title) {
      throw new ApiError(400, 'Workspace ID and title are required');
    }

    const task = new Task({
      workspaceId,
      title,
      contentBlocks: contentBlocks || [{ 
        id: `b-${Date.now()}`, 
        type: 'paragraph', 
        content: '' 
      }],
      status: TaskStatus.TODO,
      tags: tags || [],
      aiEnhanced: false,
      dueDate: dueDate
    });

    await task.save();

    const formattedTask = {
      id: task._id.toString(),
      workspaceId: task.workspaceId.toString(),
      title: task.title,
      contentBlocks: task.contentBlocks,
      status: task.status,
      tags: task.tags,
      aiEnhanced: task.aiEnhanced,
      dueDate: task.dueDate,
      createdAt: task.createdAt.getTime()
    };

    res.status(201).json(formattedTask);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const updates = req.body as UpdateTaskRequest;

    const task = await Task.findById(id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if task is being marked as DONE (for streak logic)
    const wasNotDone = task.status !== TaskStatus.DONE;
    const nowDone = updates.status === TaskStatus.DONE;

    // Update task fields
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.contentBlocks !== undefined) task.contentBlocks = updates.contentBlocks;
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.tags !== undefined) task.tags = updates.tags;
    if (updates.aiEnhanced !== undefined) task.aiEnhanced = updates.aiEnhanced;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;

    await task.save();

    // Update streak if task was just completed
    if (wasNotDone && nowDone) {
      await updateUserStreak(req.user.id);
    }

    const formattedTask = {
      id: task._id.toString(),
      workspaceId: task.workspaceId.toString(),
      title: task.title,
      contentBlocks: task.contentBlocks,
      status: task.status,
      tags: task.tags,
      aiEnhanced: task.aiEnhanced,
      dueDate: task.dueDate,
      createdAt: task.createdAt.getTime()
    };

    res.json(formattedTask);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update task error:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
};
