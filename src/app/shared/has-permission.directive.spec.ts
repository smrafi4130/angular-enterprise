import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HasPermissionDirective } from './has-permission.directive';
import { AuthService } from '../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<button *appHasPermission="'issue:create'">New</button>`,
})
class HostComponent {}

describe('HasPermissionDirective', () => {
  function setup(can: boolean) {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    spyOn(TestBed.inject(AuthService), 'can').and.returnValue(can);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders content when permission is granted', () => {
    const fixture = setup(true);
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('hides content when permission is denied', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
