const { routes } = require('./routes');
const { routeRequest } = require('./lib/router');
const { notFound, serverError } = require('./lib/http');
const { env } = require('./config/env');

exports.handler = async (event, context) => {
  try {
    const res = await routeRequest({
      event,
      context,
      routes,
      basePath: env.basePath
    });

    return res ?? notFound('Ruta no encontrada.');
  } catch (err) {
    console.error('Unhandled error:', err);
    return serverError('Ups. Algo falló en el servidor.');
  }
};
