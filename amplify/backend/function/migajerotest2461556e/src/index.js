const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const region = process.env.AWS_REGION || process.env.REGION || "us-east-1";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region }),
  { marshallOptions: { removeUndefinedValues: true } }
);

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

function getMethod(event) {
  return (
    event?.httpMethod ||
    event?.requestContext?.http?.method ||
    event?.requestContext?.request?.method ||
    ""
  ).toUpperCase();
}

function getUserId(event) {
  return (
    event?.requestContext?.identity?.cognitoIdentityId ||
    event?.requestContext?.authorizer?.claims?.sub ||
    event?.requestContext?.authorizer?.jwt?.claims?.sub ||
    null
  );
}

function parseBody(event) {
  if (!event?.body) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf-8")
      : event.body;
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function buildQuizDefinition() {
  return {
    version: "v2",
    title: "Test Migajero",
    disclaimer: "Es solo entretenimiento. No reemplaza ayuda profesional ni es diagnóstico.",
    questions: [
      {
        id: "q1",
        text: "Te responden con un “jajaja” y nada más. Tú:",
        options: [
          { id: "a", text: "Me basta, al menos respondió.", weight: 10, tagKeys: ["breadcrumbing", "hope"] },
          { id: "b", text: "Respondo tranqui y sigo a lo mío.", weight: 5, tagKeys: ["ambiguity"] },
          { id: "c", text: "No respondo. Tengo mejores cosas que hacer.", weight: 0, tagKeys: ["selfWorth", "boundaries"] },
        ],
      },
      {
        id: "q2",
        text: "Te dicen “no quiero nada serio” pero te tratan como pareja. Tú:",
        options: [
          { id: "a", text: "Sigo ahí, capaz cambia.", weight: 10, tagKeys: ["hope", "ambiguity"] },
          { id: "b", text: "Pregunto directo qué está pasando.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "Sin claridad no me quedo.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q3",
        text: "Te cancelan a última hora y te dicen “ya será” sin fecha. Tú:",
        options: [
          { id: "a", text: "Todo bien, yo entiendo… otra vez.", weight: 9, tagKeys: ["breadcrumbing"] },
          { id: "b", text: "Ok, pero tú propones día y hora.", weight: 3, tagKeys: ["boundaries"] },
          { id: "c", text: "Perfecto. Yo también cancelé mi interés.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q4",
        text: "Solo te escriben de noche con “¿qué haces?”. Tú:",
        options: [
          { id: "a", text: "Estoy libre, ya pues… caigo.", weight: 10, tagKeys: ["breadcrumbing"] },
          { id: "b", text: "Respondo, pero sin regalarme.", weight: 6, tagKeys: ["ambiguity"] },
          { id: "c", text: "Modo avión. Que hablen de día.", weight: 0, tagKeys: ["boundaries"] },
        ],
      },
      {
        id: "q5",
        text: "Te reaccionan historias, pero conversar nada. Tú:",
        options: [
          { id: "a", text: "Eso ya cuenta como interés, ¿no?", weight: 9, tagKeys: ["hope"] },
          { id: "b", text: "Les sigo el juego un rato.", weight: 5, tagKeys: ["ambiguity"] },
          { id: "c", text: "Reacción no es interés. Siguiente.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q6",
        text: "Te dicen “te extraño” pero no hacen nada por verte. Tú:",
        options: [
          { id: "a", text: "Me quedo esperando, capaz esta vez sí.", weight: 10, tagKeys: ["hope", "ambiguity"] },
          { id: "b", text: "Le recuerdo que hechos matan palabras.", weight: 3, tagKeys: ["boundaries"] },
          { id: "c", text: "Yo extraño mi paz mental, gracias.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q7",
        text: "Te dejan en visto y vuelven dos días después como si nada. Tú:",
        options: [
          { id: "a", text: "Contesto igual, total no pasa nada.", weight: 9, tagKeys: ["breadcrumbing"] },
          { id: "b", text: "Respondo corto y que se note.", weight: 5, tagKeys: ["boundaries"] },
          { id: "c", text: "No respondo. Punto final.", weight: 0, tagKeys: ["selfWorth", "boundaries"] },
        ],
      },
      {
        id: "q8",
        text: "Te invitan solo cuando se les cae el plan principal. Tú:",
        options: [
          { id: "a", text: "Acepto. Igual quiero verle.", weight: 10, tagKeys: ["breadcrumbing"] },
          { id: "b", text: "Depende. Una más y ya no.", weight: 5, tagKeys: ["boundaries"] },
          { id: "c", text: "No soy plan de emergencia.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q9",
        text: "Te hablan solo cuando están tristes o aburridos. Tú:",
        options: [
          { id: "a", text: "Aquí estoy siempre, ya pues.", weight: 10, tagKeys: ["hope"] },
          { id: "b", text: "Apoyo, pero no soy atención 24/7.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "No soy terapia gratis, con cariño.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q10",
        text: "Te dicen: “Eres increíble, pero…”. Tú:",
        options: [
          { id: "a", text: "Me quedo con el “increíble”.", weight: 9, tagKeys: ["ambiguity", "hope"] },
          { id: "b", text: "Pregunto qué significa ese “pero”.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "Gracias. Sigo con mi vida.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q11",
        text: "Te piden fotos o atención, pero compromiso cero. Tú:",
        options: [
          { id: "a", text: "Accedo… algo debe sentir, ¿no?", weight: 10, tagKeys: ["breadcrumbing"] },
          { id: "b", text: "Primero respeto, luego vemos.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "No doy beneficios sin reciprocidad.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q12",
        text: "Cuando preguntas qué son, te dicen “andamos viendo”. Tú:",
        options: [
          { id: "a", text: "Ok, sigo viendo también… solo yo.", weight: 10, tagKeys: ["ambiguity", "hope"] },
          { id: "b", text: "Pido claridad y un mínimo de orden.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "Si no hay definición, no hay acceso.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q13",
        text: "Te ghostean y vuelven con “perdón, estaba full”. Tú:",
        options: [
          { id: "a", text: "Se entiende… supongo.", weight: 10, tagKeys: ["breadcrumbing"] },
          { id: "b", text: "Ok, pero no me desaparezcas así.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "Full estaba yo… de paciencia.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q14",
        text: "En privado te tratan bonito, pero en público ni te ubican. Tú:",
        options: [
          { id: "a", text: "Mientras sea bonito, me basta.", weight: 9, tagKeys: ["ambiguity"] },
          { id: "b", text: "Lo hablo. Ese juego no me gusta.", weight: 4, tagKeys: ["boundaries"] },
          { id: "c", text: "Si me escondes, me pierdes.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
      {
        id: "q15",
        text: "Te prometen “la próxima semana sí” y nunca cumplen. Tú:",
        options: [
          { id: "a", text: "Espero nomás… ya soy paciente profesional.", weight: 10, tagKeys: ["hope"] },
          { id: "b", text: "Una última, pero con fecha fija.", weight: 5, tagKeys: ["boundaries"] },
          { id: "c", text: "Promesa sin acción es puro cuento.", weight: 0, tagKeys: ["selfWorth"] },
        ],
      },
    ],
  };
}

function getTagLabelMap() {
  return {
    breadcrumbing: "Breadcrumbing detectado",
    hope: "Esperanza premium",
    ambiguity: "Ambigüedad romántica",
    boundaries: "Límites activándose",
    selfWorth: "Amor propio presente",
  };
}

function getLevelFromScore(score) {
  if (score <= 15) return "Cero migajas, full paz mental";
  if (score <= 35) return "Migajer@ en recuperación";
  if (score <= 60) return "Migajer@ funcional";
  if (score <= 80) return "Migajer@ certificad@";
  return "Leyenda del migajeo";
}

function sanitizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
}

function sanitizeAge(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed);
}

function sanitizeGender(value) {
  const parsed = String(value ?? "")
    .trim()
    .toUpperCase();
  return ["F", "M", "X", "N"].includes(parsed) ? parsed : null;
}

function sanitizeProfile(profile) {
  if (!profile || typeof profile !== "object") return null;

  const fullName = sanitizeName(profile.fullName);
  const age = sanitizeAge(profile.age);
  const gender = sanitizeGender(profile.gender);

  return {
    fullName: fullName || null,
    age: Number.isFinite(age) ? age : null,
    gender,
  };
}

function normalizeAnswers(input) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => ({
    questionId: String(item?.questionId ?? "").trim(),
    optionId: String(item?.optionId ?? "").trim(),
  }));
}

function evaluateAnswers(answers) {
  const quiz = buildQuizDefinition();
  const questions = quiz.questions;
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const normalizedAnswers = normalizeAnswers(answers);

  if (normalizedAnswers.length !== questions.length) {
    throw new Error("Debes responder todas las preguntas");
  }

  const seenQuestions = new Set();
  let totalWeight = 0;
  const maxWeight = questions.length * 10;
  const tagCount = new Map();
  const sanitizedAnswers = [];

  for (const answer of normalizedAnswers) {
    const question = questionMap.get(answer.questionId);

    if (!question) {
      throw new Error("Se detectaron preguntas inválidas");
    }

    if (seenQuestions.has(answer.questionId)) {
      throw new Error("Hay respuestas duplicadas");
    }

    seenQuestions.add(answer.questionId);

    const option = question.options.find((item) => item.id === answer.optionId);
    if (!option) {
      throw new Error("Se detectaron opciones inválidas");
    }

    totalWeight += option.weight;

    for (const tagKey of option.tagKeys) {
      tagCount.set(tagKey, (tagCount.get(tagKey) || 0) + 1);
    }

    sanitizedAnswers.push({
      questionId: question.id,
      optionId: option.id,
    });
  }

  if (seenQuestions.size !== questions.length) {
    throw new Error("Faltan respuestas por registrar");
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round((totalWeight / Math.max(1, maxWeight)) * 100))
  );

  const rawTags = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tagKey]) => tagKey);

  const tagLabelMap = getTagLabelMap();
  const tags = rawTags.map((tagKey) => tagLabelMap[tagKey] || tagKey);
  const level = getLevelFromScore(score);

  return {
    quizVersion: quiz.version,
    score,
    level,
    rawTags,
    tags,
    answers: sanitizedAnswers,
  };
}

function buildFallbackComment({ score, profile }) {
  const name = sanitizeName(profile?.fullName);
  const greeting = name ? `${name}, ` : "";

  if (score <= 15) {
    return `${greeting}estás clarit@, tranqui.\nNo compras humo y eso se respeta.`;
  }

  if (score <= 35) {
    return `${greeting}vas saliendo del evento canónico.\nTodavía dudas un poco, pero ya estás viendo la luz.`;
  }

  if (score <= 60) {
    return `${greeting}hay señales raras y tú todavía negocias con el universo.\nOjo ahí, ya toca subir estándares.`;
  }

  if (score <= 80) {
    return `${greeting}te dieron migajas y tú casi armaste menú.\nYa pues, menos excusas y más límites.`;
  }

  return `${greeting}esto ya fue arte del autoengaño.\nRespira, bloquea si hace falta y vuelve a ti.`;
}

async function buildAiComment({ score, level, tags, profile }) {
  const modelId =
    process.env.BEDROCK_MODEL_ID ||
    "anthropic.claude-3-haiku-20240307-v1:0";

  const bedrockRegion =
    process.env.BEDROCK_REGION ||
    process.env.AWS_REGION ||
    process.env.REGION ||
    "us-east-1";

  const client = new BedrockRuntimeClient({ region: bedrockRegion });
  const safeName = sanitizeName(profile?.fullName);
  const intensity =
    score >= 85 ? "alta" : score >= 60 ? "media-alta" : score >= 35 ? "media" : "baja";

  const prompt = `
Escribe un comentario corto en español para una app divertida de Bolivia.
Debe sonar natural, agradable, chistoso y con cariño.
Máximo 2 líneas.
No uses markdown.
No pongas comillas.
No repitas números.
No menciones score, porcentaje, tags, categorías ni nivel.
No insultes.
Usa como mucho una o dos expresiones suaves como: ya pues, tranqui, nomás, de una , yiaaa.
No hagas listas.

Nombre opcional: ${safeName || "sin nombre"}
Intensidad: ${intensity}
Resultado interno: ${level}
Patrones internos: ${tags.join(" | ")}
`.trim();

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 90,
    temperature: 0.8,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  };

  const response = await client.send(
    new InvokeModelCommand({
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
      modelId,
    })
  );

  const decoded = new TextDecoder().decode(response.body);
  const data = JSON.parse(decoded);
  let text = String(data?.content?.[0]?.text || "")
    .replace(/```/g, "")
    .replace(/^"+|"+$/g, "")
    .trim();

  text = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join("\n");

  if (!text || /score|porcentaje|tag|categor/i.test(text) || text.length > 180) {
    return buildFallbackComment({ score, profile });
  }

  return text;
}

exports.handler = async (event) => {
  try {
    const method = getMethod(event);

    if (method === "OPTIONS") {
      return json(200, { ok: true });
    }

    if (method !== "POST") {
      return json(405, { message: "Method Not Allowed" });
    }

    const userId = getUserId(event);
    if (!userId) {
      return json(401, { message: "No auth" });
    }

    const resultsTable = process.env.STORAGE_DYNAMOEB88E40C_NAME;
    if (!resultsTable) {
      return json(500, { message: "Results table missing" });
    }

    const body = parseBody(event);
    const mode = String(body.mode || "SOLO").trim().toUpperCase();
    const profile = sanitizeProfile(body.profile);
    const evaluation = evaluateAnswers(body.answers);
    const createdAt = new Date().toISOString();

    let comment = buildFallbackComment({
      score: evaluation.score,
      profile,
    });

    try {
      const aiComment = await buildAiComment({
        score: evaluation.score,
        level: evaluation.level,
        tags: evaluation.tags,
        profile,
      });

      if (aiComment) {
        comment = aiComment;
      }
    } catch (error) {
      console.log("BEDROCK_FAIL", error?.name || error?.message || error);
    }

    const item = {
      userId,
      createdAt,
      mode,
      quizVersion: evaluation.quizVersion,
      score: evaluation.score,
      level: evaluation.level,
      rawTags: evaluation.rawTags,
      tags: evaluation.tags,
      answers: evaluation.answers,
      profile,
      comment,
    };

    await ddb.send(
      new PutCommand({
        TableName: resultsTable,
        Item: item,
      })
    );

    return json(200, {
      createdAt,
      mode,
      quizVersion: evaluation.quizVersion,
      score: evaluation.score,
      level: evaluation.level,
      rawTags: evaluation.rawTags,
      tags: evaluation.tags,
      comment,
      profile,
    });
  } catch (error) {
    console.error("SUBMIT_ERROR", error);
    return json(500, {
      message: error?.name || "Internal",
      detail: error?.message || String(error),
    });
  }
};
