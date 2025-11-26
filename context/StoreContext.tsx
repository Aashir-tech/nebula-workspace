import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Task, TaskStatus, User, ViewMode, Workspace, WorkspaceType, Block, Invitation } from '../types';
import { authAPI, taskAPI, workspaceAPI, invitationAPI } from '../services/api';
import { useRealTimeTasks } from './WebSocketContext';

interface StoreState {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  tasks: Task[];
  viewMode: ViewMode;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  showCommandPalette: boolean;
  invitations: Invitation[];
  showNotifications: boolean;
  filterTag: string | null;
}

interface StoreActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, type: WorkspaceType) => Promise<void>;
  updateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
  addTask: (
    title: string, 
    priority?: string | null, 
    dueDate?: Date | null,
    labels?: string[],
    subtasks?: any[],
    workspaceId?: string,
    reminder?: Date | null,
    customReminderDate?: Date | null
  ) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  duplicateTask: (taskId: string) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  setShowCommandPalette: (show: boolean) => void;
  incrementStreak: () => void;
  refreshUser: () => Promise<void>;
  isListening: boolean;
  transcript: string;
  toggleMic: () => void;
  createInvitation: (workspaceId: string, email: string, role?: 'MEMBER' | 'ADMIN') => Promise<void>;
  loadInvitations: () => Promise<void>;
  acceptInvitation: (id: string) => Promise<void>;
  rejectInvitation: (id: string) => Promise<void>;
  loadWorkspaces: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  deleteUser: () => Promise<void>;
}

const StoreContext = createContext<(StoreState & StoreActions) | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.INBOX);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

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

  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nebula_token');
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data);
          // loadWorkspaces will be triggered by useEffect [user]
        } catch (error) {
          console.error('Session expired:', error);
          localStorage.removeItem('nebula_token');
          localStorage.removeItem('nebula_user');
        }
      }
      // Mark initialization complete
      setIsInitializing(false);
    };
    initAuth();
  }, []);

  // Load workspaces when user changes
  const loadWorkspaces = async () => {
    try {
      console.log('StoreContext: Loading workspaces...');
      const { data } = await workspaceAPI.getAll();
      console.log('StoreContext: Loaded workspaces:', data);
      setWorkspaces(data);
      if (data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]); // Default to first workspace
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  // Load tasks for current workspace
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

  // Reload tasks when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      console.log('Workspace changed, loading tasks for:', currentWorkspace.id);
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  // Real-time WebSocket updates
  useRealTimeTasks(
    currentWorkspace?.id || null,
    // On task created by another user
    (task: Task) => {
      console.log('Real-time: Task created', task);
      setTasks(prev => {
        // Only add if not already in list
        if (prev.some(t => t.id === task.id)) return prev;
        return [task, ...prev];
      });
    },
    // On task updated by another user
    (task: Task) => {
      console.log('Real-time: Task updated', task);
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    },
    // On task deleted by another user
    (taskId: string) => {
      console.log('Real-time: Task deleted', taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  );

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
      const { data } = await workspaceAPI.create({ name, type });
      setWorkspaces(prev => [...prev, data]);
      setCurrentWorkspace(data);
    } catch (error: any) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId: string, name: string) => {
    try {
      const { data } = await workspaceAPI.update(workspaceId, { name });
      
      // Update in workspaces list
      setWorkspaces(prev => prev.map(w => 
        w.id === workspaceId ? { ...w, name: data.name } : w
      ));
      
      // Update current workspace if it's the one being edited
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(prev => prev ? { ...prev, name: data.name } : null);
      }
    } catch (error: any) {
      console.error('Failed to update workspace:', error);
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await workspaceAPI.deleteWorkspace(workspaceId);
      
      // Remove from local state
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      
      // If we deleted the current workspace, switch to another one
      if (currentWorkspace?.id === workspaceId) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        if (remainingWorkspaces.length > 0) {
          switchWorkspace(remainingWorkspaces[0].id);
        } else {
          setCurrentWorkspace(null);
        }
      }
      
      // Remove tasks from deleted workspace
      setTasks(prev => prev.filter(t => t.workspaceId !== workspaceId));
      
      console.log('Workspace deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  };

  const leaveWorkspace = async (workspaceId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      await workspaceAPI.leaveWorkspace(workspaceId);
      
      // Remove from local state
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      
      // If we left the current workspace, switch to another one
      if (currentWorkspace?.id === workspaceId) {
        const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        if (remainingWorkspaces.length > 0) {
          switchWorkspace(remainingWorkspaces[0].id);
        } else {
          setCurrentWorkspace(null);
        }
      }
      
      // Remove tasks from left workspace
      setTasks(prev => prev.filter(t => t.workspaceId !== workspaceId));
      
      console.log('Left workspace successfully');
    } catch (error: any) {
      console.error('Failed to leave workspace:', error);
      throw error;
    }
  };

  const addTask = async (
    title: string, 
    priority?: string | null, 
    dueDate?: Date | null,
    labels?: string[],
    subtasks?: any[],
    workspaceId?: string,
    reminder?: Date | null,
    customReminderDate?: Date | null
  ) => {
    try {
      // Use provided workspaceId or fall back to currentWorkspace
      const targetWorkspaceId = workspaceId || currentWorkspace?.id;
      
      if (!targetWorkspaceId) {
        console.error('No workspace selected');
        return;
      }

      const newTaskData = {
        workspaceId: targetWorkspaceId,
        title: title.trim(),
        priority: priority || null,
        dueDate: dueDate || null,
        labels: labels || [],
        subtasks: subtasks || [],
        reminder: reminder || customReminderDate || null,
        contentBlocks: [
          {
            id: `b-${Date.now()}`,
            type: 'paragraph' as const,
            content: ''
          }
        ],
        tags: []
      };

      console.log('Creating task with data:', newTaskData);
      const { data } = await taskAPI.createTask(newTaskData);
      console.log('Task created:', data);
      
      setTasks(prev => [data, ...prev]);
    } catch (error: any) {
      console.error('Failed to add task:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  // Play completion sound
  const playCompletionSound = () => {
    try {
      const audio = new Audio('/sounds/completion.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('Updating task:', taskId, 'with:', updates);
      const { data } = await taskAPI.updateTask(taskId, updates);
      console.log('Task update response:', data);
      
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? { ...t, ...data } : t)
      );
      
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
    // Play sound when marking as done
    if (newStatus === TaskStatus.DONE) {
      playCompletionSound();
    }
    await updateTask(taskId, { status: newStatus });
  };

  const duplicateTask = async (taskId: string) => {
    if (!currentWorkspace) return;
    
    try {
      const originalTask = tasks.find(t => t.id === taskId);
      if (!originalTask) return;
      
      const { data } = await taskAPI.createTask({
        workspaceId: currentWorkspace.id,
        title: `${originalTask.title} (Copy)`,
        contentBlocks: originalTask.contentBlocks || [{ id: `b-${Date.now()}`, type: 'paragraph' as const, content: '' }],
        tags: originalTask.tags || [],
        status: originalTask.status,
        priority: originalTask.priority,
      });
      setTasks(prev => [data, ...prev]);
    } catch (error) {
      console.error('Failed to duplicate task:', error);
      throw error;
    }
  };

  const archiveTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: TaskStatus.DONE });
      // Optionally: add an 'archived' tag or move to separate archive list
    } catch (error) {
      console.error('Failed to archive task:', error);
      throw error;
    }
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

  // Invitation methods
  const loadInvitations = async () => {
    try {
      const { data } = await invitationAPI.getMyInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setInvitations([]);
    }
  };

  const createInvitation = async (workspaceId: string, email: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER') => {
    try {
      console.log('Creating invitation:', { workspaceId, email, role });
      await invitationAPI.create({ workspaceId, inviteeEmail: email, role });
    } catch (error: any) {
      console.error('Failed to create invitation:', error);
      throw error;
    }
  };

  const acceptInvitation = async (id: string) => {
    try {
      const response = await invitationAPI.accept(id);
      // Reload workspaces and invitations
      await loadWorkspaces();
      await loadInvitations();
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  };

  const rejectInvitation = async (id: string) => {
    try {
      await invitationAPI.reject(id);
      await loadInvitations();
    } catch (error: any) {
      console.error('Failed to reject invitation:', error);
      throw error;
    }
  };

  // Load invitations when user is authenticated
  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const updateUserProfile = async (name: string) => {
    try {
      const { data } = await authAPI.updateProfile({ name });
      setUser(data);
      localStorage.setItem('nebula_user', JSON.stringify(data));
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const deleteUser = async () => {
    try {
      await authAPI.deleteAccount();
      logout();
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  const value = {
    user,
    workspaces,
    currentWorkspace,
    tasks,
    viewMode,
    isAuthenticated: !!user,
    isLoading,
    isInitializing,
    showCommandPalette,
    invitations,
    showNotifications,
    setShowNotifications,
    filterTag,
    setFilterTag,
    login,
    register,
    logout,
    setToken,
    switchWorkspace,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    archiveTask,
    moveTask,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    leaveWorkspace,
    setViewMode,
    incrementStreak,
    refreshUser,
    isListening,
    transcript,
    toggleMic,
    createInvitation,
    loadInvitations,
    acceptInvitation,
    rejectInvitation,
    loadWorkspaces,
    updateUserProfile,
    deleteUser,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
