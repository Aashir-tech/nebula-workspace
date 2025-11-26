import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  workspaceId?: string;
}

export class WebSocketService {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authenticate socket connections
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId}`);

      // Join workspace room
      socket.on('join-workspace', (workspaceId: string) => {
        socket.workspaceId = workspaceId;
        socket.join(`workspace:${workspaceId}`);
        console.log(`User ${socket.userId} joined workspace ${workspaceId}`);
        
        // Notify others in workspace
        socket.to(`workspace:${workspaceId}`).emit('user-joined', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      // Leave workspace room
      socket.on('leave-workspace', (workspaceId: string) => {
        socket.leave(`workspace:${workspaceId}`);
        console.log(`User ${socket.userId} left workspace ${workspaceId}`);
        
        socket.to(`workspace:${workspaceId}`).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        
        if (socket.workspaceId) {
          this.io.to(`workspace:${socket.workspaceId}`).emit('user-left', {
            userId: socket.userId,
            timestamp: new Date()
          });
        }
      });
    });
  }

  // Broadcast task created
  public taskCreated(workspaceId: string, task: any) {
    this.io.to(`workspace:${workspaceId}`).emit('task-created', task);
  }

  // Broadcast task updated
  public taskUpdated(workspaceId: string, task: any) {
    this.io.to(`workspace:${workspaceId}`).emit('task-updated', task);
  }

  // Broadcast task deleted
  public taskDeleted(workspaceId: string, taskId: string) {
    this.io.to(`workspace:${workspaceId}`).emit('task-deleted', { id: taskId });
  }

  // Broadcast member added
  public memberAdded(workspaceId: string, member: any) {
    this.io.to(`workspace:${workspaceId}`).emit('member-added', member);
  }

  // Broadcast member removed
  public memberRemoved(workspaceId: string, userId: string) {
    this.io.to(`workspace:${workspaceId}`).emit('member-removed', { userId });
  }

  // Get Socket.IO instance
  public getIO(): SocketIOServer {
    return this.io;
  }
}

let wsService: WebSocketService | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketService => {
  wsService = new WebSocketService(httpServer);
  return wsService;
};

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    throw new Error('WebSocket service not initialized');
  }
  return wsService;
};
