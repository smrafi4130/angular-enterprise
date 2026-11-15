import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/projects/projects.component').then((m) => m.ProjectsComponent),
      },
      {
        path: 'projects/:id',
        canActivate: [permissionGuard('issue:read')],
        loadComponent: () => import('./features/issues/issues.component').then((m) => m.IssuesComponent),
      },
      {
        path: 'forbidden',
        loadComponent: () => import('./features/forbidden.component').then((m) => m.ForbiddenComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
