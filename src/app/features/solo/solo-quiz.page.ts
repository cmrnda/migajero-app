import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { APP_VERSION, QUIZ_VERSION } from '../../core/config/app-info';
import {
  QuizOption,
  QuizQuestion,
  QuizResponse,
  fetchQuiz,
  getMe,
  submitQuiz
} from '../../core/api/migajero-api';

type SelectedAnswer = {
  optionId: string;
};

const cacheKey = 'migajero:lastResult';

function writeResultCache(result: unknown) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {}
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-quiz.page.html'
})
export class SoloQuizPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly appVersion = APP_VERSION;
  protected readonly quizVersion = QUIZ_VERSION;

  protected quiz: QuizResponse | null = null;
  protected profileData: any = null;
  protected lastResult: any = null;

  protected isLoading = false;
  protected isSubmitting = false;
  protected errorMessage: string | null = null;

  protected questionIndex = 0;
  protected readonly selectedAnswers = new Map<string, SelectedAnswer>();
  protected autoAdvance = true;

  async ngOnInit() {
    this.isLoading = true;
    this.errorMessage = null;

    const force = this.route.snapshot.queryParamMap.get('force');

    if (force) {
      this.questionIndex = 0;
      this.selectedAnswers.clear();
    }

    try {
      this.quiz = await fetchQuiz(this.quizVersion);

      if (this.totalQuestions > 0) {
        this.questionIndex = Math.min(this.questionIndex, this.totalQuestions - 1);
      } else {
        this.questionIndex = 0;
      }

      try {
        const me = await getMe();
        this.profileData = me.profile;
        this.lastResult = me.lastResult;
      } catch {
        this.profileData = null;
        this.lastResult = null;
      }
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo cargar el test.';
      this.quiz = null;
    } finally {
      this.isLoading = false;
    }
  }

  protected goLastResult() {
    this.router.navigateByUrl('/solo/result');
  }

  protected get totalQuestions() {
    return this.quiz?.questions?.length ?? 0;
  }

  protected get currentQuestion(): QuizQuestion | null {
    return this.quiz?.questions?.[this.questionIndex] ?? null;
  }

  protected get answeredCount() {
    return this.selectedAnswers.size;
  }

  protected get progressPercent() {
    if (!this.totalQuestions) return 0;
    return Math.round((this.answeredCount / this.totalQuestions) * 100);
  }

  protected isSelected(optionId: string) {
    const questionId = this.currentQuestion?.id;
    if (!questionId) return false;
    return this.selectedAnswers.get(questionId)?.optionId === optionId;
  }

  protected select(option: QuizOption) {
    if (this.isLoading || this.isSubmitting || !this.currentQuestion) return;

    this.selectedAnswers.set(this.currentQuestion.id, {
      optionId: option.id
    });

    if (this.autoAdvance && this.questionIndex < this.totalQuestions - 1) {
      setTimeout(() => this.next(), 120);
    }
  }

  protected canGoNext() {
    return !!this.currentQuestion && this.selectedAnswers.has(this.currentQuestion.id) && !this.isSubmitting;
  }

  protected next() {
    if (!this.canGoNext()) return;
    this.questionIndex = Math.min(this.questionIndex + 1, this.totalQuestions - 1);
  }

  protected prev() {
    if (this.isSubmitting) return;
    this.questionIndex = Math.max(this.questionIndex - 1, 0);
  }

  protected canSubmit() {
    return !!this.quiz && this.totalQuestions > 0 && this.answeredCount === this.totalQuestions && !this.isSubmitting;
  }

  private buildOrderedAnswers() {
    if (!this.quiz) return [];

    return this.quiz.questions.map((question) => {
      const selected = this.selectedAnswers.get(question.id);

      if (!selected) {
        throw new Error('Te falta responder al menos una pregunta.');
      }

      return {
        questionId: question.id,
        optionId: selected.optionId
      };
    });
  }

  protected async submit() {
    if (!this.canSubmit()) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    try {
      const result = await submitQuiz({
        mode: 'SOLO',
        profile: this.profileData ?? null,
        answers: this.buildOrderedAnswers()
      });

      writeResultCache(result);
      this.router.navigateByUrl('/solo/result', { state: { result } as any });
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo enviar el test.';
    } finally {
      this.isSubmitting = false;
    }
  }

  protected trackByOptionId = (_: number, option: QuizOption) => option.id;
}
