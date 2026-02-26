const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

function httpMethod(event) {
  return event?.httpMethod || event?.requestContext?.http?.method || "GET";
}

exports.handler = async (event) => {
  try {
    const method = httpMethod(event);

    if (method === "OPTIONS") {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (method !== "GET") {
      return { statusCode: 405, headers, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    const version =
      event?.queryStringParameters?.v ||
      event?.queryStringParameters?.version ||
      "v1";

    const quiz = {
      version,
      title: "Test Migajero",
      disclaimer: "Solo entretenimiento. No es diagnóstico psicológico.",
      questions: [
        {
          id: "q1",
          text: "Te responden cada 8 horas con un “jajaja”. Tú:",
          options: [
            { id: "a", text: "Sigo ahí, porque algo es algo.", score: 10, tags: ["esperanza", "breadcrumbing"] },
            { id: "b", text: "Le bajo un cambio y me ocupo.", score: 4, tags: ["limites"] },
            { id: "c", text: "Chao, mi paz mental vale.", score: 0, tags: ["autoestima"] }
          ]
        }
      ]
    };

    return { statusCode: 200, headers, body: JSON.stringify(quiz) };
  } catch (e) {
    console.error("QUIZ_ERROR", e);
    return { statusCode: 500, headers, body: JSON.stringify({ message: "quiz failed" }) };
  }
};