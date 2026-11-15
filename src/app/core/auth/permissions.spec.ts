import { can, permissionsFor } from './permissions';
import { ROLES } from '../models';

describe('permissions', () => {
  it('denies everything when role is null', () => {
    expect(can(null, 'project:read')).toBe(false);
  });

  it('grants per the matrix', () => {
    expect(can('viewer', 'project:read')).toBe(true);
    expect(can('viewer', 'issue:create')).toBe(false);
    expect(can('manager', 'issue:create')).toBe(true);
    expect(can('manager', 'user:manage')).toBe(false);
    expect(can('admin', 'user:manage')).toBe(true);
  });

  it('roles are strictly nested supersets', () => {
    const [viewer, manager, admin] = ROLES.map((r) => new Set(permissionsFor(r)));
    expect([...viewer].every((p) => manager.has(p))).toBe(true);
    expect([...manager].every((p) => admin.has(p))).toBe(true);
  });
});
