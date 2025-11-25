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

    // Get workspace to find all members
    const Workspace = (await import('../models/Workspace.js')).default;
    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Get owner
    const owner = await User.findById(workspace.ownerId);
    
    // Get all members from workspace
    const memberIds = new Set<string>();
    if (owner) {
      memberIds.add(owner._id.toString());
    }
    
    // Add all workspace members
    if (workspace.members && workspace.members.length > 0) {
      workspace.members.forEach((member: any) => {
        memberIds.add(member.userId.toString());
      });
    }

    // Get all tasks in this workspace
    const tasks = await Task.find({ workspaceId, status: 'DONE' });
    
    // Calculate stats for each member
    const userStats = new Map<string, { user: any, tasksCompleted: number }>();
    
    // Initialize stats for all members
    for (const memberId of memberIds) {
      const user = await User.findById(memberId);
      if (user) {
        userStats.set(memberId, { 
          user, 
          tasksCompleted: 0
        });
      }
    }
    
    // Count completed tasks for each user
    for (const task of tasks) {
      // Use assigneeId if available, otherwise count for workspace owner
      const userId = task.assigneeId ? task.assigneeId.toString() : workspace.ownerId.toString();
      
      if (userStats.has(userId)) {
        const stats = userStats.get(userId)!;
        stats.tasksCompleted++;
      }
    }
    
    // Convert to array and sort by tasks completed
    const leaderboard = Array.from(userStats.values())
      .map((stats) => ({
        id: stats.user._id.toString(),
        name: stats.user.name,
        email: stats.user.email,
        avatarUrl: stats.user.avatarUrl,
        streak: stats.user.streak || 0,
        lastTaskDate: stats.user.lastTaskDate,
        tasksCompleted: stats.tasksCompleted,
        trend: 'same' as const // Can be enhanced with historical data
      }))
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted);
    
    res.json(leaderboard);
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Leaderboard error:', error);
    throw new ApiError(500, error.message || 'Failed to fetch leaderboard');
  }
};
