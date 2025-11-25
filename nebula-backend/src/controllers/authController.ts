import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import { generateToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { RegisterRequest, LoginRequest, AuthResponse, WorkspaceType } from '../types/index.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as RegisterRequest;

    // Validation
    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      streak: 0,
      lastTaskDate: null,
      workspaces: []
    });

    await user.save();

    // Create default personal workspace
    const personalWorkspace = new Workspace({
      name: 'Personal',
      type: WorkspaceType.PERSONAL,
      ownerId: user._id
    });

    await personalWorkspace.save();

    // Associate workspace with user
    user.workspaces.push({
      workspaceId: personalWorkspace._id.toString(),
      role: 'OWNER'
    });
    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email
    });

    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        streak: user.streak,
        lastTaskDate: user.lastTaskDate ? user.lastTaskDate.getTime() : null
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email
    });

    const response: AuthResponse = {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        streak: user.streak,
        lastTaskDate: user.lastTaskDate ? user.lastTaskDate.getTime() : null
      }
    };

    res.json(response);
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      streak: user.streak,
      lastTaskDate: user.lastTaskDate ? user.lastTaskDate.getTime() : null
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      throw new ApiError(400, 'Name is required');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.name = name.trim();
    await user.save();

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      streak: user.streak,
      lastTaskDate: user.lastTaskDate ? user.lastTaskDate.getTime() : null
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete all workspaces owned by the user
    await Workspace.deleteMany({ ownerId: user._id });

    // Remove user from workspaces they're a member of
    await Workspace.updateMany(
      { 'members.userId': user._id.toString() },
      { $pull: { members: { userId: user._id.toString() } } }
    );

    // Delete all tasks in user's workspaces
    const Task = (await import('../models/Task.js')).default;
    const userWorkspaceIds = user.workspaces.map(w => w.workspaceId);
    await Task.deleteMany({ workspaceId: { $in: userWorkspaceIds } });

    // Delete the user
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
};

