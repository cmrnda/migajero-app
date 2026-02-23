const defaultHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(payload ?? {})
  };
}

function ok(payload) { return json(200, payload); }
function created(payload) { return json(201, payload); }
function badRequest(messageEs, details) { return json(400, { messageEs, details }); }
function unauthorized(messageEs = 'No autorizado.') { return json(401, { messageEs }); }
function notFound(messageEs = 'Ruta no encontrada.') { return json(404, { messageEs }); }
function serverError(messageEs = 'Error interno.') { return json(500, { messageEs }); }

function parseJsonBody(event) {
  if (!event?.body) return {};
  try { return JSON.parse(event.body); } catch { return null; }
}

module.exports = { ok, created, badRequest, unauthorized, notFound, serverError, parseJsonBody };
