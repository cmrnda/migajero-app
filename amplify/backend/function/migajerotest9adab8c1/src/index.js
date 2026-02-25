exports.handler = async (event) => {
  const quiz = {
    version: "v1",
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

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS"
    },
    body: JSON.stringify(quiz),
  };
};
