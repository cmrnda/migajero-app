/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_DYNAMOACF73435_ARN
	STORAGE_DYNAMOACF73435_NAME
	STORAGE_DYNAMOACF73435_STREAMARN
	STORAGE_DYNAMOEB88E40C_ARN
	STORAGE_DYNAMOEB88E40C_NAME
	STORAGE_DYNAMOEB88E40C_STREAMARN
Amplify Params - DO NOT EDIT */const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function httpMethod(event) {
  return event?.httpMethod || event?.requestContext?.http?.method || "POST";
}
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

function resolveResultsTable() {
  return (
    process.env.RESULTS_TABLE ||
    process.env.STORAGE_DYNAMOEB88E40C_NAME || // <- migajeroresults
    process.env.STORAGE_MIGAJERORESULTS_NAME ||
    null
  );
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
    limites: "Límites activados",
    autoestima: "Autoestima modo ON",
  };
  return (tags || []).map(t => map[t] || t);
}
function compute(answers) {
  let raw = 0;
  const tagCount = new Map();
  for (const a of answers || []) {
    raw += Number(a.score || 0);
    for (const t of (a.tags || [])) tagCount.set(t, (tagCount.get(t) || 0) + 1);
  }
  const score = Math.max(0, Math.min(100, raw));
  const topTags = [...tagCount.entries()].sort((a,b) => b[1]-a[1]).slice(0,3).map(([t]) => t);
  return { score, tags: prettyTags(topTags) };
}

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION }),
  { marshallOptions: { removeUndefinedValues: true } }
);

exports.handler = async (event) => {
  try {
    const method = httpMethod(event);
    if (method === "OPTIONS") return json(200, { ok: true });
    if (method !== "POST") return json(405, { message: "Method Not Allowed" });

    const userId = pickUserId(event);
    if (!userId) return json(401, { message: "No auth" });

    const body = parseBody(event);
    const answers = body.answers || [];
    if (!Array.isArray(answers) || answers.length === 0) return json(400, { message: "answers requerido" });

    const RESULTS_TABLE = resolveResultsTable();
    console.log("TABLES", { RESULTS_TABLE });

    if (!RESULTS_TABLE) {
      return json(500, {
        message: "No se pudo resolver RESULTS_TABLE",
        hint: "Dale permisos de Storage a esta función (tabla migajeroresults) o setea env RESULTS_TABLE."
      });
    }

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
        comment: "IA pendiente (Bedrock viene después)",
      }
    }));

    return json(200, { score, level, tags, createdAt });
  } catch (e) {
    console.error("SUBMIT_ERROR", e);
    return json(500, { message: e?.name || "Internal server error", detail: e?.message || String(e) });
  }
};