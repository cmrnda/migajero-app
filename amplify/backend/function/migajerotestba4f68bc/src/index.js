const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

exports.handler = async (event) => {
  try {
    const method = event?.httpMethod || "GET";
    if (method === "OPTIONS") {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
    if (method !== "GET") {
      return { statusCode: 405, headers, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    const version = event?.queryStringParameters?.v || "v1";

    const quiz = {
      version,
      title: "Test Migajero",
      disclaimer: "Solo entretenimiento. No es diagnóstico psicológico.",
      questions: [
        {
          id: "q1",
          text: "Te responden cada 8 horas con un “jajaja”. Tú:",
          options: [
            { id: "a", text: "Me basta. Al menos contestó.", score: 10, tags: ["breadcrumbing", "esperanza"] },
            { id: "b", text: "Le respondo tranqui, sin apuro.", score: 5, tags: ["ambiguedad"] },
            { id: "c", text: "No respondo. Yo también tengo vida.", score: 0, tags: ["autoestima", "limites"] }
          ]
        },
        {
          id: "q2",
          text: "Te dicen “no quiero nada serio” pero te tratan como pareja:",
          options: [
            { id: "a", text: "Yo igual sigo, capaz cambia.", score: 10, tags: ["esperanza", "ambiguedad"] },
            { id: "b", text: "Pregunto directo qué somos.", score: 4, tags: ["limites"] },
            { id: "c", text: "Si no hay claridad, me voy con estilo.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q3",
          text: "Te cancelan a última hora y ponen: “otra vez será” (sin fecha):",
          options: [
            { id: "a", text: "Todo bien, yo entiendo… (otra vez).", score: 9, tags: ["breadcrumbing"] },
            { id: "b", text: "Ok, pero tú propones día y hora.", score: 3, tags: ["limites"] },
            { id: "c", text: "Perfecto, yo también cancelé mi interés.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q4",
          text: "Solo te escriben de noche con “¿qué haces?”",
          options: [
            { id: "a", text: "Estoy disponible, obvio 😌", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Respondo, pero con distancia.", score: 6, tags: ["ambiguedad"] },
            { id: "c", text: "Modo avión. Mañana hablamos.", score: 0, tags: ["limites"] }
          ]
        },
        {
          id: "q5",
          text: "Te reaccionan historias pero no conversan:",
          options: [
            { id: "a", text: "Eso ya es señal, ¿no? 🥹", score: 9, tags: ["esperanza"] },
            { id: "b", text: "Les sigo el juego un poco.", score: 5, tags: ["ambiguedad"] },
            { id: "c", text: "Reacción ≠ interés. Next.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q6",
          text: "Te escriben “te extraño” pero no hacen nada:",
          options: [
            { id: "a", text: "Yo sí siento, me quedo esperando.", score: 10, tags: ["esperanza", "ambiguedad"] },
            { id: "b", text: "Les digo: hechos > palabras.", score: 3, tags: ["limites"] },
            { id: "c", text: "Te extraño yo: mi paz mental.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q7",
          text: "Te dejan en visto y vuelven 2 días después como si nada:",
          options: [
            { id: "a", text: "Yo contesto igual, no pasa nada…", score: 9, tags: ["breadcrumbing"] },
            { id: "b", text: "Contesto corto. Que se note.", score: 5, tags: ["limites"] },
            { id: "c", text: "No respondo. Punto.", score: 0, tags: ["autoestima", "limites"] }
          ]
        },
        {
          id: "q8",
          text: "Te invitan cuando se les cae el plan principal:",
          options: [
            { id: "a", text: "Acepto. Soy plan B pero con corazón.", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Depende, pero una más y no.", score: 5, tags: ["limites"] },
            { id: "c", text: "No soy plan de emergencia.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q9",
          text: "Te hablan solo cuando están tristes o aburridos:",
          options: [
            { id: "a", text: "Aquí estoy. Siempre. 🫠", score: 10, tags: ["esperanza"] },
            { id: "b", text: "Apoyo, pero no siempre estoy.", score: 4, tags: ["limites"] },
            { id: "c", text: "No soy terapia gratis.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q10",
          text: "Te dicen: “Eres increíble, pero…”",
          options: [
            { id: "a", text: "Me quedo por el “increíble”.", score: 9, tags: ["ambiguedad", "esperanza"] },
            { id: "b", text: "Pregunto qué significa ese “pero”.", score: 4, tags: ["limites"] },
            { id: "c", text: "Gracias. Siguiente capítulo.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q11",
          text: "Te piden fotos/atención pero no compromiso:",
          options: [
            { id: "a", text: "Accedo, total me quiere… ¿no?", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Negocio condiciones (mínimo respeto).", score: 4, tags: ["limites"] },
            { id: "c", text: "No doy beneficios sin contrato.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q12",
          text: "Te dicen “andamos viendo” cuando preguntas qué son:",
          options: [
            { id: "a", text: "Ok, sigo viendo también… (solo yo).", score: 10, tags: ["ambiguedad", "esperanza"] },
            { id: "b", text: "Pido timeline y claridad.", score: 4, tags: ["limites"] },
            { id: "c", text: "Si no hay definición, no hay acceso.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q13",
          text: "Te ghostean y reaparecen con “perdón, estaba full”:",
          options: [
            { id: "a", text: "Se entiende. La vida es dura. 🥲", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Ok, pero no me desaparezcas así.", score: 4, tags: ["limites"] },
            { id: "c", text: "Full estaba yo… de paciencia.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q14",
          text: "Te tratan bonito en privado, pero en público cero:",
          options: [
            { id: "a", text: "Mientras sea bonito, me basta.", score: 9, tags: ["ambiguedad"] },
            { id: "b", text: "Lo converso, no me gusta ese juego.", score: 4, tags: ["limites"] },
            { id: "c", text: "Si me escondes, me pierdes.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q15",
          text: "Te hacen promesas: “la próxima semana sí” (y nunca):",
          options: [
            { id: "a", text: "Yo espero. Soy paciente profesional.", score: 10, tags: ["esperanza"] },
            { id: "b", text: "Una oportunidad más, con fecha fija.", score: 5, tags: ["limites"] },
            { id: "c", text: "Promesas sin acción = ruido.", score: 0, tags: ["autoestima"] }
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
