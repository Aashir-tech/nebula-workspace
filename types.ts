
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum ViewMode {
  HOME = "HOME",
  OVERVIEW = 'OVERVIEW',
  LIST = 'LIST',
  BOARD = 'BOARD',
  GRID = 'GRID',
  LEADERBOARD = 'LEADERBOARD',
  INBOX = 'INBOX',
  TODAY = 'TODAY',
  FILTERS = 'FILTERS',
  CALENDAR = 'CALENDAR'
}

export enum WorkspaceType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM'
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: number;
}

export interface Invitation {
  id: string;
  workspace: {
    id: string;
    name: string;
    type: WorkspaceType;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  role: 'ADMIN' | 'MEMBER';
  createdAt: number;
  expiresAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  streak: number;
  lastTaskDate: number | null;
}

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet' | 'todo';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // For todo blocks
}

export interface Task {
  id: string;
  workspaceId: string; // Added for dual-engine auth
  title: string;
  // Deprecating simple string description for Block content
  description?: string; 
  contentBlocks: Block[]; // New Notion-style content
  status: TaskStatus;
  tags: string[];
  assigneeId?: string;
  aiEnhanced?: boolean;
  dueDate?: string;
  createdAt: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  score: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export interface AIInsight {
  type: 'VELOCITY' | 'PULSE' | 'BURNOUT';
  title: string;
  content: string;
  score?: number;
}
