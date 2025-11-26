import { Request, Response } from 'express';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
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
    console.log('getWorkspaces: User ID:', req.user.id);
    console.log('getWorkspaces: User workspaces:', user.workspaces);
    
    const workspaceIds = user.workspaces.map(w => w.workspaceId);
    console.log('getWorkspaces: Workspace IDs:', workspaceIds);
    
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } });
    console.log('getWorkspaces: Found workspaces:', workspaces.length);

    const formattedWorkspaces = workspaces.map(ws => {
      // Check if user is the owner first
      if (ws.ownerId.toString() === req.user!.id) {
        return {
          id: ws._id.toString(),
          name: ws.name,
          type: ws.type,
          role: 'OWNER' as const
        };
      }

      // Check user's workspace array for role
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

// Get workspace members
export const getWorkspaceMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Check if user is a member of this workspace
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isMember = user.workspaces.some(w => w.workspaceId.toString() === id);
    if (!isMember) {
      throw new ApiError(403, 'Not a member of this workspace');
    }

    // Get owner details
    const owner = await User.findById(workspace.ownerId);
    const members: Array<{
      id: string;
      name: string;
      email: string;
      avatarUrl: string;
      role: 'OWNER' | 'ADMIN' | 'MEMBER';
      joinedAt: Date;
    }> = [];
    
    if (owner) {
      members.push({
        id: owner._id.toString(),
        name: owner.name || '',
        email: owner.email || '',
        avatarUrl: owner.avatarUrl || '',
        role: 'OWNER',
        joinedAt: workspace.createdAt
      });
    }

    // Get other members
    if (workspace.members && workspace.members.length > 0) {
      for (const member of workspace.members) {
        const memberUser = await User.findById(member.userId);
        if (memberUser && memberUser._id.toString() !== workspace.ownerId.toString()) {
          members.push({
            id: memberUser._id.toString(),
            name: memberUser.name || '',
            email: memberUser.email || '',
            avatarUrl: memberUser.avatarUrl || '',
            role: member.role as 'ADMIN' | 'MEMBER',
            joinedAt: member.joinedAt
          });
        }
      }
    }

    res.json(members);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get workspace members error:', error);
      res.status(500).json({ error: 'Failed to fetch workspace members' });
    }
  }
};

// Add member to workspace
export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const { email, role = 'MEMBER' } = req.body;

    console.log('Add member request:', { workspaceId: id, email, role, body: req.body });

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Check if requester is owner or admin
    const isOwner = workspace.ownerId.toString() === req.user?.id;
    const requesterMember = workspace.members?.find((m: any) => m.userId.toString() === req.user?.id);
    const isAdmin = requesterMember?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Only workspace owners and admins can add members');
    }

    // Find user by email
    const newMember = await User.findOne({ email: email.toLowerCase() });
    if (!newMember) {
      throw new ApiError(404, 'User not found. Please ask them to sign up first.');
    }

    // Check if user is already a member
    const isMember = workspace.members?.some((m: any) => m.userId.toString() === newMember._id.toString());
    if (isMember || workspace.ownerId.toString() === newMember._id.toString()) {
      throw new ApiError(409, 'User is already a member of this workspace');
    }

    // Add to workspace members
    if (!workspace.members) {
      workspace.members = [];
    }
    workspace.members.push({
      userId: newMember._id as any,
      role: role as any,
      joinedAt: new Date()
    });
    await workspace.save();

    // Add workspace to user
    if (!newMember.workspaces) {
      newMember.workspaces = [];
    }
    newMember.workspaces.push({
      workspaceId: workspace._id.toString(),
      role: role as any
    });
    await newMember.save();

    res.status(201).json({
      id: newMember._id.toString(),
      name: newMember.name || '',
      email: newMember.email || '',
      avatarUrl: newMember.avatarUrl || '',
      role: role as 'ADMIN' | 'MEMBER',
      joinedAt: new Date()
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Add member error:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
};

// Remove member from workspace
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id, userId } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Check if requester is owner or admin
    const isOwner = workspace.ownerId.toString() === req.user!.id;
    const requesterMember = workspace.members?.find((m: any) => m.userId.toString() === req.user!.id);
    const isAdmin = requesterMember?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Only workspace owners and admins can remove members');
    }

    // Cannot remove the owner
    if (userId === workspace.ownerId.toString()) {
      throw new ApiError(400, 'Cannot remove the workspace owner');
    }

    // Remove from workspace members array
    if (workspace.members) {
      workspace.members = workspace.members.filter((m: any) => m.userId.toString() !== userId);
      await workspace.save();
    }

    // Remove workspace from user's workspaces
    const user = await User.findById(userId);
    if (user) {
      user.workspaces = user.workspaces.filter(w => w.workspaceId.toString() !== id);
      await user.save();
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Remove member error:', error);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  }
};

// Update workspace (owner only)
export const updateWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, 'Workspace name is required');
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Only owner can update workspace
    if (workspace.ownerId.toString() !== req.user.id) {
      throw new ApiError(403, 'Only workspace owner can update workspace');
    }

    workspace.name = name;
    await workspace.save();

    res.json({
      id: workspace._id.toString(),
      name: workspace.name,
      type: workspace.type
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update workspace error:', error);
      res.status(500).json({ error: 'Failed to update workspace' });
    }
  }
};

// Delete workspace (owner only)
export const deleteWorkspace = async (req: Request, res: Response): Promise<void> => {
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
    if (workspace.ownerId.toString() !== req.user.id) {
      throw new ApiError(403, 'Only workspace owners can delete workspaces');
    }

    // Delete all tasks in this workspace
    await Task.deleteMany({ workspaceId: id });

    // Remove workspace from all members' workspace arrays
    const memberUserIds = workspace.members?.map((m: any) => m.userId) || [];
    await User.updateMany(
      { _id: { $in: [...memberUserIds, workspace.ownerId] } },
      { $pull: { workspaces: { workspaceId: id } } }
    );

    // Delete the workspace
    await Workspace.findByIdAndDelete(id);

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete workspace error:', error);
      res.status(500).json({ error: 'Failed to delete workspace' });
    }
  }
};