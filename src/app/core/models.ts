export type Role = 'viewer' | 'manager' | 'admin';
export const ROLES: Role[] = ['viewer', 'manager', 'admin'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  openIssues: number;
  createdAt: string;
}

export type IssueStatus = 'open' | 'in_progress' | 'done';
export const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'done'];

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  status: IssueStatus;
  createdAt: string;
}

export interface Session {
  token: string;
  user: User;
}
