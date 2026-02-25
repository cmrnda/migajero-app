const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function pickUserId(event) {
  return (
    event?.requestContext?.identity?.cognitoIdentityId ||
    event?.requestContext?.authorizer?.claims?.sub ||
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
  // MVP ultra simple: suma scores que te manda el front ya “resueltos”
  // (luego lo hacemos robusto con el quiz real en backend)
  let raw = 0;
  const tagCount = new Map();

  for (const a of answers || []) {
    raw += Number(a.score || 0);
    for (const t of (a.tags || [])) tagCount.set(t, (tagCount.get(t) || 0) + 1);
  }

  // clamp 0-100
  const score = Math.max(0, Math.min(100, raw));
  const topTags = [...tagCount.entries()].sort((a,b) => b[1]-a[1]).slice(0,3).map(([t]) => t);

  return { score, tags: prettyTags(topTags) };
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS"
        },
        body: JSON.stringify({ ok: true }),
      };
    }

    const userId = pickUserId(event);
    if (!userId) return { statusCode: 401, body: JSON.stringify({ message: "No auth" }) };

    const body = JSON.parse(event.body || "{}");
    const answers = body.answers || [];

    if (!Array.isArray(answers) || answers.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "answers requerido" }) };
    }

    const { score, tags } = compute(answers);
    const level = levelFromScore(score);

    const createdAt = new Date().toISOString();

    // Estas env vars las inyecta Amplify al dar permisos de Storage.
    const RESULTS_TABLE = process.env.STORAGE_MIGAJERORESULTS_NAME;

    await ddb.send(new PutCommand({
      TableName: RESULTS_TABLE,
      Item: {
        userId,
        createdAt,
        mode: body.mode || "SOLO",
        score,
        level,
        tags,
        comment: "IA pendiente (Bedrock viene después)",
      }
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ score, level, tags }),
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
  }
};
