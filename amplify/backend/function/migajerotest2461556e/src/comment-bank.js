function randomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Comment bank is empty");
  }

  return items[Math.floor(Math.random() * items.length)];
}

function applyTemplate(template, tokens) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    return tokens[key] ?? "";
  });
}

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function getShortName(value) {
  const normalized = normalizeName(value);
  if (!normalized) return "";
  return normalized.split(" ")[0];
}

function prependName(text, fullName) {
  const shortName = getShortName(fullName);
  if (!shortName) return text;

  const lines = String(text).split("\n");
  if (lines.length === 0) return text;

  lines[0] = `${shortName}, ${lines[0]}`;
  return lines.join("\n");
}

function getSoloTier(score) {
  if (score <= 10) return "anti";
  if (score <= 25) return "almost";
  if (score <= 45) return "watch";
  if (score <= 65) return "functional";
  if (score <= 85) return "card";
  return "legend";
}

function getGapTier(gap) {
  if (gap <= 0) return "tie";
  if (gap <= 8) return "close";
  if (gap <= 18) return "medium";
  return "wide";
}

function intersect(left, right) {
  const leftSet = new Set(Array.isArray(left) ? left : []);
  return (Array.isArray(right) ? right : []).filter((item) => leftSet.has(item));
}

const tagLabels = {
  breadcrumbing: "Cazadora de migas",
  hope: "Esperanza premium",
  ambiguity: "Relación en veremos",
  boundaries: "Límites despertando",
  selfWorth: "Amor propio presente",
  planB: "Plan B recurrente",
  ghostingTolerance: "Tolerancia al ghosteo",
  nightShift: "Turno nocturno sentimental",
  hiddenInPublic: "Modo secreto en público",
  emotionalSupport: "Soporte emocional gratis",
  lowEffort: "Conexión de mínimo esfuerzo",
  inconsistency: "Señales inconsistentes",
  futureFaking: "Promesas infladas",
  validationSeeking: "Hambre de validación",
  excuseBuying: "Compra de excusas",
};

const soloComments = {
  anti: [
    "estás pilas y no te hacen fila con dos migas.",
    "andas clarit@ y no compras humo con moñito.",
    "tu radar está fino y no te mueves por atención mínima.",
    "vas con la dignidad bien despierta y eso se nota.",
    "no te atrapa cualquier tibieza con empaque bonito.",
    "estás fuera del rango de cuentos baratos.",
    "no te emocionas por señales raquíticas y eso salva vidas.",
    "tu paz mental está jugando de titular.",
    "no te alcanzan dos corazoncitos para desordenarte la vida.",
    "vas con criterio, no con hambre de casi algo.",
    "no te venden humo ni en oferta.",
    "te estás eligiendo mejor que antes y se siente.",
    "andas firme y sin romantizar lo mínimo.",
    "tienes el filtro bien calibrado, casera.",
    "no te quedas donde apenas te tantean.",
    "estás con amor propio bien conectado.",
    "ya no conviertes migas en buffet emocional.",
    "no te compras películas con tráiler nomás.",
  ],
  almost: [
    "vas bastante bien y no te tragas cualquier cuento.",
    "andas casi inmune, aunque a veces te gana la curiosidad.",
    "te mueves mucho mejor, pero todavía te pica la duda.",
    "ya no te deslumbra cualquier mensajito, y eso suma.",
    "vas con el ojo medio entrecerrado y eso ayuda bastante.",
    "andas cerca del lado sano, solo falta sostenerlo más.",
    "ya no te sacuden fácil, aunque una que otra vez tambaleas.",
    "vas mejor que antes, solo no regales tantas chances extra.",
    "te sostienes bastante bien, aunque a ratos te gana la fe.",
    "no estás grave para nada, pero aún dejas una ventanita abierta.",
    "andas casi blindad@, aunque todavía perdonas de yapa.",
    "vas con buen criterio, solo no ignores las señales repetidas.",
    "ya no te emocionas con cualquier mínimo detalle.",
    "estás saliendo bien del hechizo del casi algo.",
    "hay avance serio, solo toca confiar más en lo que ya ves.",
    "no estás para cualquiera, aunque a veces aún dudas de eso.",
    "te frenas más que antes, y ahí está tu ganancia.",
    "vas bien, solo no negocies tanto lo obvio.",
  ],
  watch: [
    "hay focos amarillos por aquí, casera.",
    "andas en observación porque todavía justificas cosas raras.",
    "ya ves algunas señales, pero todavía les haces espacio.",
    "no estás perdid@, pero sí medio flexible con lo dudoso.",
    "andas entre el “ya fue” y el “capaz cambia”.",
    "todavía das beneficio de la duda en combo.",
    "ves las banderas, pero a ratos les dices decoración.",
    "hay esperanza metida donde ya había pistas suficientes.",
    "te quedas un ratito más donde ya olía raro.",
    "andas con media fe en gente medio tibia.",
    "tu corazón a veces se adelanta más que tu criterio.",
    "no estás grave, pero ya toca ajustar el filtro.",
    "todavía conviertes algunas dudas en promesa.",
    "hay señales mezcladas y tú todavía negocias con ellas.",
    "no estás para colapsar, pero sí para replantearte cosas.",
    "ya viste lo raro, solo falta creerte más.",
    "andas dando margen donde ya tocaba distancia.",
    "tu radar funciona, pero todavía le discutes demasiado.",
  ],
  functional: [
    "andas medio flexible con lo que mereces.",
    "te ilusionas con potencial y ahí se arma el enredo.",
    "ya hay migajeo funcional por aquí, seamos honestos.",
    "andas dejando entrar gente que ni sabe qué quiere.",
    "te estás acomodando a lo tibio más de la cuenta.",
    "das espacio premium a señales bien modestas.",
    "te quedas por expectativa cuando faltaban hechos.",
    "andas en modo “a ver qué pasa” demasiado rato.",
    "ya aceptas menos de lo que dices merecer.",
    "te engancha el tal vez más de lo conveniente.",
    "andas regando vínculos con clima bien raro.",
    "te atrapan las dudas largas y las promesas cortas.",
    "normalizaste un poco la ambigüedad y eso pesa.",
    "te vuelves disponible donde la otra parte llega por ratos.",
    "hay cariño, sí, pero también bastante autoengaño suave.",
    "andas sosteniendo algo tibio con energía caliente.",
    "te estás dando menos claridad de la que exiges.",
    "ya no es casualidad, es patrón.",
  ],
  card: [
    "te ilusionas con material bien humilde.",
    "ya estás con carnet de migajer@, no te voy a mentir.",
    "te venden ambigüedad y tú todavía la analizas bonito.",
    "andas apostando fuerte por gente sin stock emocional.",
    "ya das trato premium a señales bien baratas.",
    "te emocionas con mínimos que no justifican tanto.",
    "te quedas donde apenas te abren la puerta.",
    "hay demasiada fe puesta en muy poco material.",
    "andas justificando escasez como si fuera profundidad.",
    "si esto fuera negocio, ya ibas en pérdida emocional.",
    "te adaptas demasiado a la tibieza ajena.",
    "andas con paciencia de santo para ganas de turista.",
    "te haces costumbre de esperar más de la cuenta.",
    "te mueves por casi nada y aun así lo adornas bastante.",
    "hay mucho corazón metido en terreno bien seco.",
    "andas defendiendo lo indefendible con mucha ternura.",
    "sigues encontrando potencial donde faltaba casi todo.",
    "te estás conformando con menos de lo que ya sabes merecer.",
  ],
  legend: [
    "esto ya está potente, no te voy a endulzar.",
    "ya estamos en liga mayor del migajeo.",
    "te dan media señal y tú levantas edificio entero.",
    "hay demasiada fe donde faltaba casi todo.",
    "estás sosteniendo fantasía con presupuesto completo.",
    "si el casi algo pagara alquiler, ya tendrías propiedades.",
    "convertiste migas en menú degustación completo.",
    "andas defendiendo humo premium con convicción admirable.",
    "te quedas donde apenas te miran por ratos.",
    "ya no hablamos de paciencia, sino de aguante olímpico.",
    "hay muchísimo corazón puesto en terreno bien escaso.",
    "te enganchas con la ilusión aunque la realidad llegue a medias.",
    "te dieron casi nada y aun así lo defendiste con tesis.",
    "ya se armó toda una novela con muy poco elenco.",
    "andas financiando vínculos que ni arrancan bien.",
    "estás haciendo arqueología emocional con poquísimas pistas.",
    "te ilusionas tan fuerte que el humo parece estructura.",
    "ya tocaba frenar hace rato, changa.",
  ],
};

const soloTagComments = {
  breadcrumbing: [
    "Te mueves más de la cuenta por atención chiquita y ahí se cuela el humo.",
    "Una miguita bonita todavía te mueve el corazón más de lo debido.",
    "Te enganchan fácil los detalles mínimos cuando vienen con tonito lindo.",
    "A ratos una señal pequeña ya te parece anuncio oficial.",
  ],
  hope: [
    "Le metes bastante fe a escenarios que todavía no pagaron ni alquiler.",
    "Tu esperanza trabaja horas extra incluso con material bien corto.",
    "A veces sostienes la idea de lo que podría ser más que lo que ya es.",
    "Todavía apuestas fuerte a que cambie alguien que ni se acomoda.",
  ],
  ambiguity: [
    "Lo confuso se te puede hacer interesante más tiempo del que conviene.",
    "La relación en veremos todavía te agarra hablando contigo mism@.",
    "Te quedas decodificando señales mezcladas como si fueran mapa del tesoro.",
    "Lo tibio todavía te da tema para pensar demasiado.",
  ],
  boundaries: [
    "Tus límites ya están despertando, solo toca no apagarlos por ternura.",
    "Sabes poner freno; ahora falta sostenerlo sin culpa.",
    "El límite ya lo entiendes, solo no lo aflojes cuando te hablan bonito.",
    "Tu parte sana ya sabe qué hacer, toca hacerle caso más rápido.",
  ],
  selfWorth: [
    "Tu amor propio está empujando fuerte; no lo mandes al banco nomás.",
    "Se nota que una parte tuya ya no quiere aceptar lo mínimo.",
    "Tu dignidad sí sabe el camino, dale más micrófono.",
    "Hay amor propio ahí, solo no lo pongas en silencio por nostalgia.",
  ],
  planB: [
    "No te conviene aceptar con cariño el papel de suplencia sentimental.",
    "Ser plan B te desgasta más de lo que parece aunque lo disfraces de calma.",
    "Cuando te llaman solo porque se cayó lo otro, ahí ya hay dato serio.",
    "Estás dando acceso donde a veces solo te dejan entrar por descarte.",
  ],
  ghostingTolerance: [
    "Estás tolerando desapariciones con una paciencia que ya no te suma.",
    "El ghosteo no debería venir con pase libre a tu energía.",
    "Desaparecer y volver no puede seguir pareciéndote normal.",
    "Te acostumbras demasiado rápido al ida y vuelta sin explicación.",
  ],
  nightShift: [
    "No mereces solo turno nocturno emocional y tú lo sabes.",
    "Que te busquen solo cuando baja la luz no es precisamente plan serio.",
    "El horario de madrugada ya te está diciendo bastante del vínculo.",
    "No todo mensaje nocturno trae intención limpia, pilas.",
  ],
  hiddenInPublic: [
    "Si te esconden en público, ahí hay más dato del que a veces quieres mirar.",
    "No te conviene normalizar cariño privado y desubicación pública.",
    "El modo secreto en público ya debería picarte más fuerte.",
    "No es menor que te quieran por chat y te borren frente al mundo.",
  ],
  emotionalSupport: [
    "No puedes seguir cargando vínculos donde tú haces de soporte y la otra parte de turista.",
    "Escuchar y sostener está bien, pero no cuando te usan de refugio temporal.",
    "Tu energía emocional no debería ser servicio ilimitado.",
    "A veces te buscan más por alivio que por vínculo real, y eso pesa.",
  ],
  lowEffort: [
    "Te están ofreciendo mínimo esfuerzo con empaque bonito y no alcanza.",
    "Lo poco que hacen te está moviendo más de lo que debería.",
    "No conviene premiar tanta flojera emocional con tanta disponibilidad tuya.",
    "Hay poco esfuerzo del otro lado y bastante aguante del tuyo.",
  ],
  inconsistency: [
    "Lo inconsistente ya te está drenando más de lo que reconoces.",
    "Hoy sí, mañana no, y tú todavía sigues acomodando eso dentro de ti.",
    "La incoherencia ajena no puede seguir costándote tanta calma.",
    "Las señales cambiantes ya te traen girando demasiado.",
  ],
  futureFaking: [
    "Las promesas bonitas te jalan, aunque después no aterricen nada.",
    "Te agarra fuerte el plan futuro aunque el presente esté bien flaco.",
    "No todo “ya luego” merece lugar fijo en tu corazón.",
    "A veces compras mañana aunque hoy ya venía raro.",
  ],
  validationSeeking: [
    "Una parte tuya todavía se mueve bastante por sentirte elegid@.",
    "Cuando te validan poquito, eso te puede mover más de lo justo.",
    "No necesitas confirmar tu valor con atención prestada.",
    "La necesidad de sentirte vist@ a veces te baja el filtro.",
  ],
  excuseBuying: [
    "Todavía compras excusas con descuento emocional y eso sale caro después.",
    "Le das mucho margen a explicaciones flojitas por no soltar del todo.",
    "Las excusas ya te están ocupando espacio que merecía claridad.",
    "A veces perdonas por cansancio más que por convicción.",
  ],
};

const soloTierClosers = {
  anti: [
    "Sigue así, que contigo no funciona cualquier show.",
    "No sueltes ese criterio, te está haciendo un favor enorme.",
    "Tu calma está bien cuidada y se nota bonito.",
    "Vas firme, nomás no te me distraigas con luces baratas.",
  ],
  almost: [
    "Solo falta sostener esa claridad cuando aparezca la nostalgia.",
    "Ya casi lo tienes, solo no regales tantas prórrogas.",
    "Confía más en lo que ves y menos en lo que imaginas.",
    "Vas bien, no hace falta rescatar lo tibio.",
  ],
  watch: [
    "Toca ajustar el filtro antes de que esto te consuma más tiempo.",
    "Ya viste suficiente como para no seguir negociando tanto.",
    "No es tragedia, pero sí señal de ajuste urgente.",
    "Pilas, porque todavía estás a tiempo de no alargarlo de más.",
  ],
  functional: [
    "Menos teoría y más hechos, ya pues.",
    "Tu energía vale más que tanta ambigüedad decorada.",
    "No sigas normalizando lo mínimo como si fuera vínculo serio.",
    "Te toca ordenar lo que permites y lo que realmente quieres.",
  ],
  card: [
    "Ya toca salir del modo “capaz cambia” y volver a ti.",
    "No sigas abonando donde apenas te riegan con gotero.",
    "Pilas con regalar versión premium a gente en modo demo.",
    "Tu corazón ya dio demasiado crédito a tan poco respaldo.",
  ],
  legend: [
    "Hay que cerrar esa sucursal del autoengaño con cariño, pero ya.",
    "Tu amor propio merece dejar de hacer fila por tan poco.",
    "No sigas pidiendo yapa de donde ni plato completo hubo.",
    "Hora de salir del festival del casi algo y volver a tu centro.",
  ],
};

const duoComments = {
  tie: [
    "{left} y {right} quedaron casi calcad@s en este deporte del casi algo.",
    "empate técnico entre {left} y {right}; aquí nadie salió a dar cátedra.",
    "{left} y {right} andan en la misma frecuencia emocional, para bien y para mal.",
    "lo de {left} y {right} fue empate sin VAR y con harta fe.",
    "{left} y {right} quedaron tan parejitos que esto parecía trabajo en equipo.",
    "entre {left} y {right} no hubo gran distancia; el enredo fue compartido.",
    "{left} y {right} salieron bien sincronizad@s en esto de justificar señales raras.",
    "empate sabroso entre {left} y {right}; aquí el humo circuló parejo.",
    "{left} y {right} quedaron del mismo vuelo en este versus.",
    "lo de {left} y {right} fue mano a mano real; casi calcad@s.",
    "{left} y {right} terminaron codo a codo en intensidad sentimental.",
    "no hubo ganador claro entre {left} y {right}; la fe estuvo repartida.",
  ],
  close: [
    "{winner} ganó por poquito y {loser} casi le pisa el talón.",
    "{winner} salió apenas más arriba que {loser}; estuvo peleadito.",
    "esta se la llevó {winner} por margen corto, con {loser} respirándole cerca.",
    "{winner} raspó la corona y {loser} quedó ahí nomás.",
    "{winner} quedó un pelito más migajer@ que {loser}.",
    "{winner} se llevó el duelo por diferencia fina; {loser} no quedó lejos.",
    "por poquito cayó más fuerte {winner}, mientras {loser} casi empata.",
    "{winner} se adelantó apenas, con {loser} muy pegadit@.",
    "{winner} ganó por una nariz emocional frente a {loser}.",
    "{winner} salió arriba por margen chiquito y {loser} casi le roba la escena.",
    "{winner} tomó la delantera mínima sobre {loser}.",
    "hoy {winner} cayó un poco más que {loser}, pero fue por casi nada.",
  ],
  medium: [
    "{winner} marcó diferencia clara sobre {loser} en este duelo.",
    "{winner} se llevó la corona con cierta comodidad frente a {loser}.",
    "esta ronda fue de {winner}; {loser} quedó detrás con espacio visible.",
    "{winner} entró más de lleno al cuento que {loser}.",
    "{winner} dejó claro que hoy compró más fuerte la fantasía que {loser}.",
    "{winner} se fue arriba con margen serio y {loser} quedó mirando.",
    "aquí {winner} tomó ventaja visible frente a {loser}.",
    "{winner} ganó con distancia respetable sobre {loser}.",
    "{winner} salió bastante más comprometid@ con el humo que {loser}.",
    "la diferencia entre {winner} y {loser} ya se sintió sin mucho esfuerzo.",
    "{winner} hizo más mérito migajero que {loser} esta vez.",
    "{winner} se lanzó más hondo al enredo que {loser}.",
  ],
  wide: [
    "{winner} arrasó en este versus y {loser} quedó bastante atrás.",
    "esta sí fue amplia para {winner}; {loser} no alcanzó a seguirle el ritmo.",
    "{winner} se fue con diferencia grande y sin discutir demasiado.",
    "{winner} tomó la delantera fuerte mientras {loser} miraba desde más lejos.",
    "hoy {winner} vino con fe premium y {loser} ni así pudo alcanzarle.",
    "{winner} ganó con espacio generoso y {loser} quedó claramente debajo.",
    "{winner} se llevó esto con autoridad emocional sobre {loser}.",
    "la distancia fue seria: {winner} cayó bastante más fuerte que {loser}.",
    "{winner} se fue largo en este ranking y {loser} quedó segundo cómodo.",
    "{winner} marcó diferencia pesada frente a {loser}.",
    "{winner} convirtió este duelo en paseo y {loser} solo acompañó.",
    "{winner} se despegó fuerte y {loser} no tuvo cómo empatar.",
  ],
};

const duoTagComments = {
  breadcrumbing: [
    "L@s dos reaccionan bastante a la atención mínima cuando viene con moñito.",
    "{winner} se movió más fuerte por migas bien vestidas, y ahí se abrió la diferencia.",
    "Una señal chiquita todavía les mueve bastante el piso, sobre todo a {winner}.",
  ],
  hope: [
    "La esperanza estuvo haciendo horas extra en esta dupla, especialmente del lado de {winner}.",
    "Aquí hubo bastante fe puesta en posibilidades todavía bien verdes.",
    "{winner} creyó un poquito más fuerte en el “capaz sí” que {loser}.",
  ],
  ambiguity: [
    "A esta dupla todavía le cuesta poco quedarse en relaciones en veremos.",
    "Lo confuso no les espanta tanto como debería, y {winner} lo abrazó más.",
    "La ambigüedad fue parte fuerte del combo, con {winner} llevándola más lejos.",
  ],
  boundaries: [
    "Lo bueno es que aquí todavía hay límites intentando despertar.",
    "Aunque hubo enredo, también se nota que ya hay una parte que quiere ordenar esto.",
    "No todo está perdido: se ve que los límites ya quieren entrar a jugar.",
  ],
  selfWorth: [
    "El amor propio todavía respira por aquí, solo necesita más volumen.",
    "No están totalmente entregad@s al cuento; todavía queda dignidad empujando.",
    "Se nota que una parte sana sigue peleando por ustedes.",
  ],
  planB: [
    "Aquí hay historial de aceptar plan B con más paciencia de la necesaria.",
    "{winner} toleró un poco más el papel de suplencia sentimental.",
    "El tema de caer cuando se cayó el plan principal se sintió bastante en este duelo.",
  ],
  ghostingTolerance: [
    "La tolerancia al ghosteo estuvo más alta de lo sano, sobre todo en {winner}.",
    "Desaparecer y volver no les corta del todo la inspiración, y eso pesa.",
    "El ida y vuelta sin explicación les siguió entrando más de la cuenta.",
  ],
  nightShift: [
    "El horario nocturno sentimental también metió su cucharita aquí.",
    "A esta dupla todavía le resuenan demasiado los mensajes de madrugada.",
    "{winner} compró más fuerte el turno nocturno emocional que {loser}.",
  ],
  hiddenInPublic: [
    "Lo de quererles por chat y esconderles en público sigue pesando en este mapa.",
    "Aquí también se ve sensibilidad al cariño privado con ausencia pública.",
    "{winner} soportó un poco más ese modo secreto que {loser}.",
  ],
  emotionalSupport: [
    "A esta dupla le sale demasiado natural cargar vínculos donde hacen de soporte gratis.",
    "El rol de salvavidas emocional apareció fuerte por aquí.",
    "{winner} se quedó más disponible como refugio que {loser}.",
  ],
  lowEffort: [
    "El mínimo esfuerzo ajeno les sigue moviendo más de lo justo.",
    "Hubo bastante tolerancia a vínculos bien flojitos en esfuerzo real.",
    "{winner} premió más el low effort que {loser}.",
  ],
  inconsistency: [
    "Las señales inconsistentes tuvieron cancha libre en esta comparación.",
    "El hoy sí, mañana no todavía les hace bastante ruido por dentro.",
    "{winner} aguantó más incoherencia sin patear la mesa.",
  ],
  futureFaking: [
    "Las promesas bonitas infladas también jugaron fuerte aquí.",
    "El “más adelante vemos” todavía les compra tiempo emocional.",
    "{winner} cayó más fácil en planes futuros que no venían con base real.",
  ],
  validationSeeking: [
    "A esta dupla todavía le mueve bastante sentirse elegid@.",
    "La validación ajena sigue teniendo peso fuerte por aquí, sobre todo para {winner}.",
    "Un poquito de atención todavía les sube mucho el volumen interno.",
  ],
  excuseBuying: [
    "Aquí hubo compra de excusas con bastante paciencia, la verdad.",
    "{winner} se llevó más fácil el paquete de explicaciones flojitas que {loser}.",
    "Las excusas siguieron teniendo demasiada entrada en esta dupla.",
  ],
};

const duoGapClosers = {
  tie: [
    "En resumen: mismit@s no más, uno espejo del otro.",
    "Aquí nadie puede mirar al otro muy sobrado, ya pues.",
    "Fue empate con sabor a casi algo compartido.",
    "Lo de ustedes fue migajeo cooperativo, nomás.",
  ],
  close: [
    "Fue peleadit@, pero {winner} se inclinó un poco más hacia el cuento.",
    "Estuvieron cerca, aunque {winner} soltó menos el hilo que {loser}.",
    "La diferencia fue corta, pero sí se notó del lado de {winner}.",
    "Casi no hubo distancia, aunque {winner} se quedó un ratito más en la película.",
  ],
  medium: [
    "La distancia ya se sintió y el peso cayó más claro del lado de {winner}.",
    "Aquí ya hubo diferencia visible y {winner} la sostuvo sin mucha duda.",
    "No fue por milímetros: {winner} se metió más al enredo.",
    "La balanza se movió con claridad hacia {winner}.",
  ],
  wide: [
    "La diferencia fue amplia y la corona cayó clarito sobre {winner}.",
    "Aquí sí hubo paseo emocional del lado de {winner}.",
    "No hizo falta lupa para ver quién cayó más fuerte.",
    "La distancia fue suficiente como para dejar poca discusión.",
  ],
};

function pickSoloComment(context) {
  const score = Number(context?.score ?? 0);
  const fullName = normalizeName(context?.profile?.fullName);
  const tier = getSoloTier(score);
  const rawTags = Array.isArray(context?.rawTags) ? context.rawTags : [];
  const dominantTag = rawTags[0] || null;
  const secondaryTag = rawTags[1] || null;

  const opener = randomItem(soloComments[tier]);
  const dominantCloser =
    (dominantTag && soloTagComments[dominantTag]) || soloTierClosers[tier];
  let closer = randomItem(dominantCloser);

  if (secondaryTag && soloTagComments[secondaryTag] && Math.random() < 0.35) {
    closer = randomItem(soloTagComments[secondaryTag]);
  }

  return prependName(`${opener}\n${closer}`, fullName);
}

function pickDuoComment(meta) {
  const gapTier = getGapTier(Number(meta?.scoreGap ?? 0));
  const tokens = {
    left: meta?.left?.displayName || "Persona A",
    right: meta?.right?.displayName || "Persona B",
    winner: meta?.winnerName || "Nadie",
    loser:
      meta?.winner === "LEFT"
        ? meta?.right?.displayName || "Persona B"
        : meta?.winner === "RIGHT"
          ? meta?.left?.displayName || "Persona A"
          : "Nadie",
  };

  const leftRawTags = Array.isArray(meta?.left?.rawTags) ? meta.left.rawTags : [];
  const rightRawTags = Array.isArray(meta?.right?.rawTags) ? meta.right.rawTags : [];
  const sharedTags = intersect(leftRawTags, rightRawTags);
  const winnerRawTag =
    meta?.winner === "LEFT"
      ? leftRawTags[0]
      : meta?.winner === "RIGHT"
        ? rightRawTags[0]
        : sharedTags[0] || leftRawTags[0] || rightRawTags[0];

  const opener = randomItem(
    gapTier === "tie" ? duoComments.tie : duoComments[gapTier]
  );

  const detailPool =
    (sharedTags[0] && duoTagComments[sharedTags[0]]) ||
    (winnerRawTag && duoTagComments[winnerRawTag]) ||
    duoGapClosers[gapTier];

  const closer = randomItem(detailPool);
  const finalCloser =
    detailPool === duoGapClosers[gapTier]
      ? closer
      : randomItem(duoGapClosers[gapTier]);

  return applyTemplate(`${opener}\n${closer} ${finalCloser}`, tokens);
}

module.exports = {
  pickSoloComment,
  pickDuoComment,
  tagLabels,
};
