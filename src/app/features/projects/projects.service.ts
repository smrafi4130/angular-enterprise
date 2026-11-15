import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Project } from '../../core/models';

/**
 * Server-state as signals: the component reads `projects()`, `loading()` and
 * `error()`; the service owns fetching and keeps them in sync. Mutations refetch
 * so the open-issue counts stay correct.
 */
@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  readonly projects = signal<Project[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Project[]>('/api/projects').subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (e: { message: string }) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  create(name: string, description: string): Observable<Project> {
    return this.http.post<Project>('/api/projects', { name, description }).pipe(tap(() => this.load()));
  }
}
