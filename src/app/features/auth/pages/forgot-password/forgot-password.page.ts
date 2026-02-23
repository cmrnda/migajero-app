import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.page.html'
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    login: ['', [Validators.required]] // correo o username
  });

  async onSubmit() {
    if (this.form.invalid) return;
    const { login } = this.form.getRawValue();
    await this.auth.startResetPassword(login!);
    this.router.navigateByUrl(`/auth/reset?e=${encodeURIComponent(login!)}`);
  }
}
