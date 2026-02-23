import { Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { SignUpPage } from './pages/sign-up/sign-up.page';
import { ConfirmPage } from './pages/confirm/confirm.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './pages/reset-password/reset-password.page';

export const AUTH_ROUTES: Routes = [
  { path: 'sign-in', component: SignInPage },
  { path: 'sign-up', component: SignUpPage },
  { path: 'confirm', component: ConfirmPage },
  { path: 'forgot', component: ForgotPasswordPage },
  { path: 'reset', component: ResetPasswordPage },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' }
];
