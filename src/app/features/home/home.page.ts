import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { getMe } from '../../core/api/migajero-api';

type ComingSoonMode = 'VERSUS' | 'GRUPAL';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.page.html'
})
export class HomePage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  me: any = null;
  isLoading = false;

  showModal = false;
  comingSoonMode: ComingSoonMode | null = null;

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.me = await getMe(); // si no existe /me, retorna null
    } finally {
      this.isLoading = false;
    }
  }

  async onSignOut() {
    await this.auth.doSignOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

  goProfile() {
    this.router.navigateByUrl('/me');
  }

  startSolo() {
    this.router.navigateByUrl('/solo/quiz');
  }

  openComingSoon(mode: ComingSoonMode) {
    this.comingSoonMode = mode;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.comingSoonMode = null;
  }

  get profileIncomplete(): boolean {
    const p = this.me?.profile;
    if (!p) return true;
    return !p.fullName || !p.age || !p.gender;
  }
}