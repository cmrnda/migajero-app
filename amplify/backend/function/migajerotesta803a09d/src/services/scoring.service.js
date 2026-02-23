function calculateScore({ answers }) {
  // Placeholder: aquí después sumas points reales por optionId.
  const raw = Math.min(100, (answers.length || 0) * 10);
  const score = raw;

  let levelEs = 'A veces caes, pero recapacitas';
  if (score <= 25) levelEs = 'Cero migajas, tú exiges panadería completa';
  else if (score <= 50) levelEs = 'A veces caes, pero recapacitas';
  else if (score <= 75) levelEs = 'Migajero certificado (pero reversible)';
  else levelEs = 'Te dan un “hola” y ya planificas boda';

  return { score, levelEs, tags: ['breadcrumbing'] };
}

module.exports = { calculateScore };
