import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { fetchQuiz, getMe, submitQuiz } from '../../core/api/migajero-api';

const CACHE_KEY = 'migajero:lastResult';

function writeCache(result: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-quiz.page.html'
})
export class SoloQuizPage {
  private readonly router = inject(Router);

  quiz: any = null;
  me: any = null;

  loading = false;
  submitting = false;

  errorMsg: string | null = null;
  lastResult: any = null;

  idx = 0;
  answers = new Map<string, { optionId: string; score: number; tags: string[] }>();

  async ngOnInit() {
    this.loading = true;
    this.errorMsg = null;

    try {
      this.quiz = await fetchQuiz('v1');

      try {
        this.me = await getMe();
        this.lastResult = this.me?.lastResult ?? null;
      } catch (e: any) {
        this.me = null;
        this.lastResult = null;
        console.log('ME_FAIL (no bloquea):', e?.message ?? e);
      }
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error cargando el test';
    } finally {
      this.loading = false;
    }
  }

  goLastResult() {
    this.router.navigateByUrl('/solo/result');
  }

  get q() {
    return this.quiz?.questions?.[this.idx];
  }

  select(option: any) {
    if (!this.q) return;
    this.answers.set(this.q.id, { optionId: option.id, score: option.score, tags: option.tags });
  }

  isSelected(optionId: string) {
    return this.answers.get(this.q?.id)?.optionId === optionId;
  }

  canNext() {
    return !!this.q && this.answers.has(this.q.id);
  }

  next() {
    if (!this.canNext()) return;
    if (this.idx < this.quiz.questions.length - 1) this.idx++;
  }

  prev() {
    if (this.idx > 0) this.idx--;
  }

  canSubmit() {
    return this.quiz && this.answers.size === this.quiz.questions.length && !this.submitting;
  }

  async submit() {
    if (!this.canSubmit()) return;

    this.submitting = true;
    this.errorMsg = null;

    try {
      const p = this.me?.profile ?? {};
      const payload = {
        mode: 'SOLO',
        profile: {
          fullName: p.fullName ?? null,
          age: p.age ?? null,
          gender: p.gender ?? null
        },
        answers: [...this.answers.entries()].map(([questionId, v]) => ({
          questionId,
          optionId: v.optionId,
          score: v.score,
          tags: v.tags
        }))
      };

      const result = await submitQuiz(payload);

      writeCache(result);

      this.router.navigateByUrl('/solo/result', { state: { result } as any });
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error enviando el test';
    } finally {
      this.submitting = false;
    }
  }
}
