import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { getMe, MeResponse } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './versus-lobby.page.html'
})
export class VersusLobbyPage {
  private readonly router = inject(Router);

  me: MeResponse | null = null;
  loading = false;
  errorMsg: string | null = null;
  inviteLink = '';

  async ngOnInit() {
    this.loading = true;
    this.errorMsg = null;

    try {
      this.me = await getMe();

      this.inviteLink = this.me?.duoInviteToken
        ? `${window.location.origin}/versus/join?t=${encodeURIComponent(this.me.duoInviteToken)}`
        : '';
    } catch (error: any) {
      this.errorMsg = error?.message ?? 'No se pudo cargar el modo versus';
    } finally {
      this.loading = false;
    }
  }

  get hasSoloResult(): boolean {
    return !!this.me?.lastResult;
  }

  get canGenerateInvite(): boolean {
    return !!this.me?.duoInviteToken && !!this.me?.lastResult;
  }

  goMakeSolo() {
    this.router.navigate(['/solo/quiz'], {
      queryParams: {
        next: '/versus'
      }
    });
  }

  async copyInviteLink() {
    if (!this.inviteLink) return;

    try {
      await navigator.clipboard.writeText(this.inviteLink);
    } catch {
      this.errorMsg = 'No se pudo copiar el link';
    }
  }

  async shareInviteLink() {
    if (!this.inviteLink) return;

    const nav: any = navigator;

    if (nav.share) {
      try {
        await nav.share({
          title: 'Versus Migajero',
          text: 'Compárate conmigo en el Migajero Test',
          url: this.inviteLink
        });
      } catch {}
      return;
    }

    await this.copyInviteLink();
  }

  trackByTag = (_: number, tag: string) => tag;
}
