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
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
};

function httpMethod(event) {
  return event?.httpMethod || event?.requestContext?.http?.method || "GET";
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

// ✅ RESOLVER tablas (prioridad: env manual -> env storage de amplify)
function resolveProfilesTable() {
  return (
    process.env.PROFILES_TABLE ||
    process.env.STORAGE_DYNAMOACF73435_NAME || // <- migajeroprofiles
    process.env.STORAGE_MIGAJEROPROFILES_NAME ||
    null
  );
}
function resolveResultsTable() {
  return (
    process.env.RESULTS_TABLE ||
    process.env.STORAGE_DYNAMOEB88E40C_NAME || // <- migajeroresults
    process.env.STORAGE_MIGAJERORESULTS_NAME ||
    null
  );
}

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION }),
  { marshallOptions: { removeUndefinedValues: true } }
);

exports.handler = async (event) => {
  try {
    const method = httpMethod(event);
    if (method === "OPTIONS") return json(200, { ok: true });

    const userId = pickUserId(event);
    if (!userId) return json(401, { message: "No auth" });

    const PROFILES_TABLE = resolveProfilesTable();
    const RESULTS_TABLE = resolveResultsTable();

    // 🔎 debug útil en logs
    console.log("TABLES", { PROFILES_TABLE, RESULTS_TABLE });

    if (!PROFILES_TABLE) {
      return json(500, {
        message: "No se pudo resolver PROFILES_TABLE",
        hint: "Dale permisos de Storage a esta función (tabla migajeroprofiles) o setea env PROFILES_TABLE."
      });
    }

    if (method === "GET") {
      const profileResp = await ddb.send(new GetCommand({
        TableName: PROFILES_TABLE,
        Key: { userId }
      }));

      let lastResult = null;
      if (RESULTS_TABLE) {
        try {
          const lastResp = await ddb.send(new QueryCommand({
            TableName: RESULTS_TABLE,
            KeyConditionExpression: "userId = :u",
            ExpressionAttributeValues: { ":u": userId },
            ScanIndexForward: false,
            Limit: 1
          }));
          lastResult = lastResp.Items?.[0] || null;
        } catch (e) {
          console.log("LAST_RESULT_FAIL", e?.name || e?.message || e);
        }
      }

      return json(200, {
        profile: profileResp.Item?.profile ?? { fullName: null, age: null, gender: null },
        lastResult
      });
    }

    if (method === "PUT") {
      const body = parseBody(event);

      const fullName = (body.fullName ?? "").toString().trim();
      const age = Number(body.age);
      const gender = (body.gender ?? "").toString().trim();

      if (fullName.length < 2) return json(400, { message: "fullName inválido" });
      if (!Number.isFinite(age) || age < 13 || age > 99) return json(400, { message: "age inválido" });
      if (!gender) return json(400, { message: "gender inválido" });

      const item = {
        userId,
        updatedAt: new Date().toISOString(),
        profile: { fullName, age, gender }
      };

      await ddb.send(new PutCommand({
        TableName: PROFILES_TABLE,
        Item: item
      }));

      return json(200, { ok: true, profile: item.profile });
    }

    return json(405, { message: "Method Not Allowed" });
  } catch (e) {
    console.error("ME_ERROR", e);
    // ⚠️ deja mensaje real para que lo veas en Network si quieres
    return json(500, { message: e?.name || "Internal server error", detail: e?.message || String(e) });
  }
};