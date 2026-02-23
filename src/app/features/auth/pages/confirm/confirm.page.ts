import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './confirm.page.html'
})
export class ConfirmPage {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = decodeURIComponent(this.route.snapshot.queryParamMap.get('e') ?? '');

  readonly form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(4)]]
  });

  async onSubmit() {
    if (this.form.invalid || !this.email) return;
    const { code } = this.form.getRawValue();
    await this.auth.doConfirm(this.email, code!);
    this.router.navigateByUrl('/auth/sign-in');
  }
}
