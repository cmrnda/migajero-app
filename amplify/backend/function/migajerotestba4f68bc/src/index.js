const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

function buildQuizDefinition() {
  return {
    version: "v2",
    title: "Test Migajero",
    disclaimer: "Es solo entretenimiento. No reemplaza ayuda profesional ni es diagnóstico.",
    questions: [
      {
        id: "q1",
        text: "Te responden con un “jajaja” y nada más. Tú:",
        options: [
          { id: "a", text: "Me basta, al menos respondió." },
          { id: "b", text: "Respondo tranqui y sigo a lo mío." },
          { id: "c", text: "No respondo. Tengo mejores cosas que hacer." },
        ],
      },
      {
        id: "q2",
        text: "Te dicen “no quiero nada serio” pero te tratan como pareja. Tú:",
        options: [
          { id: "a", text: "Sigo ahí, capaz cambia." },
          { id: "b", text: "Pregunto directo qué está pasando." },
          { id: "c", text: "Sin claridad no me quedo." },
        ],
      },
      {
        id: "q3",
        text: "Te cancelan a última hora y te dicen “ya será” sin fecha. Tú:",
        options: [
          { id: "a", text: "Todo bien, yo entiendo… otra vez." },
          { id: "b", text: "Ok, pero tú propones día y hora." },
          { id: "c", text: "Perfecto. Yo también cancelé mi interés." },
        ],
      },
      {
        id: "q4",
        text: "Solo te escriben de noche con “¿qué haces?”. Tú:",
        options: [
          { id: "a", text: "Estoy libre, ya pues… caigo." },
          { id: "b", text: "Respondo, pero sin regalarme." },
          { id: "c", text: "Modo avión. Que hablen de día." },
        ],
      },
      {
        id: "q5",
        text: "Te reaccionan historias, pero conversar nada. Tú:",
        options: [
          { id: "a", text: "Eso ya cuenta como interés, ¿no?" },
          { id: "b", text: "Les sigo el juego un rato." },
          { id: "c", text: "Reacción no es interés. Siguiente." },
        ],
      },
      {
        id: "q6",
        text: "Te dicen “te extraño” pero no hacen nada por verte. Tú:",
        options: [
          { id: "a", text: "Me quedo esperando, capaz esta vez sí." },
          { id: "b", text: "Le recuerdo que hechos matan palabras." },
          { id: "c", text: "Yo extraño mi paz mental, gracias." },
        ],
      },
      {
        id: "q7",
        text: "Te dejan en visto y vuelven dos días después como si nada. Tú:",
        options: [
          { id: "a", text: "Contesto igual, total no pasa nada." },
          { id: "b", text: "Respondo corto y que se note." },
          { id: "c", text: "No respondo. Punto final." },
        ],
      },
      {
        id: "q8",
        text: "Te invitan solo cuando se les cae el plan principal. Tú:",
        options: [
          { id: "a", text: "Acepto. Igual quiero verle." },
          { id: "b", text: "Depende. Una más y ya no." },
          { id: "c", text: "No soy plan de emergencia." },
        ],
      },
      {
        id: "q9",
        text: "Te hablan solo cuando están tristes o aburridos. Tú:",
        options: [
          { id: "a", text: "Aquí estoy siempre, ya pues." },
          { id: "b", text: "Apoyo, pero no soy atención 24/7." },
          { id: "c", text: "No soy terapia gratis, con cariño." },
        ],
      },
      {
        id: "q10",
        text: "Te dicen: “Eres increíble, pero…”. Tú:",
        options: [
          { id: "a", text: "Me quedo con el “increíble”." },
          { id: "b", text: "Pregunto qué significa ese “pero”." },
          { id: "c", text: "Gracias. Sigo con mi vida." },
        ],
      },
      {
        id: "q11",
        text: "Te piden fotos o atención, pero compromiso cero. Tú:",
        options: [
          { id: "a", text: "Accedo… algo debe sentir, ¿no?" },
          { id: "b", text: "Primero respeto, luego vemos." },
          { id: "c", text: "No doy beneficios sin reciprocidad." },
        ],
      },
      {
        id: "q12",
        text: "Cuando preguntas qué son, te dicen “andamos viendo”. Tú:",
        options: [
          { id: "a", text: "Ok, sigo viendo también… solo yo." },
          { id: "b", text: "Pido claridad y un mínimo de orden." },
          { id: "c", text: "Si no hay definición, no hay acceso." },
        ],
      },
      {
        id: "q13",
        text: "Te ghostean y vuelven con “perdón, estaba full”. Tú:",
        options: [
          { id: "a", text: "Se entiende… supongo." },
          { id: "b", text: "Ok, pero no me desaparezcas así." },
          { id: "c", text: "Full estaba yo… de paciencia." },
        ],
      },
      {
        id: "q14",
        text: "En privado te tratan bonito, pero en público ni te ubican. Tú:",
        options: [
          { id: "a", text: "Mientras sea bonito, me basta." },
          { id: "b", text: "Lo hablo. Ese juego no me gusta." },
          { id: "c", text: "Si me escondes, me pierdes." },
        ],
      },
      {
        id: "q15",
        text: "Te prometen “la próxima semana sí” y nunca cumplen. Tú:",
        options: [
          { id: "a", text: "Espero nomás… ya soy paciente profesional." },
          { id: "b", text: "Una última, pero con fecha fija." },
          { id: "c", text: "Promesa sin acción es puro cuento." },
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
      event?.requestContext?.request?.method ||
      "GET";

    if (String(method).toUpperCase() === "OPTIONS") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true }),
      };
    }

    if (String(method).toUpperCase() !== "GET") {
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
      body: JSON.stringify({ message: "Quiz failed" }),
    };
  }
};
