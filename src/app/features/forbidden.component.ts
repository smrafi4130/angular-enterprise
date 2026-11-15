import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `<section class="card"><h1>No access</h1><p class="muted">You don’t have permission to view that page.</p><a routerLink="/">Back to projects</a></section>`,
})
export class ForbiddenComponent {}
