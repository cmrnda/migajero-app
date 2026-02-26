import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { fetchQuiz, getMe, submitQuiz } from '../../core/api/migajero-api';

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

  idx = 0;
  answers = new Map<string, { optionId: string; score: number; tags: string[] }>();

  async ngOnInit() {
    this.loading = true;
    try {
      const [quiz, me] = await Promise.all([fetchQuiz('v1'), getMe()]);
      this.quiz = quiz;
      this.me = me; // puede ser null
    } finally {
      this.loading = false;
    }
  }

  get q() {
    return this.quiz?.questions?.[this.idx];
  }

  select(option: any) {
    this.answers.set(this.q.id, { optionId: option.id, score: option.score, tags: option.tags });
  }

  isSelected(optionId: string) {
    return this.answers.get(this.q?.id)?.optionId === optionId;
  }

  canNext() {
    return this.answers.has(this.q?.id);
  }

  next() {
    if (!this.canNext()) return;
    if (this.idx < this.quiz.questions.length - 1) this.idx++;
  }

  prev() {
    if (this.idx > 0) this.idx--;
  }

  canSubmit() {
    return this.quiz && this.answers.size === this.quiz.questions.length;
  }

  async submit() {
    if (!this.canSubmit()) return;

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
    this.router.navigateByUrl('/solo/result', { state: { result } as any });
  }
}