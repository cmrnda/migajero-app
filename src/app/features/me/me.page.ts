import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { APP_VERSION } from '../../core/config/app-info';
import { GenderValue, getMe, updateMe } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './me.page.html'
})
export class MePage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly appVersion = APP_VERSION;

  protected isLoading = false;
  protected isSaving = false;
  protected errorMessage: string | null = null;

  protected readonly genderOptions: Array<{ value: GenderValue; label: string }> = [
    { value: 'F', label: 'Femenino' },
    { value: 'M', label: 'Masculino' },
    { value: 'X', label: 'No binario' },
    { value: 'N', label: 'Prefiero no decirlo' }
  ];

  protected readonly form = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    age: [null as number | null, [Validators.required, Validators.min(13), Validators.max(99)]],
    gender: ['', [Validators.required]]
  });

  async ngOnInit() {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const response = await getMe();
      const profile = response.profile;

      this.form.patchValue({
        fullName: profile.fullName ?? '',
        age: profile.age ?? null,
        gender: profile.gender ?? ''
      });
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo cargar tu perfil.';
    } finally {
      this.isLoading = false;
    }
  }

  protected goBack() {
    this.router.navigateByUrl('/');
  }

  protected async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    try {
      const value = this.form.getRawValue();

      await updateMe({
        fullName: String(value.fullName).trim(),
        age: Number(value.age),
        gender: value.gender as GenderValue
      });

      this.router.navigateByUrl('/');
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo guardar tu perfil.';
    } finally {
      this.isSaving = false;
    }
  }

  protected get fullNameControl() {
    return this.form.controls.fullName;
  }

  protected get ageControl() {
    return this.form.controls.age;
  }

  protected get genderControl() {
    return this.form.controls.gender;
  }
}
