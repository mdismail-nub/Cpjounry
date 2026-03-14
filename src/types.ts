export type Platform = 'Codeforces' | 'CodeChef' | 'Beecrowd' | 'AtCoder' | 'Toph';
export type ProgressStatus = 'solved' | 'attempted' | 'not_started';
export type UserRole = 'user' | 'admin';

export interface UserStats {
  totalSolved: number;
  currentStreak: number;
  lastSolvedDate?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  stats: UserStats;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Problem {
  id: string;
  title: string;
  platform: Platform;
  problem_link: string;
  difficulty: string;
  track_id: string;
  day_number: number;
  is_locked: boolean;
  tags: string[];
  lock_message?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  problemId: string;
  status: ProgressStatus;
  notes?: string;
  updatedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
