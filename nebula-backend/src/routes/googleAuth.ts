import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import { generateToken } from '../middleware/auth.js';
import { WorkspaceType } from '../types/index.js';

const router = Router();

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow (serverless-compatible)
router.get('/google', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
  
  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(googleAuthUrl);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback (serverless-compatible)
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendURL}/login?error=no_code`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens: any = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser: any = await userInfoResponse.json();

    // Find or create user in database
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email,
        password: 'OAUTH_USER', // OAuth users don't have passwords
        avatarUrl: googleUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleUser.name || 'User')}&background=6366f1&color=fff`,
        streak: 0,
        lastTaskDate: null,
        workspaces: []
      });

      // Create default personal workspace for new user
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
    }

    // Generate JWT token with consistent payload structure
    const token = generateToken({
      id: user._id.toString(),
      email: user.email
    });

    // Redirect to frontend with token
    res.redirect(`${frontendURL}?token=${token}`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.redirect(`${frontendURL}/login?error=oauth_failed`);
  }
});

export default router;

