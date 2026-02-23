const { getQuiz, submitQuiz } = require('../controllers/quiz.controller');
const { createRoom, submitRoom, getRoomSummary } = require('../controllers/rooms.controller');
const { getMyLatest, getMyResults } = require('../controllers/me.controller');

const routes = [
  // quiz
  { method: 'GET',  pathRegex: /^\/quiz$/, handler: getQuiz },
  { method: 'POST', pathRegex: /^\/submit$/, handler: submitQuiz },

  // rooms (GROUP max 5 / DUEL)
  { method: 'POST', pathRegex: /^\/rooms$/, handler: createRoom },
  { method: 'POST', pathRegex: /^\/rooms\/(?<code>[A-Z0-9-]+)\/submit$/, handler: submitRoom },
  { method: 'GET',  pathRegex: /^\/rooms\/(?<code>[A-Z0-9-]+)\/summary$/, handler: getRoomSummary },

  // me (requiere auth)
  { method: 'GET',  pathRegex: /^\/me\/latest$/, handler: getMyLatest },
  { method: 'GET',  pathRegex: /^\/me\/results$/, handler: getMyResults }
];

module.exports = { routes };
