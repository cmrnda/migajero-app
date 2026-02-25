// src/app/core/api/migajero-api.ts
import { get, post, put } from 'aws-amplify/api';

const API_NAME = 'apieff38f7c';

export async function fetchQuiz(version = 'v1') {
  const res = await get({
    apiName: API_NAME,
    path: '/quiz',
    options: { queryParams: { v: version } }
  }).response;

  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`);
  return res.body.json();
}

export async function submitQuiz(payload: any) {
  const res = await post({
    apiName: API_NAME,
    path: '/submit',
    options: { body: payload }
  }).response;

  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`);
  return res.body.json();
}

export async function getMe() {
  const res = await get({
    apiName: API_NAME,
    path: '/me'
  }).response;

  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`);
  return res.body.json();
}

export async function updateMe(payload: any) {
  const res = await put({
    apiName: API_NAME,
    path: '/me',
    options: { body: payload }
  }).response;

  if (res.statusCode >= 400) throw new Error(`HTTP ${res.statusCode}`);
  return res.body.json();
}
