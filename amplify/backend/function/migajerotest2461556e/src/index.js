/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  STORAGE_DYNAMOACF73435_ARN
  STORAGE_DYNAMOACF73435_NAME
  STORAGE_DYNAMOACF73435_STREAMARN
  STORAGE_DYNAMOEB88E40C_ARN
  STORAGE_DYNAMOEB88E40C_NAME
  STORAGE_DYNAMOEB88E40C_STREAMARN
Amplify Params - DO NOT EDIT */

const crypto = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const { pickSoloComment, pickDuoComment, tagLabels } = require("./comment-bank");

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

function getResultsTable() {
  return (
    process.env.STORAGE_DYNAMOEB88E40C_NAME ||
    process.env.RESULTS_TABLE ||
    null
  );
}

function getInviteSecret() {
  return String(process.env.DUO_INVITE_SECRET || "").trim();
}

function verifyInviteToken(token) {
  const secret = getInviteSecret();
  if (!secret) {
    throw new Error("Duo invite secret missing");
  }

  const [encodedPayload, receivedSignature] = String(token || "").split(".");
  if (!encodedPayload || !receivedSignature) {
    throw new Error("Invitación inválida");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error("Invitación inválida");
  }

  let payload = null;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );
  } catch {
    throw new Error("Invitación inválida");
  }

  if (!payload?.u || !payload?.c || !payload?.exp) {
    throw new Error("Invitación inválida");
  }

  if (Date.now() > Number(payload.exp)) {
    throw new Error("La invitación ya venció");
  }

  return {
    inviterUserId: String(payload.u),
    inviterCreatedAt: String(payload.c),
  };
}

function buildQuizDefinition() {
  return {
    version: "v4",
    title: "Test Migajero",
    disclaimer:
      "Es solo entretenimiento. No reemplaza ayuda profesional ni es diagnóstico.",
    questions: [
      {
        id: "q1",
        text: "Te responde con sticker, corazoncito o un “jajaja” y desaparece. Tú:",
        options: [
          {
            id: "a",
            text: "Yo ya me ilusioné, algo querrá pues.",
            weight: 10,
            tagKeys: ["breadcrumbing", "hope", "validationSeeking"],
          },
          {
            id: "b",
            text: "Le sigo el jueguito, a ver si ahora sí.",
            weight: 7,
            tagKeys: ["ambiguity", "hope", "lowEffort"],
          },
          {
            id: "c",
            text: "Respondo normal, pero sin montar película.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Sticker no es plan. Next, casera.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q2",
        text: "Te dice “no quiero nada serio”, pero se pone celos@ si te ve con alguien. Tú:",
        options: [
          {
            id: "a",
            text: "Capaz sí siente algo, solo le da miedo.",
            weight: 10,
            tagKeys: ["hope", "ambiguity", "futureFaking"],
          },
          {
            id: "b",
            text: "Me confunde, pero me quedo por si cambia.",
            weight: 7,
            tagKeys: ["ambiguity", "validationSeeking", "hope"],
          },
          {
            id: "c",
            text: "Le pido claridad, sin novela.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Si quiere beneficios sin título, conmigo no va.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q3",
        text: "Te cancela salida con “se me cruzó un tema” y luego sube historias de paseo. Tú:",
        options: [
          {
            id: "a",
            text: "Le creo igual, pobrecit@ capaz sí estaba full.",
            weight: 10,
            tagKeys: ["ghostingTolerance", "excuseBuying", "inconsistency"],
          },
          {
            id: "b",
            text: "Me hago la loca, pero sigo disponible.",
            weight: 7,
            tagKeys: ["planB", "hope", "excuseBuying"],
          },
          {
            id: "c",
            text: "Le digo de una que eso no me cuadra.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Listo, me ahorró tiempo. Chau nomás.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q4",
        text: "Solo te escribe de noche: “tas despiert@?”. Tú:",
        options: [
          {
            id: "a",
            text: "Sí pues, siempre estoy para esa persona.",
            weight: 10,
            tagKeys: ["nightShift", "breadcrumbing", "lowEffort"],
          },
          {
            id: "b",
            text: "Respondo, aunque ya sé por dónde va.",
            weight: 7,
            tagKeys: ["nightShift", "ambiguity", "validationSeeking"],
          },
          {
            id: "c",
            text: "Contesto al día siguiente, tranqui.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Mi paz mental duerme temprano. Fin.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q5",
        text: "Te busca cuando pelea con su ex, está bajonead@ o necesita desahogarse. Tú:",
        options: [
          {
            id: "a",
            text: "Ahí estoy siempre, yo sí sé contener.",
            weight: 10,
            tagKeys: ["emotionalSupport", "hope", "validationSeeking"],
          },
          {
            id: "b",
            text: "Le escucho, aunque sé que después se pierde.",
            weight: 7,
            tagKeys: ["emotionalSupport", "ghostingTolerance", "ambiguity"],
          },
          {
            id: "c",
            text: "Le apoyo, pero sin regalarme 24/7.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "No soy terapia gratis, con cariño.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q6",
        text: "Te invita recién cuando se le cayó su plan principal. Tú:",
        options: [
          {
            id: "a",
            text: "Acepto feliz, peor es nada ya pues.",
            weight: 10,
            tagKeys: ["planB", "hope", "lowEffort"],
          },
          {
            id: "b",
            text: "Sé que soy plan B, pero igual voy.",
            weight: 7,
            tagKeys: ["planB", "ambiguity", "validationSeeking"],
          },
          {
            id: "c",
            text: "Voy solo si me nace, no por ansiedad.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "No soy suplencia sentimental.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q7",
        text: "En chat te trata lindo, pero en público se hace al loco. Tú:",
        options: [
          {
            id: "a",
            text: "Mientras por interno sea bonito, me basta.",
            weight: 10,
            tagKeys: ["hiddenInPublic", "ambiguity", "validationSeeking"],
          },
          {
            id: "b",
            text: "Me incomoda, pero aguanto un rato más.",
            weight: 7,
            tagKeys: ["hiddenInPublic", "hope", "inconsistency"],
          },
          {
            id: "c",
            text: "Le digo que esa doble cara no va.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Si me escondes, me pierdes. De una.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q8",
        text: "Te deja en visto todo el finde y vuelve el lunes con “recién vi”. Tú:",
        options: [
          {
            id: "a",
            text: "No pasa nada, seguro estaba ocupadit@.",
            weight: 10,
            tagKeys: ["ghostingTolerance", "hope", "excuseBuying"],
          },
          {
            id: "b",
            text: "Le respondo igual, aunque ya me ardí.",
            weight: 7,
            tagKeys: ["ghostingTolerance", "inconsistency", "ambiguity"],
          },
          {
            id: "c",
            text: "Respondo corto para que capte.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Mi dignidad no tiene horario extendido.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q9",
        text: "Te pide fotos, atención, favores o tiempo, pero compromiso cero. Tú:",
        options: [
          {
            id: "a",
            text: "Accedo, algo debe sentir pues.",
            weight: 10,
            tagKeys: ["breadcrumbing", "hope", "validationSeeking"],
          },
          {
            id: "b",
            text: "Doy un poco, a ver si luego se formaliza.",
            weight: 7,
            tagKeys: ["ambiguity", "hope", "futureFaking"],
          },
          {
            id: "c",
            text: "Primero respeto y coherencia, luego vemos.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Beneficios premium sin reciprocidad, jamás.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
      {
        id: "q10",
        text: "Ya llevan rato y cuando preguntas qué son, te dicen “andamos viendo, sin presionar”. Tú:",
        options: [
          {
            id: "a",
            text: "Me quedo nomás, capaz en algún momento sale.",
            weight: 10,
            tagKeys: ["ambiguity", "hope", "futureFaking"],
          },
          {
            id: "b",
            text: "Me duele, pero sigo porque ya invertí bastante.",
            weight: 7,
            tagKeys: ["ambiguity", "breadcrumbing", "excuseBuying"],
          },
          {
            id: "c",
            text: "Pido definición con calma.",
            weight: 3,
            tagKeys: ["boundaries", "selfWorth"],
          },
          {
            id: "d",
            text: "Sin claridad no hay acceso a mi tiempo.",
            weight: 0,
            tagKeys: ["selfWorth", "boundaries"],
          },
        ],
      },
    ],
  };
}

function getLevelFromScore(score) {
  if (score <= 10) return "Antimigajas profesional";
  if (score <= 25) return "Casi inmune al cuento";
  if (score <= 45) return "Migajer@ en observación";
  if (score <= 65) return "Migajer@ funcional";
  if (score <= 85) return "Migajer@ con carnet";
  return "Leyenda nacional del migajeo";
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
  const questionMap = new Map(
    questions.map((question) => [question.id, question])
  );
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
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([tagKey]) => tagKey);

  const tags = rawTags.map((tagKey) => tagLabels[tagKey] || tagKey);
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

function normalizeSoloResult(item) {
  if (!item) return null;

  return {
    userId: item.userId ?? null,
    createdAt: item.createdAt ?? null,
    mode: item.mode ?? null,
    quizVersion: item.quizVersion ?? null,
    score: Number.isFinite(Number(item.score)) ? Number(item.score) : 0,
    level: item.level ?? null,
    rawTags: Array.isArray(item.rawTags) ? item.rawTags : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    comment: item.comment ?? null,
    profile: item.profile ?? null,
  };
}

async function getResultByKey(resultsTable, userId, createdAt) {
  const response = await ddb.send(
    new GetCommand({
      TableName: resultsTable,
      Key: {
        userId,
        createdAt,
      },
    })
  );

  return normalizeSoloResult(response.Item);
}

async function getLatestSoloResult(resultsTable, userId) {
  const response = await ddb.send(
    new QueryCommand({
      TableName: resultsTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false,
      Limit: 12,
    })
  );

  const items = Array.isArray(response.Items) ? response.Items : [];
  const item = items.find((entry) => entry?.mode !== "DUO") || null;

  return normalizeSoloResult(item);
}

function toComparisonSide(result, fallbackName) {
  return {
    userId: result.userId,
    createdAt: result.createdAt,
    displayName: sanitizeName(result?.profile?.fullName) || fallbackName,
    score: Number.isFinite(Number(result?.score)) ? Number(result.score) : 0,
    level: result?.level ?? null,
    rawTags: Array.isArray(result?.rawTags) ? result.rawTags : [],
    tags: Array.isArray(result?.tags) ? result.tags : [],
  };
}

function buildDuoMeta(leftResult, rightResult) {
  const left = toComparisonSide(leftResult, "Persona A");
  const right = toComparisonSide(rightResult, "Persona B");

  if (left.score > right.score) {
    return {
      left,
      right,
      winner: "LEFT",
      winnerName: left.displayName,
      scoreGap: left.score - right.score,
    };
  }

  if (right.score > left.score) {
    return {
      left,
      right,
      winner: "RIGHT",
      winnerName: right.displayName,
      scoreGap: right.score - left.score,
    };
  }

  return {
    left,
    right,
    winner: "TIE",
    winnerName: null,
    scoreGap: 0,
  };
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

    const resultsTable = getResultsTable();
    if (!resultsTable) {
      return json(500, { message: "Results table missing" });
    }

    const body = parseBody(event);
    const mode = String(body.mode || "SOLO").trim().toUpperCase();

    if (mode === "SOLO") {
      const profile = sanitizeProfile(body.profile);
      const evaluation = evaluateAnswers(body.answers);
      const createdAt = new Date().toISOString();

      const comment = pickSoloComment({
        score: evaluation.score,
        profile,
        rawTags: evaluation.rawTags,
        tags: evaluation.tags,
      });

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
    }

    if (mode === "DUO") {
      const inviteToken = String(body.inviteToken || "").trim();
      if (!inviteToken) {
        return json(400, { message: "Invitación inválida" });
      }

      const decodedInvite = verifyInviteToken(inviteToken);

      if (decodedInvite.inviterUserId === userId) {
        return json(400, { message: "No puedes compararte contigo mism@" });
      }

      const inviterResult = await getResultByKey(
        resultsTable,
        decodedInvite.inviterUserId,
        decodedInvite.inviterCreatedAt
      );

      if (!inviterResult || inviterResult.mode === "DUO") {
        return json(404, {
          message: "El resultado de invitación ya no existe",
        });
      }

      const inviteeResult = await getLatestSoloResult(resultsTable, userId);

      if (!inviteeResult) {
        return json(400, { message: "Primero debes completar tu test" });
      }

      const duoMeta = buildDuoMeta(inviterResult, inviteeResult);
      const comment = pickDuoComment(duoMeta);

      return json(200, {
        mode: "DUO",
        createdAt: new Date().toISOString(),
        leftResult: duoMeta.left,
        rightResult: duoMeta.right,
        winner: duoMeta.winner,
        winnerName: duoMeta.winnerName,
        winnerLabel:
          duoMeta.winner === "TIE"
            ? "Empate técnico"
            : "Más migajer@ del duelo",
        scoreGap: duoMeta.scoreGap,
        comment,
      });
    }

    return json(400, { message: "Modo inválido" });
  } catch (error) {
    console.error("SUBMIT_ERROR", error);
    return json(500, {
      message: error?.name || "Internal",
      detail: error?.message || String(error),
    });
  }
};
