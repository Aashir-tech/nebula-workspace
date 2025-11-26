import { Request, Response } from 'express';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';

export const leaveWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Check if user is the owner
    if (workspace.ownerId.toString() === req.user.id) {
      throw new ApiError(400, 'Workspace owners cannot leave. Delete the workspace instead.');
    }

    // Remove user from workspace members
    if (workspace.members) {
      workspace.members = workspace.members.filter(
        (m: any) => m.userId.toString() !== req.user!.id
      );
      await workspace.save();
    }

    // Remove workspace from user's workspaces
    const user = await User.findById(req.user!.id);
    if (user) {
      user.workspaces = user.workspaces.filter(
        w => w.workspaceId.toString() !== id
      );
      await user.save();
    }

    res.json({ message: 'Left workspace successfully' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Leave workspace error:', error);
      res.status(500).json({ error: 'Failed to leave workspace' });
    }
  }
};
