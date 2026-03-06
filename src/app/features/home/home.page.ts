import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { getMe, MeResponse } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.page.html'
})
export class HomePage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  me: MeResponse | null = null;
  isLoading = false;
  errorMsg: string | null = null;

  async ngOnInit() {
    this.isLoading = true;
    this.errorMsg = null;

    try {
      this.me = await getMe();
    } catch (error: any) {
      this.errorMsg = error?.message ?? 'No se pudo cargar el dashboard';
    } finally {
      this.isLoading = false;
    }
  }

  async onSignOut() {
    await this.auth.doSignOut();
    localStorage.removeItem('migajero:lastResult');
    localStorage.removeItem('migajero:lastDuoResult');
    this.router.navigateByUrl('/auth/sign-in');
  }

  goProfile() {
    this.router.navigateByUrl('/me');
  }

  goSolo() {
    this.router.navigateByUrl('/solo/quiz');
  }

  goSoloResult() {
    this.router.navigateByUrl('/solo/result');
  }

  goVersus() {
    this.router.navigateByUrl('/versus');
  }

  get profileIncomplete(): boolean {
    const profile = this.me?.profile;
    if (!profile) return true;
    return !profile.fullName || !profile.age || !profile.gender;
  }

  get hasLastResult(): boolean {
    return !!this.me?.lastResult;
  }

  get duoReady(): boolean {
    return !!this.me?.lastResult && !!this.me?.duoInviteToken;
  }
}
