import { get, post, put } from 'aws-amplify/api';

const API_NAME = 'apieff38f7c';

async function parseBody(res: any) {
  try {
    return await res.body.json();
  } catch {
    try {
      return await res.body.text();
    } catch {
      return null;
    }
  }
}

async function requestJson(op: any) {
  // Amplify v6: op.response es lo que se await-ea
  const res = await op.response;
  const data = await parseBody(res);

  if (res.statusCode >= 400) {
    const msg =
      (data && (data.message || data.error)) ? (data.message || data.error) : `HTTP ${res.statusCode}`;
    throw new Error(msg);
  }
  return data;
}

export function fetchQuiz(version = 'v1') {
  return requestJson(
    get({
      apiName: API_NAME,
      path: '/quiz',
      options: { queryParams: { v: version } }
    })
  );
}

export function submitQuiz(payload: any) {
  return requestJson(
    post({
      apiName: API_NAME,
      path: '/submit',
      options: { body: payload }
    })
  );
}

// Si /me aún no existe, no reventamos
export async function getMe() {
  try {
    return await requestJson(get({ apiName: API_NAME, path: '/me' }));
  } catch {
    return null;
  }
}

export function updateMe(payload: any) {
  return requestJson(
    put({
      apiName: API_NAME,
      path: '/me',
      options: { body: payload }
    })
  );
}