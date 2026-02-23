import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-in.page.html'
})
export class SignInPage {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    login: ['', [Validators.required]],   // correo o username
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  async onSubmit() {
    if (this.form.invalid) return;
    const { login, password } = this.form.getRawValue();
    await this.auth.doSignIn(login!, password!);
    await this.auth.refreshSession();
    this.router.navigateByUrl('/');
  }
}
