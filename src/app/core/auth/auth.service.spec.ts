import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('stores the user and token on login and exposes role/permissions', () => {
    auth.login('manager@example.com', 'password').subscribe();
    http.expectOne('/api/auth/login').flush({
      token: 'tok_1',
      user: { id: 'u2', name: 'Maya', email: 'manager@example.com', role: 'manager' },
    });
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.role()).toBe('manager');
    expect(auth.can('issue:create')).toBe(true);
    expect(auth.can('user:manage')).toBe(false);
    expect(localStorage.getItem('ng_enterprise_token')).toBe('tok_1');
  });

  it('clears state on logout', () => {
    auth.login('admin@example.com', 'password').subscribe();
    http.expectOne('/api/auth/login').flush({ token: 't', user: { id: 'u1', name: 'A', email: 'a', role: 'admin' } });
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('ng_enterprise_token')).toBeNull();
  });
});
