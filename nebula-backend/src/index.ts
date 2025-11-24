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

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 8299;

// ============================================
// CORS Configuration - FIXED
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nebula-workspace.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: true, credentials: true }));

// Handle preflight requests
app.options('*', cors({ origin: true, credentials: true }));

// ============================================
// Middleware
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure trailing slashes don't cause issues
app.use((req, res, next) => {
  if (req.path.includes('//')) {
    const cleanPath = req.path.replace(/\/+/g, '/');
    return res.redirect(301, cleanPath);
  }
  next();
});

// ============================================
// Health Check
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Nebula Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// Socket.IO Setup
// ============================================
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins as string[],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('join-workspace', (workspaceId: string) => {
    socket.join(`workspace-${workspaceId}`);
    console.log(`📁 Socket ${socket.id} joined workspace-${workspaceId}`);
  });

  socket.on('leave-workspace', (workspaceId: string) => {
    socket.leave(`workspace-${workspaceId}`);
    console.log(`📁 Socket ${socket.id} left workspace-${workspaceId}`);
  });

  socket.on('block-update', (data: { workspaceId: string; taskId: string; blocks: any[] }) => {
    socket.to(`workspace-${data.workspaceId}`).emit('block-updated', {
      taskId: data.taskId,
      blocks: data.blocks
    });
  });

  socket.on('task-created', (data: { workspaceId: string; task: any }) => {
    socket.to(`workspace-${data.workspaceId}`).emit('task-added', data.task);
  });

  socket.on('task-deleted', (data: { workspaceId: string; taskId: string }) => {
    socket.to(`workspace-${data.workspaceId}`).emit('task-removed', data.taskId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ============================================
// Start Server
// ============================================
const startServer = async () => {
  try {
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
      console.log(`   GET    /api/leaderboard`);
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// Export for Vercel
// ============================================
export default app;

// Connect to DB immediately for Vercel serverless
if (process.env.VERCEL) {
  connectDB().catch(err => console.error('DB connection error:', err));
}

// Only start server locally (not on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  startServer();
}

export { io };