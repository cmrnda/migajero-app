const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

function buildQuizDefinition() {
  return {
    version: "v3",
    title: "Test Migajero",
    disclaimer: "Es solo entretenimiento. No reemplaza ayuda profesional ni es diagnóstico.",
    questions: [
      {
        id: "q1",
        text: "Te responde con sticker, corazoncito o un “jajaja” y desaparece. Tú:",
        options: [
          { id: "a", text: "Yo ya me ilusioné, algo querrá pues.", score: 10, tags: ["breadcrumbing", "hope"] },
          { id: "b", text: "Le sigo el jueguito, a ver si ahora sí.", score: 7, tags: ["ambiguity", "hope"] },
          { id: "c", text: "Respondo normal, pero sin montar película.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Sticker no es plan. Next, hija.", score: 0, tags: ["selfWorth", "boundaries"] },
        ],
      },
      {
        id: "q2",
        text: "Te dice “no quiero nada serio”, pero se pone celos@ si te ve con alguien. Tú:",
        options: [
          { id: "a", text: "Capaz sí siente algo, solo le da miedo.", score: 10, tags: ["hope", "ambiguity"] },
          { id: "b", text: "Me confunde, pero me quedo por si cambia.", score: 7, tags: ["ambiguity"] },
          { id: "c", text: "Le pido claridad, sin novela.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Si quiere beneficios sin título, conmigo no va.", score: 0, tags: ["selfWorth", "boundaries"] },
        ],
      },
      {
        id: "q3",
        text: "Te cancela salida con “se me cruzó un tema” y luego sube historias de paseo. Tú:",
        options: [
          { id: "a", text: "Le creo igual, pobrecit@ capaz sí estaba full.", score: 10, tags: ["breadcrumbing", "ghostingTolerance"] },
          { id: "b", text: "Me hago la loca, pero sigo disponible.", score: 7, tags: ["planB", "hope"] },
          { id: "c", text: "Le digo de una que eso no me cuadra.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Listo, me ahorró tiempo. Chau nomás.", score: 0, tags: ["selfWorth"] },
        ],
      },
      {
        id: "q4",
        text: "Solo te escribe de noche: “tas despiert@?”. Tú:",
        options: [
          { id: "a", text: "Sí pues, siempre estoy para esa persona.", score: 10, tags: ["nightShift", "breadcrumbing"] },
          { id: "b", text: "Respondo, aunque ya sé por dónde va.", score: 7, tags: ["nightShift", "ambiguity"] },
          { id: "c", text: "Contesto al día siguiente, tranqui.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Mi paz mental duerme temprano. Fin.", score: 0, tags: ["selfWorth", "boundaries"] },
        ],
      },
      {
        id: "q5",
        text: "Te busca cuando pelea con su ex, está bajonead@ o necesita desahogarse. Tú:",
        options: [
          { id: "a", text: "Ahí estoy siempre, yo sí sé contener.", score: 10, tags: ["emotionalSupport", "hope"] },
          { id: "b", text: "Le escucho, aunque sé que después se pierde.", score: 7, tags: ["emotionalSupport", "ghostingTolerance"] },
          { id: "c", text: "Le apoyo, pero sin regalarme 24/7.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "No soy terapia gratis, con cariño.", score: 0, tags: ["selfWorth"] },
        ],
      },
      {
        id: "q6",
        text: "Te invita recién cuando se le cayó su plan principal. Tú:",
        options: [
          { id: "a", text: "Acepto feliz, peor es nada ya pues.", score: 10, tags: ["planB", "hope"] },
          { id: "b", text: "Sé que soy plan B, pero igual voy.", score: 7, tags: ["planB", "ambiguity"] },
          { id: "c", text: "Voy solo si me nace, no por ansiedad.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "No soy suplencia sentimental.", score: 0, tags: ["selfWorth"] },
        ],
      },
      {
        id: "q7",
        text: "En chat te trata lindo, pero en público se hace al loco. Tú:",
        options: [
          { id: "a", text: "Mientras por interno sea bonito, me basta.", score: 10, tags: ["hiddenInPublic", "ambiguity"] },
          { id: "b", text: "Me incomoda, pero aguanto un rato más.", score: 7, tags: ["hiddenInPublic", "hope"] },
          { id: "c", text: "Le digo que esa doble cara no va.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Si me escondes, me pierdes. De una.", score: 0, tags: ["selfWorth"] },
        ],
      },
      {
        id: "q8",
        text: "Te deja en visto todo el finde y vuelve el lunes con “recién vi”. Tú:",
        options: [
          { id: "a", text: "No pasa nada, seguro estaba ocupadit@.", score: 10, tags: ["ghostingTolerance", "hope"] },
          { id: "b", text: "Le respondo igual, aunque ya me ardí.", score: 7, tags: ["ghostingTolerance"] },
          { id: "c", text: "Respondo corto para que capte.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Mi dignidad no tiene horario extendido.", score: 0, tags: ["selfWorth", "boundaries"] },
        ],
      },
      {
        id: "q9",
        text: "Te pide fotos, atención, favores o tiempo, pero compromiso cero. Tú:",
        options: [
          { id: "a", text: "Accedo, algo debe sentir pues.", score: 10, tags: ["breadcrumbing", "hope"] },
          { id: "b", text: "Doy un poco, a ver si luego se formaliza.", score: 7, tags: ["ambiguity", "hope"] },
          { id: "c", text: "Primero respeto y coherencia, luego vemos.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Beneficios premium sin reciprocidad, jamás.", score: 0, tags: ["selfWorth"] },
        ],
      },
      {
        id: "q10",
        text: "Ya llevan rato y cuando preguntas qué son, te dicen “andamos viendo, sin presionar”. Tú:",
        options: [
          { id: "a", text: "Me quedo nomás, capaz en algún momento sale.", score: 10, tags: ["ambiguity", "hope"] },
          { id: "b", text: "Me duele, pero sigo porque ya invertí bastante.", score: 7, tags: ["ambiguity", "breadcrumbing"] },
          { id: "c", text: "Pido definición con calma.", score: 3, tags: ["boundaries"] },
          { id: "d", text: "Sin claridad no hay acceso a mi tiempo.", score: 0, tags: ["selfWorth", "boundaries"] },
        ],
      },
    ],
  };
}

exports.handler = async (event) => {
  try {
    const method =
      event?.httpMethod ||
      event?.requestContext?.http?.method ||
      "GET";

    if (method === "OPTIONS") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true }),
      };
    }

    if (method !== "GET") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    const quiz = buildQuizDefinition();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(quiz),
    };
  } catch (error) {
    console.error("QUIZ_ERROR", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "quiz failed" }),
    };
  }
};
