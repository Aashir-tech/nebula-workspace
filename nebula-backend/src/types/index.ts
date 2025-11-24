export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum WorkspaceType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM'
}

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  streak: number;
  lastTaskDate: Date | null;
  workspaces: {
    workspaceId: string;
    role: 'OWNER' | 'MEMBER';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspace {
  _id: string;
  name: string;
  type: WorkspaceType;
  ownerId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  workspaceId: string;
  title: string;
  contentBlocks: Block[];
  status: TaskStatus;
  tags: string[];
  assigneeId?: string;
  aiEnhanced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateTaskRequest {
  workspaceId: string;
  title: string;
  contentBlocks?: Block[];
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  contentBlocks?: Block[];
  status?: TaskStatus;
  tags?: string[];
  aiEnhanced?: boolean;
}

export interface AIEnhanceRequest {
  text: string;
  type: 'PROFESSIONAL' | 'BREAK_DOWN' | 'SUMMARIZE';
}

// Response types
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    streak: number;
    lastTaskDate: number | null;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}
