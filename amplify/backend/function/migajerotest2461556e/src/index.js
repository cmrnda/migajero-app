/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  STORAGE_DYNAMOEB88E40C_NAME
Amplify Params - DO NOT EDIT */

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

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function methodOf(event) {
  return (
    event?.httpMethod ||
    event?.requestContext?.http?.method ||
    event?.requestContext?.request?.method ||
    ""
  ).toUpperCase();
}

function pickUserId(event) {
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

function levelFromScore(score) {
  if (score <= 15) return "Cero migajas, pura paz mental";
  if (score <= 35) return "Migajer@ en recuperación";
  if (score <= 60) return "Migajer@ funcional (ojo ahí)";
  if (score <= 80) return "Migajer@ certificad@ (pero reversible)";
  return "Leyenda urbana del migajeo";
}

function prettyTags(tags) {
  const map = {
    breadcrumbing: "Imán de breadcrumbing",
    esperanza: "Esperanza premium",
    ambiguedad: "Relación Schrödinger",
    limites: "Límites activados",
    autoestima: "Autoestima modo ON",
  };
  return (tags || []).map((t) => map[t] || t);
}

// ✅ FALLBACK (por si Bedrock falla)
function fallbackComment({ score, level, tags, profile }) {
  const name = (profile?.fullName || "").toString().trim();
  const who = name ? `${name}, ` : "";
  // 👇 aquí no repetimos score/tags en el tono final; solo lo usamos como fallback básico
  return `${who}ya pues… tranqui nomás 😌
Micro-acción: 24h sin stalkeo y a lo tuyo, de una.
Cierre: límites y amor propio, casera.`;
}

// % real: cada pregunta score 0..10
function compute(answers) {
  let raw = 0;
  const tagCount = new Map();

  for (const a of answers || []) {
    raw += Number(a.score || 0);
    for (const t of a.tags || []) tagCount.set(t, (tagCount.get(t) || 0) + 1);
  }

  const maxRaw = Math.max(1, (answers?.length || 1) * 10);
  const score = Math.max(0, Math.min(100, Math.round((raw / maxRaw) * 100)));

  const topTags = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  return { score, tags: prettyTags(topTags) };
}

async function bedrockComment({ score, level, tags, profile }) {
  const modelId =
    process.env.BEDROCK_MODEL_ID ||
    "anthropic.claude-3-haiku-20240307-v1:0";

  const region =
    process.env.BEDROCK_REGION ||
    process.env.AWS_REGION ||
    process.env.REGION ||
    "us-east-1";

  const client = new BedrockRuntimeClient({ region });

  // ✅ Solo lo usamos como “color”, no para que lo repita
  const safeName = (profile?.fullName || "").toString().trim();
  const nameHint = safeName ? `Nombre (opcional): ${safeName}\n` : "";

  // ✅ Señal suave del resultado, SIN que lo repita textual
  // (sirve para que el comentario cambie según “qué tan migajer@” fue)
  const vibe =
    score >= 85
      ? "alto"
      : score >= 60
        ? "medio-alto"
        : score >= 35
          ? "medio"
          : "bajo";

  const prompt = `
Eres un comentarista boliviano con humor .
Tu tarea: escribir SOLO un comentario corto (2 a 3 líneas) sobre el resultado de un test de “migajer@”.
Reglas estrictas:
- NO repitas números, NO menciones “score”, NO menciones tags, NO listes categorías.
- No insultes, no diagnostiques, no uses lenguaje explícito.
- Usa 1–2 muletillas bolivianas máximo: "hijita", “ya pues”, “tranqui”, “nomás”, “de una”, “ohe”, “casera”, “che”, “yapa”, “como es”.
- Devuelve texto plano, sin comillas, sin markdown.

${nameHint}Intensidad del migajeo: ${vibe}
Nivel interno: ${level}
Contexto interno: ${tags.join(" · ")}
`.trim();

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 90,
    temperature: 0.8,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  };

  const command = new InvokeModelCommand({
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });

  const apiResponse = await client.send(command);
  const decoded = new TextDecoder().decode(apiResponse.body);
  const responseBody = JSON.parse(decoded);

  let out = (responseBody?.content?.[0]?.text || "").trim();

  // ✅ limpieza básica por si el modelo se pone creativo
  out = out.replace(/```/g, "").replace(/^"+|"+$/g, "").trim();

  // ✅ recorte duro para que sea cortito sí o sí
  if (out.length > 180) out = out.slice(0, 177) + "…";
  return out;
}

const REGION = process.env.AWS_REGION || process.env.REGION || "us-east-1";
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

exports.handler = async (event) => {
  try {
    const m = methodOf(event);

    if (m === "OPTIONS") return json(200, { ok: true });
    if (m !== "POST") return json(405, { message: "Method Not Allowed" });

    const userId = pickUserId(event);
    if (!userId) return json(401, { message: "No auth" });

    const body = parseBody(event);
    const answers = body.answers || [];
    if (!Array.isArray(answers) || answers.length === 0)
      return json(400, { message: "answers requerido" });

    const RESULTS_TABLE = process.env.STORAGE_DYNAMOEB88E40C_NAME;
    if (!RESULTS_TABLE) return json(500, { message: "No RESULTS_TABLE" });

    const { score, tags } = compute(answers);
    const level = levelFromScore(score);
    const createdAt = new Date().toISOString();

    let comment = fallbackComment({
      score,
      level,
      tags,
      profile: body.profile || {},
    });

    try {
      const ai = await bedrockComment({
        score,
        level,
        tags,
        profile: body.profile || {},
      });
      if (ai) comment = ai;
    } catch (e) {
      console.log("BEDROCK_FAIL", e?.name || e?.message || e);
    }

    await ddb.send(
      new PutCommand({
        TableName: RESULTS_TABLE,
        Item: {
          userId,
          createdAt,
          mode: body.mode || "SOLO",
          score,
          level,
          tags,
          profile: body.profile || null,
          comment,
        },
      })
    );

    return json(200, { score, level, tags, comment, createdAt });
  } catch (e) {
    console.error("SUBMIT_ERROR", e);
    return json(500, {
      message: e?.name || "Internal",
      detail: e?.message || String(e),
    });
  }
};
