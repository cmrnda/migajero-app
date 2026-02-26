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

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}
function httpMethod(event) {
  return event?.httpMethod || event?.requestContext?.http?.method || "GET";
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
function resolveProfilesTable() {
  return process.env.STORAGE_DYNAMOACF73435_NAME || null; // migajeroprofiles-dev
}
function resolveResultsTable() {
  return process.env.STORAGE_DYNAMOEB88E40C_NAME || null; // migajeroresults-dev
}
function toInt(v, def) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(1, Math.min(50, Math.floor(n))); // límite sano
}

const REGION = process.env.AWS_REGION || process.env.REGION;
const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION }),
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

    if (!PROFILES_TABLE) return json(500, { message: "No PROFILES_TABLE" });

    const qs = event?.queryStringParameters || {};
    const only = (qs.only || "").toString();          // "last"
    const limit = qs.limit ? toInt(qs.limit, 10) : 0; // 0 = no traer lista

    if (method === "GET") {
      const profileResp = await ddb.send(
        new GetCommand({ TableName: PROFILES_TABLE, Key: { userId } })
      );

      let lastResult = null;
      let results = null;

      if (RESULTS_TABLE) {
        // si pidieron limit -> traemos lista, si no -> solo last
        const queryLimit = limit > 0 ? limit : 1;

        const q = await ddb.send(
          new QueryCommand({
            TableName: RESULTS_TABLE,
            KeyConditionExpression: "userId = :u",
            ExpressionAttributeValues: { ":u": userId },
            ScanIndexForward: false, // DESC por createdAt
            Limit: queryLimit,
          })
        );

        const items = q.Items || [];
        lastResult = items[0] || null;
        if (limit > 0) results = items;
      }

      // modo compacto: solo lastResult
      if (only === "last") return json(200, { lastResult });

      // modo normal
      return json(200, {
        profile: profileResp.Item?.profile ?? { fullName: null, age: null, gender: null },
        lastResult,
        ...(results ? { results } : {}),
      });
    }

    if (method === "PUT") {
      const body = parseBody(event);

      const fullName = (body.fullName ?? "").toString().trim();
      const age = Number(body.age);
      const gender = (body.gender ?? "").toString().trim(); // F | M | X | N

      if (fullName.length < 2) return json(400, { message: "fullName inválido" });
      if (!Number.isFinite(age) || age < 13 || age > 99) return json(400, { message: "age inválido" });
      if (!gender) return json(400, { message: "gender inválido" });

      const item = {
        userId,
        updatedAt: new Date().toISOString(),
        profile: { fullName, age, gender },
      };

      await ddb.send(new PutCommand({ TableName: PROFILES_TABLE, Item: item }));
      return json(200, { ok: true, profile: item.profile });
    }

    return json(405, { message: "Method Not Allowed" });
  } catch (e) {
    console.error("ME_ERROR", e);
    return json(500, { message: e?.name || "Internal", detail: e?.message || String(e) });
  }
};
