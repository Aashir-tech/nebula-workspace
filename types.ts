
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum ViewMode {
  INBOX = 'INBOX',
  TODAY = 'TODAY',
  UPCOMING = 'UPCOMING',
  FILTERS = 'FILTERS',
  CALENDAR = 'CALENDAR',
  COMPLETED = 'COMPLETED',
  WORKSPACE = 'WORKSPACE',
  LEADERBOARD = 'LEADERBOARD',
  OVERVIEW = 'OVERVIEW',
  BOARD = 'BOARD',
  LIST = 'LIST',
  GRID = 'GRID',
  HOME = 'HOME'
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

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
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
  labels?: string[]; // NEW: Labels/tags for categorization
  subtasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>; // NEW: Sub-tasks
  assigneeId?: string;
  assignedTo?: string | null; // User ID of assigned team member
  aiEnhanced?: boolean;
  dueDate?: string;
  priority?: 'P1' | 'P2' | 'P3' | 'P4' | null;
  archived?: boolean; // NEW: Archive status
  sectionId?: string; // NEW: Section assignment
  reminder?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface Section {
  id: string;
  workspaceId: string;
  title: string;
  order: number;
  createdAt: number;
}
