import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { fetchQuiz } from '../../core/api/migajero-api';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header class="border-b bg-white">
        <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div class="font-bold text-lg">Migajero Test</div>
          <button class="btn-primary" (click)="onSignOut()">Cerrar sesión</button>
        </div>
      </header>

      <main class="mx-auto max-w-5xl px-4 py-10">
        <div class="card p-6">
          <h1 class="text-2xl font-bold">Ya estás dentro ✅</h1>
          <p class="text-slate-600 mt-1">Probemos el backend sin IAM.</p>
        </div>

        <button class="btn-primary mt-4" (click)="testQuiz()">Probar /api/quiz</button>
      </main>
    </div>
  `
})
export class HomePage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  async onSignOut() {
    await this.auth.doSignOut();
    this.router.navigateByUrl('/auth/sign-in');
  }


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
