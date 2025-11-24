
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Task, TaskStatus, User, ViewMode, Workspace, WorkspaceType, Block } from '../types';
import { authAPI, taskAPI, workspaceAPI } from '../services/api';

interface StoreState {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  tasks: Task[];
  viewMode: ViewMode;
  isAuthenticated: boolean;
  isLoading: boolean;
  showCommandPalette: boolean;
}

interface StoreActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, type: WorkspaceType) => Promise<void>;
  addTask: (title: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  setShowCommandPalette: (show: boolean) => void;
  incrementStreak: () => void;
  refreshUser: () => Promise<void>;
  isListening: boolean;
  transcript: string;
  toggleMic: () => void;
}

const StoreContext = createContext<(StoreState & StoreActions) | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OVERVIEW);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Voice Command Logic
  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
        setIsListening(false);
        setTranscript('');
    } else {
        setIsListening(true); 
        setTranscript("Listening...");
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          
          // Process the command
          const lowerTranscript = transcript.toLowerCase();
          if (lowerTranscript.includes('create task') || lowerTranscript.includes('add task') || lowerTranscript.includes('new task')) {
            const taskName = transcript.replace(/create task|add task|new task/i, '').trim() || 'New Task';
            addTask(taskName);
          } else {
            addTask(transcript);
          }
          
          setTimeout(() => {
            setIsListening(false);
            setTranscript('');
          }, 1500);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setTranscript(`Error: ${event.error}`);
          setTimeout(() => {
            setIsListening(false);
            setTranscript('');
          }, 2000);
        };
        
        recognition.onend = () => {
          if (isListening) {
            setIsListening(false);
          }
        };
        
        recognition.start();
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nebula_token');
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data);
          await loadWorkspaces();
        } catch (error) {
          console.error('Session expired:', error);
          localStorage.removeItem('nebula_token');
          localStorage.removeItem('nebula_user');
        }
      }
    };
    initAuth();
  }, []);

  // Load workspaces when user changes
  const loadWorkspaces = async () => {
    try {
      const { data } = await workspaceAPI.getWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]); // Default to first workspace
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  // Load tasks when workspace changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentWorkspace) {
        setTasks([]);
        return;
      }
      
      try {
        const { data } = await taskAPI.getTasks(currentWorkspace.id);
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
      }
    };

    loadTasks();
  }, [currentWorkspace?.id]);

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, password });
      localStorage.setItem('nebula_token', data.token);
      localStorage.setItem('nebula_user', JSON.stringify(data.user));
      setUser(data.user);
      await loadWorkspaces();
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('nebula_token', data.token);
      localStorage.setItem('nebula_user', JSON.stringify(data.user));
      setUser(data.user);
      await loadWorkspaces();
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    setTasks([]);
    localStorage.removeItem('nebula_token');
    localStorage.removeItem('nebula_user');
    localStorage.removeItem('nebula_current_workspace');
  };

  const setToken = async (token: string) => {
    try {
      localStorage.setItem('nebula_token', token);
      const { data } = await authAPI.getMe();
      setUser(data);
      await loadWorkspaces();
    } catch (error: any) {
      console.error('Failed to set token:', error);
      localStorage.removeItem('nebula_token');
      throw new Error('Failed to authenticate with token');
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('nebula_current_workspace', workspaceId);
      setViewMode(ViewMode.OVERVIEW);
    }
  };

  const createWorkspace = async (name: string, type: WorkspaceType) => {
    try {
      const { data } = await workspaceAPI.createWorkspace({ name, type });
      setWorkspaces([...workspaces, data]);
      setCurrentWorkspace(data);
      localStorage.setItem('nebula_current_workspace', data.id);
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      throw new Error(error.response?.data?.error || 'Failed to create workspace');
    }
  };

  const addTask = async (title: string) => {
    if (!currentWorkspace) return;
    
    try {
      const { data } = await taskAPI.createTask({
        workspaceId: currentWorkspace.id,
        title,
        contentBlocks: [{ id: `b-${Date.now()}`, type: 'paragraph' as const, content: '' }],
        tags: ['New'],
      });
      setTasks(prev => [data, ...prev]);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data } = await taskAPI.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? data : t));
      
      // Refresh user to get updated streak
      if (updates.status === TaskStatus.DONE) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data);
      localStorage.setItem('nebula_user', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const incrementStreak = () => {
    // Streak is now handled by backend, just refresh user data
    refreshUser();
  };

  const value = {
    user,
    workspaces,
    currentWorkspace,
    tasks,
    viewMode,
    isAuthenticated: !!user,
    isLoading,
    showCommandPalette,
    setShowCommandPalette,
    login,
    register,
    logout,
    setToken,
    switchWorkspace,
    addTask,
    updateTask,
    deleteTask,
    createWorkspace,
    setViewMode,
    moveTask,
    incrementStreak,
    refreshUser,
    isListening,
    transcript,
    toggleMic
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
