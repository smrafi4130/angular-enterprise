import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { errorInterceptor } from '../../core/http/error.interceptor';

describe('LoginComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not submit an invalid form', () => {
    const fixture = setup();
    const http = TestBed.inject(HttpTestingController);
    fixture.componentInstance.submit();
    http.expectNone('/api/auth/login');
  });

  it('shows a server error on failed login', () => {
    const fixture = setup();
    const http = TestBed.inject(HttpTestingController);
    fixture.componentInstance.form.setValue({ email: 'a@b.com', password: 'x' });
    fixture.componentInstance.submit();
    http.expectOne('/api/auth/login').flush({ message: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
    expect(fixture.componentInstance.error()).toBe('Invalid email or password');
    http.verify();
  });
});
