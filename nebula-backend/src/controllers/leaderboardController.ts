import { Request, Response } from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    
    if (!workspaceId) {
      throw new ApiError(400, 'Workspace ID is required');
    }

    // Get all tasks in this workspace
    const tasks = await Task.find({ workspaceId });
    
    // Calculate stats for each user
    const userStats = new Map<string, { user: any, tasksCompleted: number, trend: 'up' | 'down' | 'same' }>();
    
    for (const task of tasks) {
      if (task.assigneeId) {
        const userId = task.assigneeId.toString();
        if (!userStats.has(userId)) {
          const user = await User.findById(userId);
          if (user) {
            userStats.set(userId, { user, tasksCompleted: 0, trend: 'same' });
          }
        }
        if (task.status === 'DONE' && userStats.has(userId)) {
          const stats = userStats.get(userId)!;
          stats.tasksCompleted++;
        }
      }
    }
    
    // Convert to array and sort by tasks completed
    const leaderboard = Array.from(userStats.values())
      .map((stats) => ({
        id: stats.user._id.toString(),
        name: stats.user.name,
        email: stats.user.email,
        avatarUrl: stats.user.avatarUrl,
        streak: stats.user.streak,
        tasksCompleted: stats.tasksCompleted,
        trend: stats.trend
      }))
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted);
    
    res.json(leaderboard);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError( 500 , error.message || 'Failed to fetch leaderboard',);
  }
};
