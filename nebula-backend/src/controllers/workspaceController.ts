import { Request, Response } from 'express';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';
import { WorkspaceType } from '../types/index.js';

export const getWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id).populate('workspaces.workspaceId');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get all workspace details
    const workspaceIds = user.workspaces.map(w => w.workspaceId);
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } });

    const formattedWorkspaces = workspaces.map(ws => {
      const userWorkspace = user.workspaces.find(
        uw => uw.workspaceId.toString() === ws._id.toString()
      );

      return {
        id: ws._id.toString(),
        name: ws.name,
        type: ws.type,
        role: userWorkspace?.role || 'MEMBER'
      };
    });

    res.json(formattedWorkspaces);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get workspaces error:', error);
      res.status(500).json({ error: 'Failed to fetch workspaces' });
    }
  }
};

export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { name, type } = req.body;

    if (!name || !type) {
      throw new ApiError(400, 'Name and type are required');
    }

    if (!Object.values(WorkspaceType).includes(type)) {
      throw new ApiError(400, 'Invalid workspace type');
    }

    const workspace = new Workspace({
      name,
      type,
      ownerId: req.user.id
    });

    await workspace.save();

    // Add workspace to user
    const user = await User.findById(req.user.id);
    if (user) {
      user.workspaces.push({
        workspaceId: workspace._id.toString(),
        role: 'OWNER'
      });
      await user.save();
    }

    res.status(201).json({
      id: workspace._id.toString(),
      name: workspace.name,
      type: workspace.type,
      role: 'OWNER',
      inviteCode: workspace.inviteCode
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create workspace error:', error);
      res.status(500).json({ error: 'Failed to create workspace' });
    }
  }
};

export const joinWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { inviteCode } = req.body;

    if (!inviteCode) {
      throw new ApiError(400, 'Invite code is required');
    }

    const workspace = await Workspace.findOne({ inviteCode });
    if (!workspace) {
      throw new ApiError(404, 'Invalid invite code');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if already a member
    const alreadyMember = user.workspaces.some(
      w => w.workspaceId.toString() === workspace._id.toString()
    );

    if (alreadyMember) {
      throw new ApiError(409, 'Already a member of this workspace');
    }

    // Add workspace to user
    user.workspaces.push({
      workspaceId: workspace._id.toString(),
      role: 'MEMBER'
    });
    await user.save();

    res.json({
      id: workspace._id.toString(),
      name: workspace.name,
      type: workspace.type,
      role: 'MEMBER'
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Join workspace error:', error);
      res.status(500).json({ error: 'Failed to join workspace' });
    }
  }
};
