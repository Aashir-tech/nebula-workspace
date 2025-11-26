import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

const router = express.Router();

// All comment routes require authentication
router.use(authenticateToken);

// Get comments for a task
router.get('/', async (req, res) => {
  try {
    const { taskId } = req.query;
    
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

    const comments = await Comment.find({ taskId })
      .sort({ createdAt: 1 })
      .lean();
    
    const formattedComments = comments.map(comment => ({
      id: comment._id.toString(),
      taskId: comment.taskId.toString(),
      userId: comment.userId.toString(),
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      createdAt: new Date(comment.createdAt).getTime(),
      updatedAt: new Date(comment.updatedAt).getTime()
    }));

    res.json(formattedComments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a comment
router.post('/', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { taskId, content } = req.body;

    if (!taskId || !content) {
      return res.status(400).json({ message: 'Task ID and content are required' });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = new Comment({
      taskId,
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: content.trim()
    });

    await comment.save();
    
    const formattedComment = {
      id: comment._id.toString(),
      taskId: comment.taskId.toString(),
      userId: comment.userId.toString(),
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      createdAt: comment.createdAt.getTime(),
      updatedAt: comment.updatedAt.getTime()
    };

    res.status(201).json(formattedComment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update a comment
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content } = req.body;

    const comment = await Comment.findOne({ _id: id, userId });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    comment.content = content.trim();
    await comment.save();
    
    const formattedComment = {
      id: comment._id.toString(),
      taskId: comment.taskId.toString(),
      userId: comment.userId.toString(),
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      createdAt: comment.createdAt.getTime(),
      updatedAt: comment.updatedAt.getTime()
    };

    res.json(formattedComment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const comment = await Comment.findOneAndDelete({ _id: id, userId });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
