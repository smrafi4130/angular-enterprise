import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Permission, can } from './permissions';
import { Session, User } from '../models';

const TOKEN_KEY = 'ng_enterprise_token';

/**
 * Session state as signals. The access token is kept in memory and mirrored to
 * localStorage only so a reload can restore the session (documented trade-off in
 * the README; a production app would use an httpOnly cookie).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(this.readToken());

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  can(permission: Permission): boolean {
    return can(this.role(), permission);
  }

  login(email: string, password: string): Observable<Session> {
    return this.http.post<Session>('/api/auth/login', { email, password }).pipe(
      tap((session) => {
        this._token.set(session.token);
        this._user.set(session.user);
        this.writeToken(session.token);
      }),
    );
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this.writeToken(null);
  }

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
  private writeToken(token: string | null): void {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  }
}
