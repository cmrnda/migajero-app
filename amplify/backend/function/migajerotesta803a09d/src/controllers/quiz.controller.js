const { ok, badRequest, parseJsonBody } = require('../lib/http');
const { calculateScore } = require('../services/scoring.service');

async function getQuiz() {
  // Luego lo sacamos de DynamoDB (QUIZ#v1). Por ahora dummy.
  return ok({
    version: 'v1',
    questions: [
      {
        id: 'Q1',
        textEs: 'Si te responde cada 3 días con un "jaja", tú...',
        options: [
          { id: 'A', textEs: 'Lo dejo ahí y sigo con mi vida.', points: 0, tags: ['boundaries'] },
          { id: 'B', textEs: 'Le contesto al toque para “mantenerlo”.', points: 3, tags: ['breadcrumbing'] }
        ]
      }
    ]
  });
}

async function submitQuiz({ event }) {
  const body = parseJsonBody(event);
  if (body === null) return badRequest('Cuerpo JSON inválido.');

  const { answers = [] } = body;
  const { score, levelEs, tags } = calculateScore({ answers });

  // Luego: Bedrock comment + guardar en DynamoDB + shareSlug
  return ok({
    resultId: 'tmp',
    score,
    levelEs,
    tags,
    commentEs: 'Comentario IA aquí (luego Bedrock).',
    shareUrl: 'https://tu-dominio/result/tmp'
  });
}

module.exports = { getQuiz, submitQuiz };
