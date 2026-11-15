import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { mockBackendInterceptor } from './mock/mock-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // Order matters: auth adds the token, error normalizes failures, then the
    // mock backend answers. In production, drop the mock and point at a real API.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, mockBackendInterceptor])),
  ],
};
