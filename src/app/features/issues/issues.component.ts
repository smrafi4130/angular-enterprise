import { Component, inject, input, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IssuesService } from './issues.service';
import { AuthService } from '../../core/auth/auth.service';
import { HasPermissionDirective } from '../../shared/has-permission.directive';
import { ISSUE_STATUSES, IssueStatus } from '../../core/models';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [ReactiveFormsModule, HasPermissionDirective],
  templateUrl: './issues.component.html',
})
export class IssuesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly service = inject(IssuesService);
  protected readonly auth = inject(AuthService);
  protected readonly statuses = ISSUE_STATUSES;

  /** Router-bound input (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly titleControl = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(4)]);
  readonly adding = signal(false);

  ngOnInit(): void {
    this.service.load(this.id());
  }

  add(): void {
    if (this.titleControl.invalid) {
      this.titleControl.markAsTouched();
      return;
    }
    this.adding.set(true);
    this.service.create(this.id(), this.titleControl.value).subscribe({
      next: () => {
        this.titleControl.reset();
        this.adding.set(false);
      },
      error: () => this.adding.set(false),
    });
  }

  changeStatus(issueId: string, value: string): void {
    this.service.updateStatus(issueId, value as IssueStatus).subscribe();
  }
}
