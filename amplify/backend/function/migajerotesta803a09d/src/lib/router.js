function normalizePath(path = '') {
  // quita querystring
  return path.split('?')[0];
}

function stripBasePath(path, basePath) {
  if (!basePath) return path;
  if (path === basePath) return '/';
  return path.startsWith(basePath + '/') ? path.slice(basePath.length) : path;
}

function matchRoute(route, method, path) {
  if (route.method !== method) return null;
  const match = route.pathRegex.exec(path);
  if (!match) return null;
  return match.groups || {};
}

async function routeRequest({ event, context, routes, basePath }) {
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  const rawPath = normalizePath(event.path || event.rawPath || '/');
  const path = stripBasePath(rawPath, basePath);

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
  }

  for (const r of routes) {
    const params = matchRoute(r, method, path);
    if (params) return r.handler({ event, context, params, path, method });
  }

  return null;
}

module.exports = { routeRequest };
