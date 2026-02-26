import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { fetchQuiz, getMe, submitQuiz } from '../../core/api/migajero-api';

const CACHE_KEY = 'migajero:lastResult';

function writeCache(result: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}
}

// Tipos mínimos (te evita bugs silenciosos)
type QuizOption = { id: string; text: string; score?: number; tags?: string[] };
type QuizQuestion = { id: string; text: string; options: QuizOption[] };
type Quiz = { version?: string; disclaimer?: string; questions: QuizQuestion[] };

type AnswerState = { optionId: string; score: number; tags: string[] };

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-quiz.page.html',
})
export class SoloQuizPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  quiz: Quiz | null = null;
  me: any = null;

  loading = false;
  submitting = false;

  errorMsg: string | null = null;
  lastResult: any = null;

  idx = 0;

  // ✅ Map por questionId (correcto)
  answers = new Map<string, AnswerState>();

  // UX: auto avanzar al seleccionar (puedes apagarlo)
  autoAdvance = true;

  async ngOnInit() {
    this.loading = true;
    this.errorMsg = null;

    // ✅ Si vienes con ?force=1, reinicia estado local del quiz
    const force = this.route.snapshot.queryParamMap.get('force');
    if (force) {
      this.idx = 0;
      this.answers.clear();
    }

    try {
      this.quiz = await fetchQuiz('v1');

      // Ajusta idx por si el quiz cambia
      if (this.totalQuestions > 0) {
        this.idx = Math.min(this.idx, this.totalQuestions - 1);
      } else {
        this.idx = 0;
      }

      // /me no bloquea
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
      this.quiz = null;
    } finally {
      this.loading = false;
    }
  }

  // ----- Navegación -----
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

  // ✅ Progreso real: respondidas / total
  get progressPercent() {
    const total = this.totalQuestions;
    if (!total) return 0;
    return Math.round((this.answeredCount / total) * 100);
  }

  // ✅ Para mostrar “Pregunta x / y”
  get stepText() {
    const total = this.totalQuestions;
    return total ? `${this.idx + 1} / ${total}` : '';
  }

  isAnswered(questionId: string) {
    return this.answers.has(questionId);
  }

  isSelected(optionId: string) {
    const qid = this.q?.id;
    if (!qid) return false;
    return this.answers.get(qid)?.optionId === optionId;
  }

  // ----- Selección -----
  select(option: QuizOption) {
    if (this.loading || this.submitting) return;
    if (!this.q) return;

    this.answers.set(this.q.id, {
      optionId: option.id,
      score: option.score ?? 0,
      tags: option.tags ?? [],
    });

    // ✅ Auto avance (si quieres)
    if (this.autoAdvance && this.idx < this.totalQuestions - 1) {
      // deja respirar al DOM para que se vea el “seleccionada”
      setTimeout(() => this.next(), 120);
    }
  }

  // ----- Botones -----
  canNext() {
    return !!this.q && this.isAnswered(this.q.id) && !this.submitting;
  }

  next() {
    if (!this.canNext()) return;
    const last = this.totalQuestions - 1;
    this.idx = Math.min(this.idx + 1, last);
  }

  prev() {
    if (this.submitting) return;
    this.idx = Math.max(this.idx - 1, 0);
  }

  // ✅ Submit correcto: verifica TODO y arma answers en ORDEN del quiz
  canSubmit() {
    return (
      !!this.quiz &&
      this.totalQuestions > 0 &&
      this.answeredCount === this.totalQuestions &&
      !this.submitting
    );
  }

  private buildOrderedAnswers() {
    if (!this.quiz) return [];

    // Si falta una respuesta, explota aquí (mejor que mandar payload incompleto)
    for (const q of this.quiz.questions) {
      if (!this.answers.has(q.id)) {
        throw new Error('Te falta responder una pregunta antes de continuar.');
      }
    }

    return this.quiz.questions.map((q) => {
      const v = this.answers.get(q.id)!;
      return {
        questionId: q.id,
        optionId: v.optionId,
        score: v.score,
        tags: v.tags,
      };
    });
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
          gender: p.gender ?? null,
        },
        answers: this.buildOrderedAnswers(), // ✅ en orden del quiz
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

  // ----- trackBy (evita re-render raro) -----
  trackByOptionId = (_: number, o: QuizOption) => o.id;
}
