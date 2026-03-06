import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Gender, getMe, updateMe } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './me.page.html'
})
export class MePage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly appVersion = '0.2.1';

  isLoading = false;
  saving = false;
  backendMissing = false;
  errorMsg: string | null = null;

  readonly genderOptions: Array<{ value: Gender; label: string }> = [
    { value: 'F', label: 'Femenino' },
    { value: 'M', label: 'Masculino' },
    { value: 'X', label: 'No binario' },
    { value: 'N', label: 'Prefiero no decirlo' }
  ];

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    age: [null as number | null, [Validators.required, Validators.min(13), Validators.max(99)]],
    gender: [null as Gender | null, [Validators.required]]
  });

  get errorMessage(): string | null {
    return this.errorMsg;
  }

  get isSaving(): boolean {
    return this.saving;
  }

  get fullNameControl(): AbstractControl {
    return this.form.controls.fullName;
  }

  get ageControl(): AbstractControl {
    return this.form.controls.age;
  }

  get genderControl(): AbstractControl {
    return this.form.controls.gender;
  }

  async ngOnInit() {
    this.isLoading = true;
    this.errorMsg = null;
    this.backendMissing = false;

    try {
      const me = await getMe();

      if (!me) {
        this.backendMissing = true;
        return;
      }

      const profile = me.profile ?? {
        fullName: null,
        age: null,
        gender: null
      };

      this.form.patchValue({
        fullName: profile.fullName ?? '',
        age: profile.age ?? null,
        gender: (profile.gender as Gender | null) ?? null
      });
    } catch (error: any) {
      this.errorMsg = error?.message ?? 'Error cargando perfil';
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigateByUrl('/');
  }

  async save() {
    if (this.backendMissing || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = null;

    try {
      const raw = this.form.getRawValue();

      await updateMe({
        fullName: raw.fullName ?? null,
        age: raw.age ?? null,
        gender: raw.gender ?? null
      });

      this.goBack();
    } catch (error: any) {
      this.errorMsg = error?.message ?? 'Error guardando perfil';
    } finally {
      this.saving = false;
    }
  }
}
