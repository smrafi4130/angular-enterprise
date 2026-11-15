import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { Permission } from '../core/auth/permissions';

/**
 * Structural directive: renders its content only if the current user holds the
 * permission. UI affordance only — the server (mock interceptor here) still
 * enforces. Usage: `<button *appHasPermission="'issue:create'">…`.
 */
@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective {
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);

  readonly appHasPermission = input.required<Permission>();

  constructor() {
    effect(() => {
      const allowed = this.auth.can(this.appHasPermission());
      this.vcr.clear();
      if (allowed) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}
