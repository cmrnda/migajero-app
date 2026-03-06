import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DuoResult, getMe, submitDuo } from '../../core/api/migajero-api';

const duoCacheKey = 'migajero:lastDuoResult';

function writeDuoCache(result: DuoResult) {
  try {
    localStorage.setItem(duoCacheKey, JSON.stringify(result));
  } catch {}
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './versus-join.page.html'
})
export class VersusJoinPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isLoading = false;
  isComparing = false;
  needsQuiz = false;
  errorMessage: string | null = null;
  inviteToken = '';

  async ngOnInit() {
    this.inviteToken = String(this.route.snapshot.queryParamMap.get('t') || '').trim();

    if (!this.inviteToken) {
      this.errorMessage = 'Invitación inválida.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.needsQuiz = false;

    try {
      const me = await getMe();

      if (!me.lastResult) {
        this.needsQuiz = true;
        return;
      }

      await this.compareNow();
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo cargar la invitación.';
    } finally {
      this.isLoading = false;
    }
  }

  async compareNow() {
    if (!this.inviteToken || this.isComparing) return;

    this.isComparing = true;
    this.errorMessage = null;

    try {
      const result = await submitDuo(this.inviteToken);

      writeDuoCache(result);
      this.router.navigateByUrl('/versus/result', { state: { result } as any });
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo completar el versus.';
    } finally {
      this.isComparing = false;
    }
  }

  goToQuiz() {
    this.router.navigate(['/solo/quiz'], {
      queryParams: {
        next: `/versus/join?t=${encodeURIComponent(this.inviteToken)}`
      }
    });
  }
}
