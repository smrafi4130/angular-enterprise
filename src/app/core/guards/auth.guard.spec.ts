import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { WritableSignal } from '@angular/core';
import { authGuard, permissionGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';
import type { User } from '../models';

describe('guards', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
  });

  const setUser = (user: User | null) =>
    (auth as unknown as { _user: WritableSignal<User | null> })._user.set(user);
  const call = (fn: () => unknown) => TestBed.runInInjectionContext(fn);

  it('authGuard redirects anonymous users to /login with returnUrl', () => {
    const result = call(() => authGuard({} as never, { url: '/projects/p1' } as never)) as UrlTree;
    expect(result instanceof UrlTree).toBe(true);
    expect(result.toString()).toContain('/login');
    expect(result.toString()).toContain('returnUrl');
  });

  it('authGuard allows an authenticated user', () => {
    setUser({ id: 'u2', name: 'Maya', email: 'm@e.com', role: 'manager' });
    expect(call(() => authGuard({} as never, { url: '/' } as never))).toBe(true);
  });

  it('permissionGuard sends users without the permission to /forbidden', () => {
    setUser({ id: 'u3', name: 'Vic', email: 'v@e.com', role: 'viewer' });
    const result = call(() => permissionGuard('issue:update')({} as never, {} as never)) as UrlTree;
    expect(result instanceof UrlTree).toBe(true);
    expect(result.toString()).toContain('/forbidden');
  });

  it('permissionGuard allows users with the permission', () => {
    setUser({ id: 'u2', name: 'Maya', email: 'm@e.com', role: 'manager' });
    expect(call(() => permissionGuard('issue:update')({} as never, {} as never))).toBe(true);
  });
});
