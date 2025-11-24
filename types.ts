
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
  LEADERBOARD = 'LEADERBOARD'
}

export enum WorkspaceType {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM'
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
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
