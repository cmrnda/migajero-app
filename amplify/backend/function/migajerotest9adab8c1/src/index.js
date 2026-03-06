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
    "GET"
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

function getProfilesTable() {
  return process.env.STORAGE_DYNAMOACF73435_NAME || null;
}

function getResultsTable() {
  return process.env.STORAGE_DYNAMOEB88E40C_NAME || null;
}

function toSafeLimit(value, fallback = 10) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(50, Math.floor(parsed)));
}

function sanitizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60);
}

function sanitizeGender(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function sanitizeAge(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed);
}

function validateProfileInput(body) {
  const fullName = sanitizeName(body.fullName);
  const age = sanitizeAge(body.age);
  const gender = sanitizeGender(body.gender);
  const allowedGenders = new Set(["F", "M", "X", "N"]);

  if (fullName.length < 2) {
    return { ok: false, message: "Nombre inválido" };
  }

  if (!Number.isFinite(age) || age < 13 || age > 99) {
    return { ok: false, message: "Edad inválida" };
  }

  if (!allowedGenders.has(gender)) {
    return { ok: false, message: "Género inválido" };
  }

  return {
    ok: true,
    value: { fullName, age, gender },
  };
}

function normalizeStoredProfile(profile) {
  return {
    fullName: profile?.fullName ?? null,
    age: Number.isFinite(Number(profile?.age)) ? Number(profile.age) : null,
    gender: profile?.gender ?? null,
  };
}

function normalizeStoredResult(item) {
  if (!item) return null;

  return {
    userId: item.userId ?? null,
    createdAt: item.createdAt ?? null,
    mode: item.mode ?? null,
    score: Number.isFinite(Number(item.score)) ? Number(item.score) : 0,
    level: item.level ?? null,
    rawTags: Array.isArray(item.rawTags) ? item.rawTags : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    comment: item.comment ?? null,
    profile: item.profile ?? null,
  };
}

exports.handler = async (event) => {
  try {
    const method = getMethod(event);

    if (method === "OPTIONS") {
      return json(200, { ok: true });
    }

    const userId = getUserId(event);
    if (!userId) {
      return json(401, { message: "No auth" });
    }

    const profilesTable = getProfilesTable();
    const resultsTable = getResultsTable();

    if (!profilesTable) {
      return json(500, { message: "Profiles table missing" });
    }

    if (method === "GET") {
      const query = event?.queryStringParameters || {};
      const only = String(query.only || "").trim().toLowerCase();
      const limit = query.limit ? toSafeLimit(query.limit, 10) : 0;

      const profileResponse = await ddb.send(
        new GetCommand({
          TableName: profilesTable,
          Key: { userId },
        })
      );

      let lastResult = null;
      let results = null;

      if (resultsTable) {
        const queryLimit = limit > 0 ? limit : 1;

        const resultsResponse = await ddb.send(
          new QueryCommand({
            TableName: resultsTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
              ":userId": userId,
            },
            ScanIndexForward: false,
            Limit: queryLimit,
          })
        );

        const items = Array.isArray(resultsResponse.Items)
          ? resultsResponse.Items.map(normalizeStoredResult)
          : [];

        lastResult = items[0] || null;

        if (limit > 0) {
          results = items;
        }
      }

      if (only === "last") {
        return json(200, { lastResult });
      }

      return json(200, {
        profile: normalizeStoredProfile(profileResponse.Item?.profile),
        lastResult,
        ...(results ? { results } : {}),
      });
    }

    if (method === "PUT") {
      const body = parseBody(event);
      const validation = validateProfileInput(body);

      if (!validation.ok) {
        return json(400, { message: validation.message });
      }

      const item = {
        userId,
        updatedAt: new Date().toISOString(),
        profile: validation.value,
      };

      await ddb.send(
        new PutCommand({
          TableName: profilesTable,
          Item: item,
        })
      );

      return json(200, {
        ok: true,
        profile: item.profile,
      });
    }

    return json(405, { message: "Method Not Allowed" });
  } catch (error) {
    console.error("ME_ERROR", error);
    return json(500, {
      message: error?.name || "Internal",
      detail: error?.message || String(error),
    });
  }
};
