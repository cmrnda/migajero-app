import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getMe, updateMe } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './me.page.html'
})
export class MePage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  isLoading = false;
  saving = false;
  backendMissing = false;

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    age: [null as number | null, [Validators.required, Validators.min(13), Validators.max(99)]],
    gender: ['', [Validators.required]]
  });

  async ngOnInit() {
    this.isLoading = true;
    try {
      const me = await getMe();
      if (!me) {
        this.backendMissing = true;
        return;
      }
      const p = me.profile ?? {};
      this.form.patchValue({
        fullName: p.fullName ?? '',
        age: p.age ?? null,
        gender: p.gender ?? ''
      });
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigateByUrl('/');
  }

  async save() {
    if (this.backendMissing) return;
    if (this.form.invalid) return;

    this.saving = true;
    try {
      await updateMe(this.form.getRawValue());
      this.goBack();
    } finally {
      this.saving = false;
    }
  }
}