import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  fetchQuiz,
  getMe,
  QuizDefinition,
  QuizOption,
  QuizQuestion,
  SoloAnswerPayload,
  submitSolo
} from '../../core/api/migajero-api';

const CACHE_KEY = 'migajero:lastResult';

function writeCache(result: unknown) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}
}

type AnswerState = {
  optionId: string;
};

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-quiz.page.html'
})
export class SoloQuizPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  quiz: QuizDefinition | null = null;
  me: any = null;

  loading = false;
  submitting = false;
  autoAdvance = true;

  errorMsg: string | null = null;
  lastResult: any = null;

  idx = 0;
  answers = new Map<string, AnswerState>();

  async ngOnInit() {
    this.loading = true;
    this.errorMsg = null;

    const force = this.route.snapshot.queryParamMap.get('force');
    if (force) {
      this.idx = 0;
      this.answers.clear();
    }

    try {
      this.quiz = await fetchQuiz('v4');

      if (this.totalQuestions > 0) {
        this.idx = Math.min(this.idx, this.totalQuestions - 1);
      }

      try {
        this.me = await getMe();
        this.lastResult = this.me?.lastResult ?? null;
      } catch {
        this.me = null;
        this.lastResult = null;
      }
    } catch (error: any) {
      this.errorMsg = error?.message ?? 'Error cargando el test';
      this.quiz = null;
    } finally {
      this.loading = false;
    }
  }

  goLastResult() {
    this.router.navigateByUrl('/solo/result');
  }

  get totalQuestions() {
    return this.quiz?.questions?.length ?? 0;
  }

  get q(): QuizQuestion | null {
    return this.quiz?.questions?.[this.idx] ?? null;
  }

  get answeredCount() {
    return this.answers.size;
  }

  get progressPercent() {
    const total = this.totalQuestions;
    if (!total) return 0;
    return Math.round((this.answeredCount / total) * 100);
  }

  isSelected(optionId: string) {
    const qid = this.q?.id;
    if (!qid) return false;
    return this.answers.get(qid)?.optionId === optionId;
  }

  select(option: QuizOption) {
    if (this.loading || this.submitting || !this.q) return;

    this.answers.set(this.q.id, {
      optionId: option.id
    });

    if (this.autoAdvance && this.idx < this.totalQuestions - 1) {
      setTimeout(() => this.next(), 110);
    }
  }

  canNext() {
    return !!this.q && this.answers.has(this.q.id) && !this.submitting;
  }

  next() {
    if (!this.canNext()) return;
    this.idx = Math.min(this.idx + 1, this.totalQuestions - 1);
  }

  prev() {
    if (this.submitting) return;
    this.idx = Math.max(this.idx - 1, 0);
  }

  canSubmit() {
    return !!this.quiz && this.answeredCount === this.totalQuestions && !this.submitting;
  }

  private buildOrderedAnswers(): SoloAnswerPayload[] {
    if (!this.quiz) return [];

    return this.quiz.questions.map((question) => {
      const value = this.answers.get(question.id);
      if (!value) {
        throw new Error('Te falta responder una pregunta');
      }

      return {
        questionId: question.id,
        optionId: value.optionId
      };
    });
  }

  async submit() {
    if (!this.canSubmit()) return;

    this.submitting = true;
    this.errorMsg = null;

    try {
      const result = await submitSolo({
        mode: 'SOLO',
        profile: this.me?.profile ?? null,
        answers: this.buildOrderedAnswers()
      });

      writeCache(result);

      const next =
        this.route.snapshot.queryParamMap.get('next') ||
        this.route.snapshot.queryParamMap.get('returnTo');

      if (next) {
        this.router.navigateByUrl(next);
        return;
      }

      this.router.navigateByUrl('/solo/result', { state: { result } as any });
    } catch (error: any) {
      this.errorMsg = error?.message ?? 'Error enviando el test';
    } finally {
      this.submitting = false;
    }
  }

  trackByOptionId = (_: number, option: QuizOption) => option.id;
}
