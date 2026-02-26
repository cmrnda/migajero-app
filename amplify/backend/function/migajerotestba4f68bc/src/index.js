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
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    const version = event?.queryStringParameters?.v || "v1";

    const quiz = {
      version,
      title: "Test Migajero",
      disclaimer: "Solo entretenimiento. No es diagnóstico psicológico.",
      questions: [
        {
          id: "q1",
          text: "Te responden cada rato con un “jajaja” y nada más. Tú:",
          options: [
            { id: "a", text: "Me basta pues, al menos contestó.", score: 10, tags: ["breadcrumbing", "esperanza"] },
            { id: "b", text: "Le respondo tranqui, sin apurarme.", score: 5, tags: ["ambiguedad"] },
            { id: "c", text: "No respondo. Yo también tengo cosas que hacer.", score: 0, tags: ["autoestima", "limites"] }
          ]
        },
        {
          id: "q2",
          text: "Te dicen “no quiero nada serio” pero te tratan como pareja. Tú:",
          options: [
            { id: "a", text: "Sigo nomás… capaz cambia pues.", score: 10, tags: ["esperanza", "ambiguedad"] },
            { id: "b", text: "Le pregunto directo: ¿qué somos al final?", score: 4, tags: ["limites"] },
            { id: "c", text: "Sin claridad no hay trato. Me voy con estilo.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q3",
          text: "Te cancelan a última hora y te dicen “ya será” (sin fecha). Tú:",
          options: [
            { id: "a", text: "Todo bien, yo entiendo… (otra vez).", score: 9, tags: ["breadcrumbing"] },
            { id: "b", text: "Ok, pero tú pon día y hora de una.", score: 3, tags: ["limites"] },
            { id: "c", text: "Perfecto, yo también cancelé mi interés.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q4",
          text: "Solo te escriben de noche con “¿qué haces?” Tú:",
          options: [
            { id: "a", text: "Estoy libre, obvio pues ", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Respondo, pero con distancia, ya.", score: 6, tags: ["ambiguedad"] },
            { id: "c", text: "Modo avión. Mañana hablamos con luz del día.", score: 0, tags: ["limites"] }
          ]
        },
        {
          id: "q5",
          text: "Te reaccionan historias, pero conversar… nada. Tú:",
          options: [
            { id: "a", text: "Eso ya es señal pues, ¿no? 🥹", score: 9, tags: ["esperanza"] },
            { id: "b", text: "Les sigo el jueguito un rato.", score: 5, tags: ["ambiguedad"] },
            { id: "c", text: "Reacción no es interés. Next, gracias.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q6",
          text: "Te dicen “te extraño” pero no hacen nada por verte. Tú:",
          options: [
            { id: "a", text: "Yo sí siento, me quedo esperando pues.", score: 10, tags: ["esperanza", "ambiguedad"] },
            { id: "b", text: "Le digo: hechos > palabras, ya.", score: 3, tags: ["limites"] },
            { id: "c", text: "Te extraño yo: mi paz mental.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q7",
          text: "Te dejan en visto y vuelven dos días después como si nada. Tú:",
          options: [
            { id: "a", text: "Yo contesto igual… no pasa nada, che.", score: 9, tags: ["breadcrumbing"] },
            { id: "b", text: "Contesto corto. Que se note el mensaje.", score: 5, tags: ["limites"] },
            { id: "c", text: "No respondo. Punto y aparte.", score: 0, tags: ["autoestima", "limites"] }
          ]
        },
        {
          id: "q8",
          text: "Te invitan solo cuando se les cae el plan principal. Tú:",
          options: [
            { id: "a", text: "Acepto. Soy plan B pero con corazón.", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Depende… una más y ya no.", score: 5, tags: ["limites"] },
            { id: "c", text: "No soy plan de emergencia, gracias.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q9",
          text: "Te hablan solo cuando están tristes o aburridos. Tú:",
          options: [
            { id: "a", text: "Aquí estoy. Siempre. Ya pues 🫠", score: 10, tags: ["esperanza"] },
            { id: "b", text: "Apoyo, pero tampoco soy 24/7.", score: 4, tags: ["limites"] },
            { id: "c", text: "No soy terapia gratis, con cariño.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q10",
          text: "Te dicen: “Eres increíble, pero…” Tú:",
          options: [
            { id: "a", text: "Me quedo por el “increíble” nomás.", score: 9, tags: ["ambiguedad", "esperanza"] },
            { id: "b", text: "Le pregunto: ¿qué significa ese “pero”?", score: 4, tags: ["limites"] },
            { id: "c", text: "Gracias. Siguiente capítulo de mi vida.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q11",
          text: "Te piden fotos/atención, pero compromiso cero. Tú:",
          options: [
            { id: "a", text: "Accedo… total me quiere, ¿no? ", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Negocio mínimo respeto, de una.", score: 4, tags: ["limites"] },
            { id: "c", text: "No doy beneficios sin contrato.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q12",
          text: "Cuando preguntas qué son, te dicen “andamos viendo”. Tú:",
          options: [
            { id: "a", text: "Ok… sigo viendo también (solo yo).", score: 10, tags: ["ambiguedad", "esperanza"] },
            { id: "b", text: "Pido timeline y claridad, sin drama.", score: 4, tags: ["limites"] },
            { id: "c", text: "Si no hay definición, no hay acceso.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q13",
          text: "Te ghostean y vuelven con “perdón, estaba full”. Tú:",
          options: [
            { id: "a", text: "Se entiende pues… la vida es dura 🥲", score: 10, tags: ["breadcrumbing"] },
            { id: "b", text: "Ok, pero no me desaparezcas así, ya.", score: 4, tags: ["limites"] },
            { id: "c", text: "Full estaba yo… de paciencia.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q14",
          text: "En privado te tratan bonito, pero en público ni te ubican. Tú:",
          options: [
            { id: "a", text: "Mientras sea bonito… me basta pues.", score: 9, tags: ["ambiguedad"] },
            { id: "b", text: "Lo converso, no me late ese jueguito.", score: 4, tags: ["limites"] },
            { id: "c", text: "Si me escondes, me pierdes. Fin.", score: 0, tags: ["autoestima"] }
          ]
        },
        {
          id: "q15",
          text: "Te prometen: “la próxima semana sí” y nunca cumplen. Tú:",
          options: [
            { id: "a", text: "Yo espero… soy paciente profesional", score: 10, tags: ["esperanza"] },
            { id: "b", text: "Una última, pero con fecha fija.", score: 5, tags: ["limites"] },
            { id: "c", text: "Promesa sin acción = puro cuento.", score: 0, tags: ["autoestima"] }
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
