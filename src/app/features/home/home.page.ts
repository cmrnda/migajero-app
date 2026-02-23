import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';

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
        <p class="text-slate-600 mt-1">Siguiente: conectar /api y armar el quiz.</p>
      </div>
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
}
