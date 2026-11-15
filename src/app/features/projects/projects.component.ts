import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectsService } from './projects.service';
import { HasPermissionDirective } from '../../shared/has-permission.directive';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, HasPermissionDirective],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly service = inject(ProjectsService);

  readonly showForm = signal(false);
  readonly creating = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  ngOnInit(): void {
    this.service.load();
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    const { name, description } = this.form.getRawValue();
    this.service.create(name, description).subscribe({
      next: () => {
        this.form.reset();
        this.showForm.set(false);
        this.creating.set(false);
      },
      error: () => this.creating.set(false),
    });
  }
}
