/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  STORAGE_DYNAMOEB88E40C_NAME
Amplify Params - DO NOT EDIT */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
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
    breadcrumbing: "Breadcrumbing magnet",
    esperanza: "Esperanza premium",
    ambiguedad: "Relación Schrödinger",
    limites: "Límites activados",
    autoestima: "Autoestima modo ON",
  };
  return (tags || []).map((t) => map[t] || t);
}
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
    .sort((a,b) => b[1]-a[1])
    .slice(0,3)
    .map(([t]) => t);

  return { score, tags: prettyTags(topTags) };
}

const REGION = process.env.AWS_REGION || process.env.REGION;
const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION }),
  { marshallOptions: { removeUndefinedValues: true } }
);

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });
    if (event.httpMethod !== "POST") return json(405, { message: "Method Not Allowed" });

    const userId = pickUserId(event);
    if (!userId) return json(401, { message: "No auth" });

    const body = parseBody(event);
    const answers = body.answers || [];
    if (!Array.isArray(answers) || answers.length === 0) return json(400, { message: "answers requerido" });

    const RESULTS_TABLE = process.env.STORAGE_DYNAMOEB88E40C_NAME;
    if (!RESULTS_TABLE) return json(500, { message: "No RESULTS_TABLE" });

    const { score, tags } = compute(answers);
    const level = levelFromScore(score);
    const createdAt = new Date().toISOString();

    await ddb.send(new PutCommand({
      TableName: RESULTS_TABLE,
      Item: {
        userId,
        createdAt,
        mode: body.mode || "SOLO",
        score,
        level,
        tags,
        profile: body.profile || null,
        comment: "IA pendiente (Bedrock entra después)",
      }
    }));

    return json(200, { score, level, tags, createdAt });
  } catch (e) {
    console.error("SUBMIT_ERROR", e);
    return json(500, { message: e?.name || "Internal", detail: e?.message || String(e) });
  }
};
