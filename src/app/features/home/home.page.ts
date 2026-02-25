import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { fetchQuiz } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  async onSignOut() {
    await this.auth.doSignOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

  goSolo() { this.router.navigateByUrl('/quiz'); }
  goVersus() { this.router.navigateByUrl('/quiz'); }
  goGroup() { this.router.navigateByUrl('/quiz'); }

  async testQuiz() {
    try {
      const data = await fetchQuiz('v1');
      console.log('QUIZ OK:', data);
      alert('✅ /quiz OK (mira consola)');
    } catch (e: any) {
      console.error('QUIZ FAIL:', e);
      alert(`❌ Falló /quiz: ${e?.message ?? e}`);
    }
  }
}