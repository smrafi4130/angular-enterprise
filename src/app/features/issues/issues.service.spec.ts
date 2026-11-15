import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IssuesService } from './issues.service';

describe('IssuesService', () => {
  let service: IssuesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(IssuesService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads issues into the signal', () => {
    service.load('p1');
    const req = http.expectOne('/api/projects/p1/issues');
    req.flush([{ id: 'i1', projectId: 'p1', title: 'A', status: 'open', createdAt: '' }]);
    expect(service.issues().length).toBe(1);
    expect(service.loading()).toBe(false);
  });

  it('updates status optimistically', () => {
    service.issues.set([{ id: 'i1', projectId: 'p1', title: 'A', status: 'open', createdAt: '' }]);
    service.updateStatus('i1', 'done').subscribe();
    expect(service.issues()[0].status).toBe('done'); // applied before the response
    http.expectOne('/api/issues/i1').flush({ id: 'i1', projectId: 'p1', title: 'A', status: 'done', createdAt: '' });
  });

  it('rolls back the optimistic change when the request fails', () => {
    service.issues.set([{ id: 'i1', projectId: 'p1', title: 'A', status: 'open', createdAt: '' }]);
    service.updateStatus('i1', 'done').subscribe({ error: () => {} });
    expect(service.issues()[0].status).toBe('done');
    http.expectOne('/api/issues/i1').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(service.issues()[0].status).toBe('open'); // rolled back
  });
});
