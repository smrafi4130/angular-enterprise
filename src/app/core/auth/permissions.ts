import { Role } from '../models';

/**
 * Authorization is expressed as permissions; roles are bundles of them. UI and
 * guards ask `can(role, 'issue:update')`, never `role === 'admin'`, so changing
 * what a role may do is a one-line change here.
 */
const PERMISSIONS = {
  'project:read': ['viewer', 'manager', 'admin'],
  'project:create': ['manager', 'admin'],
  'issue:read': ['viewer', 'manager', 'admin'],
  'issue:create': ['manager', 'admin'],
  'issue:update': ['manager', 'admin'],
  'user:manage': ['admin'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function permissionsFor(role: Role): Permission[] {
  return (Object.keys(PERMISSIONS) as Permission[]).filter((p) => can(role, p));
}
