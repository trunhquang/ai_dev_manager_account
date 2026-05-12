import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'developer';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt?: Timestamp;
}

export type AIAccountStatus = 'active' | 'cooldown' | 'banned';

export interface AIAccount {
  id: string;
  email: string;
  provider: string;
  packageType: string;
  dailyTokenLimit: number;
  currentTokenLeft: number;
  status: AIAccountStatus;
  note?: string;
  lastUsedAt?: Timestamp;
  createdAt: Timestamp;
}

export type ProjectType = 'backend' | 'frontend' | 'mobile' | 'fullstack';
export type ProjectPriority = 'low' | 'medium' | 'high';
export type ProjectStatus = 'active' | 'on_hold' | 'completed';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  repositoryUrl?: string;
  currentAccountId?: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  createdAt: Timestamp;
}

export interface ProjectTransfer {
  id: string;
  projectId: string;
  fromAccountId: string;
  toAccountId: string;
  transferredAt: Timestamp;
  reason?: string;
}

export interface DevSession {
  id: string;
  projectId: string;
  accountId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  estimatedTokensUsed: number;
  completedTasks: string[];
  pendingTasks: string[];
}

export interface ProjectHandoff {
  id: string;
  projectId: string;
  architectureSummary: string;
  completedTasks: string;
  pendingTasks: string;
  codingConventions: string;
  importantPrompts: string;
  bugFixNotes: string;
  updatedAt: Timestamp;
}
