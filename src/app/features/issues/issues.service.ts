import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Issue, IssueStatus } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class IssuesService {
  private readonly http = inject(HttpClient);

  readonly issues = signal<Issue[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(projectId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Issue[]>(`/api/projects/${projectId}/issues`).subscribe({
      next: (issues) => {
        this.issues.set(issues);
        this.loading.set(false);
      },
      error: (e: { message: string }) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  create(projectId: string, title: string): Observable<Issue> {
    return this.http
      .post<Issue>(`/api/projects/${projectId}/issues`, { title })
      .pipe(tap((issue) => this.issues.update((list) => [...list, issue])));
  }

  /** Optimistic status change with rollback on error. */
  updateStatus(id: string, status: IssueStatus): Observable<Issue> {
    const previous = this.issues();
    this.issues.update((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
    return this.http.patch<Issue>(`/api/issues/${id}`, { status }).pipe(
      tap({
        error: () => this.issues.set(previous),
      }),
    );
  }
}
