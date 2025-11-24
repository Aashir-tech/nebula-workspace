import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import workspaceRoutes from './routes/workspaces.js';
import aiRoutes from './routes/ai.js';
import leaderboardRoutes from './routes/leaderboard.js';
import googleAuthRoutes from './routes/googleAuth.js';

dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nebula-workspace.vercel.app',
    'https://nebula-workspace.vercel.app/',

  'https://nebula-workspace-backend.vercel.app',
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.io for real-time collaboration
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join workspace room
  socket.on('join-workspace', (workspaceId: string) => {
    socket.join(`workspace-${workspaceId}`);
    console.log(`📁 Socket ${socket.id} joined workspace-${workspaceId}`);
  });

  // Leave workspace room
  socket.on('leave-workspace', (workspaceId: string) => {
    socket.leave(`workspace-${workspaceId}`);
    console.log(`📁 Socket ${socket.id} left workspace-${workspaceId}`);
  });

  // Broadcast block updates to workspace members
  socket.on('block-update', (data: { workspaceId: string; taskId: string; blocks: any[] }) => {
    socket.to(`workspace-${data.workspaceId}`).emit('block-updated', {
      taskId: data.taskId,
      blocks: data.blocks
    });
  });

  // Broadcast task creation
  socket.on('task-created', (data: { workspaceId: string; task: any }) => {
    socket.to(`workspace-${data.workspaceId}`).emit('task-added', data.task);
  });

  // Broadcast task deletion
  socket.on('task-deleted', (data: { workspaceId: string; taskId: string }) => {
    socket.to(`workspace-${data.workspaceId}`).emit('task-removed', data.taskId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log('🚀 ================================');
      console.log(`🚀 Nebula Backend Server Running`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
      console.log('🚀 ================================');
      console.log('\n📡 WebSocket Server: Active');
      console.log('🔐 JWT Authentication: Enabled');
      console.log('🤖 AI Proxy: ' + (process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not Configured ⚠️'));
      console.log('\n🛣️  API Routes:');
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   GET    /api/tasks?workspaceId=xxx`);
      console.log(`   POST   /api/tasks`);
      console.log(`   PATCH  /api/tasks/:id`);
      console.log(`   DELETE /api/tasks/:id`);
      console.log(`   GET    /api/workspaces`);
      console.log(`   POST   /api/workspaces`);
      console.log(`   POST   /api/workspaces/join`);
      console.log(`   POST   /api/ai/enhance`);
      console.log(`   POST   /api/ai/insights`);
      console.log(`   POST   /api/ai/standup`);
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };
