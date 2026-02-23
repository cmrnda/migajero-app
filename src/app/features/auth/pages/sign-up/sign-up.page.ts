import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-up.page.html'
})
export class SignUpPage {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    nickname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  async onSubmit() {
    if (this.form.invalid) return;
    const { nickname, email, password } = this.form.getRawValue();
    await this.auth.doSignUp(email!, password!, nickname!);
    this.router.navigateByUrl(`/auth/confirm?e=${encodeURIComponent(email!)}`);
  }
}
