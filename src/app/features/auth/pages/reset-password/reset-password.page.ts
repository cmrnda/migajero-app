import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.page.html'
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly login = decodeURIComponent(this.route.snapshot.queryParamMap.get('e') ?? '');

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  async onSubmit() {
    if (this.form.invalid || !this.login) return;
    const { code, newPassword } = this.form.getRawValue();
    await this.auth.finishResetPassword(this.login, code!, newPassword!);
    this.router.navigateByUrl('/auth/sign-in');
  }
}
