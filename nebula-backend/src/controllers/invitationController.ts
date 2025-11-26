import { Request, Response } from 'express';
import Invitation from '../models/Invitation.js';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorHandler.js';

// Create a new invitation
export const createInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { workspaceId, inviteeEmail, role } = req.body;

    if (!workspaceId || !inviteeEmail) {
      throw new ApiError(400, 'Workspace ID and invitee email are required');
    }

    // Default to MEMBER role if not specified
    const invitationRole = role || 'MEMBER';

    console.log('Creating invitation:', { workspaceId, inviteeEmail, role: invitationRole, userId: req.user.id });

    // Verify workspace exists and user has permission
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    console.log('Workspace found:', { id: workspace._id, ownerId: workspace.ownerId });

    // Check if user is owner or admin
    const isOwner = workspace.ownerId.toString() === req.user!.id;
    const userMember = workspace.members?.find(
      (m: any) => m.userId.toString() === req.user!.id
    );
    const isAdmin = userMember?.role === 'ADMIN';

    console.log('Permission check:', { isOwner, isAdmin, hasMembersArray: !!workspace.members });

    // Allow if user is owner, OR if workspace has no members yet (personal workspace)
    if (!isOwner && !isAdmin && workspace.members && workspace.members.length > 0) {
      throw new ApiError(403, 'Only workspace owners and admins can invite users');
    }

    // Check if invitee exists on platform
    const invitedUser = await User.findOne({ email: inviteeEmail.toLowerCase() });
    if (!invitedUser) {
      throw new ApiError(404, 'User has not joined the platform yet. Please ask them to sign up first.');
    }

    // Check if user is already invited
    const existingInvitation = await Invitation.findOne({
      workspaceId,
      inviteeEmail: inviteeEmail.toLowerCase(),
      status: 'pending'
    });

    if (existingInvitation) {
      throw new ApiError(409, 'User already has a pending invitation');
    }

    // Check if user is already a member
    const isMember = invitedUser.workspaces?.some(
      w => w.workspaceId === workspaceId
    );
    if (isMember) {
      throw new ApiError(409, 'User is already a member of this workspace');
    }

    // Create invitation
    const invitation = new Invitation({
      workspaceId,
      invitedBy: req.user.id,
      inviteeEmail: inviteeEmail.toLowerCase(),
      role: invitationRole,
      status: 'pending'
    });

    await invitation.save();

    console.log('Invitation created successfully:', invitation._id);

    res.status(201).json({
      id: invitation._id.toString(),
      workspaceId: invitation.workspaceId,
      inviteeEmail: invitation.inviteeEmail,
      role: invitation.role,
      status: invitation.status,
      createdAt: invitation.createdAt
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message);
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create invitation error:', error);
      res.status(500).json({ error: error.message || 'Failed to create invitation' });
    }
  }
};

// Get my pending invitations
export const getMyInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const invitations = await Invitation.find({
      inviteeEmail: user.email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    // Populate workspace details
    const populatedInvitations = await Promise.all(
      invitations.map(async (inv) => {
        const workspace = await Workspace.findById(inv.workspaceId);
        const inviter = await User.findById(inv.invitedBy);
        
        return {
          id: inv._id.toString(),
          workspace: workspace ? {
            id: workspace._id.toString(),
            name: workspace.name,
            type: workspace.type
          } : null,
          invitedBy: inviter ? {
            id: inviter._id.toString(),
            name: inviter.name,
            email: inviter.email
          } : null,
          role: inv.role,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt
        };
      })
    );

    res.json(populatedInvitations.filter(inv => inv.workspace !== null));
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get invitations error:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  }
};

// Accept invitation
export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found');
    }

    // Verify invitation is for current user
    const user = await User.findById(req.user.id);
    if (!user || user.email !== invitation.inviteeEmail) {
      throw new ApiError(403, 'This invitation is not for you');
    }

    // Check if invitation is still valid
    if (invitation.status !== 'pending') {
      throw new ApiError(400, 'Invitation is no longer pending');
    }

    if (invitation.expiresAt < new Date()) {
      throw new ApiError(400, 'Invitation has expired');
    }

    // Add user to workspace
    const workspace = await Workspace.findById(invitation.workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Add to workspace members
    if (!workspace.members) {
      workspace.members = [];
    }
    workspace?.members.push({
      userId: user._id as any,
      role: invitation.role as any,
      joinedAt: new Date()
    });
    await workspace.save();

    // Add workspace to user
    if (!user.workspaces) {
      user.workspaces = [];
    }
    user.workspaces.push({
      workspaceId: workspace._id.toString(),
      role: invitation.role as any
    });
    await user.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      message: 'Invitation accepted',
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        type: workspace.type,
        role: invitation.role
      }
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Accept invitation error:', error);
      res.status(500).json({ error: 'Failed to accept invitation' });
    }
  }
};

// Reject invitation
export const rejectInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation) {
      throw new ApiError(404, 'Invitation not found');
    }

    // Verify invitation is for current user
    const user = await User.findById(req.user.id);
    if (!user || user.email !== invitation.inviteeEmail) {
      throw new ApiError(403, 'This invitation is not for you');
    }

    if (invitation.status !== 'pending') {
      throw new ApiError(400, 'Invitation is no longer pending');
    }

    // Update invitation status
    invitation.status = 'rejected';
    await invitation.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Reject invitation error:', error);
      res.status(500).json({ error: 'Failed to reject invitation' });
    }
  }
};

// Get workspace invitations (admin only)
export const getWorkspaceInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    // Check if user is owner or admin
    const userMember = workspace.members?.find(
      (m: any) => m.userId.toString() === req.user!.id
    );
    const isOwner = workspace.ownerId.toString() === req.user!.id;
    const isAdmin = userMember?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'Only workspace owners and admins can view invitations');
    }

    const invitations = await Invitation.find({
      workspaceId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json(invitations.map(inv => ({
      id: inv._id.toString(),
      inviteeEmail: inv.inviteeEmail,
      role: inv.role,
      status: inv.status,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt
    })));
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get workspace invitations error:', error);
      res.status(500).json({ error: 'Failed to fetch workspace invitations' });
    }
  }
};
