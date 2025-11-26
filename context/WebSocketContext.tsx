import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Task } from '../types';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: (workspaceId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  joinWorkspace: () => {},
  leaveWorkspace: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const currentWorkspaceRef = useRef<string | null>(null);

  useEffect(() => {
    const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8299';
    const token = localStorage.getItem('nebula_token');

    if (!token) return;

    // Initialize socket connection
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (currentWorkspaceRef.current) {
        newSocket.emit('leave-workspace', currentWorkspaceRef.current);
      }
      newSocket.disconnect();
    };
  }, []);

  const joinWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      // Leave previous workspace if any
      if (currentWorkspaceRef.current) {
        socket.emit('leave-workspace', currentWorkspaceRef.current);
      }
      
      // Join new workspace
      socket.emit('join-workspace', workspaceId);
      currentWorkspaceRef.current = workspaceId;
      console.log(`📁 Joined workspace: ${workspaceId}`);
    }
  };

  const leaveWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-workspace', workspaceId);
      currentWorkspaceRef.current = null;
      console.log(`📁 Left workspace: ${workspaceId}`);
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, joinWorkspace, leaveWorkspace }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook for real-time task updates
export const useRealTimeTasks = (
  workspaceId: string | null,
  onTaskCreated: (task: Task) => void,
  onTaskUpdated: (task: Task) => void,
  onTaskDeleted: (taskId: string) => void
) => {
  const { socket, isConnected, joinWorkspace, leaveWorkspace } = useWebSocket();

  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) return;

    // Join workspace room
    joinWorkspace(workspaceId);

    // Listen for task events
    socket.on('task-added', onTaskCreated);
    socket.on('task-updated', onTaskUpdated);
    socket.on('task-removed', onTaskDeleted);

    return () => {
      socket.off('task-added', onTaskCreated);
      socket.off('task-updated', onTaskUpdated);
      socket.off('task-removed', onTaskDeleted);
      leaveWorkspace(workspaceId);
    };
  }, [socket, isConnected, workspaceId]);

  return { isConnected };
};

// Hook for real-time member updates
export const useRealTimeMembers = (
  workspaceId: string | null,
  onMemberAdded: (member: any) => void,
  onMemberRemoved: (userId: string) => void,
  onUserJoined: (userId: string) => void,
  onUserLeft: (userId: string) => void
) => {
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) return;

    // Listen for member events
    socket.on('member-added', onMemberAdded);
    socket.on('member-removed', (data: { userId: string }) => onMemberRemoved(data.userId));
    socket.on('user-joined', (data: { userId: string }) => onUserJoined(data.userId));
    socket.on('user-left', (data: { userId: string }) => onUserLeft(data.userId));

    return () => {
      socket.off('member-added', onMemberAdded);
      socket.off('member-removed');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, isConnected, workspaceId]);

  return { isConnected };
};

export default WebSocketContext;
