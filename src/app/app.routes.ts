import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { soloGateGuard } from './core/guards/solo-gate.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.page').then(m => m.HomePage)
  },

  {
    path: 'me',
    canActivate: [authGuard],
    loadComponent: () => import('./features/me/me.page').then(m => m.MePage)
  },

  {
    path: 'solo/quiz',
    canActivate: [authGuard, soloGateGuard],
    loadComponent: () => import('./features/solo/solo-quiz.page').then(m => m.SoloQuizPage)
  },
  {
    path: 'solo/result',
    canActivate: [authGuard],
    loadComponent: () => import('./features/solo/solo-result.page').then(m => m.SoloResultPage)
  },

  { path: 'quiz', redirectTo: 'solo/quiz', pathMatch: 'full' },

  { path: '**', redirectTo: '' }
];
