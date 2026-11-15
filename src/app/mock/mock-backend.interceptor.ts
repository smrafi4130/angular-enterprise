import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { Issue } from '../core/models';
import { seed } from './data';

/**
 * In-memory API, wired as a functional interceptor. The app (and its tests)
 * exercise the real HttpClient, services and RxJS pipeline against this, so no
 * backend is needed to run or test. Tokens are opaque strings mapped to a role.
 */
const db = seed();
let nextId = 100;

function ok<T>(body: T, status = 200): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status, body })).pipe(delay(120));
}
function fail(status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: { message } })).pipe(delay(120)) as Observable<never>;
}
function userFrom(req: HttpRequest<unknown>) {
  const auth = req.headers.get('Authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const role = token ? db.roleByToken.get(token) : undefined;
  return role ? db.users.find((u) => u.role === role) ?? null : null;
}

export function mockBackendInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!req.url.startsWith('/api/')) return next(req);
  const url = req.url.replace(/^\/api/, '');
  const body = req.body as Record<string, unknown>;

  if (url === '/auth/login' && req.method === 'POST') {
    const user = db.users.find((u) => u.email === body['email'] && u.password === body['password']);
    if (!user) return fail(401, 'Invalid email or password');
    const token = `tok_${nextId++}`;
    db.roleByToken.set(token, user.role);
    const { password: _p, ...safe } = user;
    return ok({ token, user: safe });
  }

  const me = userFrom(req);
  if (!me) return fail(401, 'Unauthenticated');

  if (url === '/projects' && req.method === 'GET') {
    const withCounts = db.projects.map((p) => ({ ...p, openIssues: db.issues.filter((i) => i.projectId === p.id && i.status !== 'done').length }));
    return ok(withCounts);
  }
  if (url === '/projects' && req.method === 'POST') {
    if (me.role === 'viewer') return fail(403, 'Forbidden');
    const project = { id: `p${nextId++}`, name: String(body['name']), description: String(body['description'] ?? ''), openIssues: 0, createdAt: new Date().toISOString() };
    db.projects.push(project);
    return ok(project, 201);
  }
  const issuesMatch = url.match(/^\/projects\/([^/]+)\/issues$/);
  if (issuesMatch && req.method === 'GET') {
    return ok(db.issues.filter((i) => i.projectId === issuesMatch[1]));
  }
  if (issuesMatch && req.method === 'POST') {
    if (me.role === 'viewer') return fail(403, 'Forbidden');
    const issue: Issue = { id: `i${nextId++}`, projectId: issuesMatch[1], title: String(body['title']), status: 'open', createdAt: new Date().toISOString() };
    db.issues.push(issue);
    return ok(issue, 201);
  }
  const issueMatch = url.match(/^\/issues\/([^/]+)$/);
  if (issueMatch && req.method === 'PATCH') {
    if (me.role === 'viewer') return fail(403, 'Forbidden');
    const issue = db.issues.find((i) => i.id === issueMatch[1]);
    if (!issue) return fail(404, 'Issue not found');
    Object.assign(issue, body);
    return ok(issue);
  }
  return fail(404, 'Not found');
}
