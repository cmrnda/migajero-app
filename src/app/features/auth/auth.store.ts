import { Injectable, signal } from '@angular/core';
import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  resetPassword,
  confirmResetPassword,
  getCurrentUser
} from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly isLoading = signal(false);
  readonly errorEs = signal<string | null>(null);
  readonly isSignedIn = signal(false);

  async refreshSession() {
    try {
      await getCurrentUser();
      this.isSignedIn.set(true);
    } catch {
      this.isSignedIn.set(false);
    }
  }

  // Email UX: usamos email como username internamente
  async doSignUp(email: string, password: string, nickname: string) {
    this.isLoading.set(true);
    this.errorEs.set(null);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            nickname // atributo estándar de Cognito
          }
        }
      });
    } catch (e) {
      this.errorEs.set('No se pudo registrar. Revisa tus datos e intenta otra vez.');
      throw e;
    } finally {
      this.isLoading.set(false);
    }
  }

  async doConfirm(email: string, code: string) {
    this.isLoading.set(true);
    this.errorEs.set(null);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
    } catch (e) {
      this.errorEs.set('Código inválido o expirado.');
      throw e;
    } finally {
      this.isLoading.set(false);
    }
  }

  async doSignIn(email: string, password: string) {
    this.isLoading.set(true);
    this.errorEs.set(null);
    try {
      await signIn({ username: email, password });
      this.isSignedIn.set(true);
    } catch (e) {
      this.errorEs.set('Correo o contraseña incorrectos.');
      throw e;
    } finally {
      this.isLoading.set(false);
    }
  }

  async doSignOut() {
    await signOut();
    this.isSignedIn.set(false);
  }

  async startResetPassword(email: string) {
    this.isLoading.set(true);
    this.errorEs.set(null);
    try {
      await resetPassword({ username: email });
    } catch (e) {
      this.errorEs.set('No se pudo iniciar la recuperación.');
      throw e;
    } finally {
      this.isLoading.set(false);
    }
  }

  async finishResetPassword(email: string, code: string, newPassword: string) {
    this.isLoading.set(true);
    this.errorEs.set(null);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
    } catch (e) {
      this.errorEs.set('No se pudo cambiar la contraseña. Revisa el código.');
      throw e;
    } finally {
      this.isLoading.set(false);
    }
  }
}
