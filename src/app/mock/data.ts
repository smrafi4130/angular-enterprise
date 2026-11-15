import { Issue, Project, Role, User } from '../core/models';

export interface MockUser extends User {
  password: string;
}

export function seed() {
  const users: MockUser[] = [
    { id: 'u1', name: 'Ada Admin', email: 'admin@example.com', role: 'admin', password: 'password' },
    { id: 'u2', name: 'Maya Manager', email: 'manager@example.com', role: 'manager', password: 'password' },
    { id: 'u3', name: 'Victor Viewer', email: 'viewer@example.com', role: 'viewer', password: 'password' },
  ];
  const projects: Project[] = [
    { id: 'p1', name: 'Checkout redesign', description: 'Reduce drop-off in the payment step.', openIssues: 0, createdAt: '2026-01-12T09:00:00Z' },
    { id: 'p2', name: 'Design system adoption', description: 'Migrate product surfaces to shared components.', openIssues: 0, createdAt: '2026-02-03T09:00:00Z' },
  ];
  const issues: Issue[] = [
    { id: 'i1', projectId: 'p1', title: 'Address form fails on paste', status: 'open', createdAt: '2026-01-14T10:00:00Z' },
    { id: 'i2', projectId: 'p1', title: 'Add Apple Pay', status: 'in_progress', createdAt: '2026-01-20T10:00:00Z' },
    { id: 'i3', projectId: 'p2', title: 'Replace legacy modal', status: 'done', createdAt: '2026-02-10T10:00:00Z' },
  ];
  return { users, projects, issues, roleByToken: new Map<string, Role>() };
}
