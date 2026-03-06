import { get, post, put } from 'aws-amplify/api';
import { QUIZ_VERSION } from '../config/app-info';

const API_NAME = 'apieff38f7c';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export type GenderValue = 'F' | 'M' | 'X' | 'N';

export interface Profile {
  fullName: string | null;
  age: number | null;
  gender: GenderValue | null;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizResponse {
  version: string;
  title: string;
  disclaimer: string;
  questions: QuizQuestion[];
}

export interface QuizAnswerPayload {
  questionId: string;
  optionId: string;
}

export interface SubmitQuizPayload {
  mode: 'SOLO' | 'DUO';
  profile: Profile | null;
  answers: QuizAnswerPayload[];
}

export interface QuizResult {
  createdAt: string;
  mode: string;
  quizVersion: string;
  score: number;
  level: string;
  rawTags: string[];
  tags: string[];
  comment: string;
  profile: Profile | null;
}

export interface MeResponse {
  profile: Profile;
  lastResult: QuizResult | null;
  results?: QuizResult[];
}

function toDocumentBody<T>(value: T): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

async function parseBody(response: any) {
  try {
    return await response.body.json();
  } catch {
    try {
      return await response.body.text();
    } catch {
      return null;
    }
  }
}

async function requestJson(operation: any) {
  const response = await operation.response;
  const data = await parseBody(response);

  if (response.statusCode >= 400) {
    const message =
      data && (data.message || data.error)
        ? data.message || data.error
        : `HTTP ${response.statusCode}`;

    const error: any = new Error(message);
    error.statusCode = response.statusCode;
    throw error;
  }

  return data;
}

export function fetchQuiz(version = QUIZ_VERSION) {
  return requestJson(
    get({
      apiName: API_NAME,
      path: '/quiz',
      options: {
        queryParams: { v: version }
      }
    })
  ) as Promise<QuizResponse>;
}

export function submitQuiz(payload: SubmitQuizPayload) {
  return requestJson(
    post({
      apiName: API_NAME,
      path: '/submit',
      options: {
        body: toDocumentBody(payload)
      }
    })
  ) as Promise<QuizResult>;
}

export function getMe() {
  return requestJson(
    get({
      apiName: API_NAME,
      path: '/me'
    })
  ) as Promise<MeResponse>;
}

export function updateMe(payload: { fullName: string; age: number; gender: GenderValue }) {
  return requestJson(
    put({
      apiName: API_NAME,
      path: '/me',
      options: {
        body: toDocumentBody(payload)
      }
    })
  ) as Promise<{ ok: true; profile: Profile }>;
}

export async function getMyLastResult() {
  const me = await getMe();
  return me?.lastResult ?? null;
}
