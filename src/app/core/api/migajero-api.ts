import { get, post, put } from 'aws-amplify/api';

const API_NAME = 'apieff38f7c';

async function parseBody(res: any) {
  try { return await res.body.json(); } catch {
    try { return await res.body.text(); } catch { return null; }
  }
}

async function requestJson(op: any) {
  const res = await op.response;
  const data = await parseBody(res);

  if (res.statusCode >= 400) {
    const msg = (data && (data.message || data.error)) ? (data.message || data.error) : `HTTP ${res.statusCode}`;
    const err: any = new Error(msg);
    err.statusCode = res.statusCode;
    throw err;
  }
  return data;
}

export const fetchQuiz = (v='v1') =>
  requestJson(get({ apiName: API_NAME, path: '/quiz', options: { queryParams: { v } } }));

export const submitQuiz = (payload: any) =>
  requestJson(post({ apiName: API_NAME, path: '/submit', options: { body: payload } }));

export const getMe = () =>
  requestJson(get({ apiName: API_NAME, path: '/me' }));

export const updateMe = (payload: any) =>
  requestJson(put({ apiName: API_NAME, path: '/me', options: { body: payload } }));

export async function getMyLastResult() {
  const me = await getMe();
  return me?.lastResult ?? null;
}
