import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface AppError {
  status: number;
  message: string;
}

/**
 * Normalizes HttpErrorResponse into a small AppError, and signs the user out on
 * a 401 so an expired session can't leave the UI in a half-authenticated state.
 */
export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.isAuthenticated()) {
        auth.logout();
        void router.navigate(['/login']);
      }
      const message =
        error.error?.message ??
        (error.status === 0 ? 'Network error. Check your connection.' : 'Something went wrong.');
      return throwError(() => ({ status: error.status, message }) as AppError);
    }),
  );
}
