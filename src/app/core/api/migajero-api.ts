import { get, post, put } from 'aws-amplify/api';

const API_NAME = 'apieff38f7c';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

export type Gender = 'F' | 'M' | 'X' | 'N';

export interface Profile {
  fullName: string | null;
  age: number | null;
  gender: Gender | null;
}

export interface QuizOption {
  id: string;
  text: string;
  score: number;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizDefinition {
  version: string;
  title: string;
  disclaimer: string;
  questions: QuizQuestion[];
}

export interface SoloAnswerPayload {
  questionId: string;
  optionId: string;
}

export interface SoloResult {
  createdAt: string;
  mode: 'SOLO';
  quizVersion: string;
  score: number;
  level: string;
  rawTags: string[];
  tags: string[];
  comment: string;
  profile: Profile | null;
}

export interface DuoSideResult {
  userId: string;
  createdAt: string;
  displayName: string;
  score: number;
  level: string | null;
  rawTags?: string[];
  tags: string[];
}

export interface DuoResult {
  mode: 'DUO';
  createdAt: string;
  leftResult: DuoSideResult;
  rightResult: DuoSideResult;
  winner: 'LEFT' | 'RIGHT' | 'TIE';
  winnerName: string | null;
  winnerLabel: string;
  scoreGap: number;
  comment: string;
}

export interface MeResponse {
  profile: Profile;
  lastResult: SoloResult | null;
  duoInviteToken?: string | null;
  results?: SoloResult[];
}

export interface SubmitSoloPayload {
  mode: 'SOLO';
  profile: Profile | null;
  answers: SoloAnswerPayload[];
}

export interface SubmitDuoPayload {
  mode: 'DUO';
  inviteToken: string;
}

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

async function requestJson<T>(op: any): Promise<T> {
  const res = await op.response;
  const data = await parseBody(res);

  if (res.statusCode >= 400) {
    const message =
      data && typeof data === 'object' && ('message' in data || 'error' in data)
        ? String((data as any).message || (data as any).error)
        : `HTTP ${res.statusCode}`;

    const error: any = new Error(message);
    error.statusCode = res.statusCode;
    error.payload = data;
    throw error;
  }

  return data as T;
}

function toJsonBody(value: unknown): JsonObject {
  return JSON.parse(JSON.stringify(value ?? {})) as JsonObject;
}

export function fetchQuiz(version = 'v4') {
  return requestJson<QuizDefinition>(
    get({
      apiName: API_NAME,
      path: '/quiz',
      options: { queryParams: { v: version } }
    })
  );
}

export function submitSolo(payload: SubmitSoloPayload) {
  return requestJson<SoloResult>(
    post({
      apiName: API_NAME,
      path: '/submit',
      options: {
        body: toJsonBody(payload)
      }
    })
  );
}

export function submitDuo(inviteToken: string) {
  return requestJson<DuoResult>(
    post({
      apiName: API_NAME,
      path: '/submit',
      options: {
        body: toJsonBody({
          mode: 'DUO',
          inviteToken
        } satisfies SubmitDuoPayload)
      }
    })
  );
}

export function getMe() {
  return requestJson<MeResponse>(
    get({
      apiName: API_NAME,
      path: '/me'
    })
  );
}

export function updateMe(payload: Profile) {
  return requestJson<{ ok: true; profile: Profile }>(
    put({
      apiName: API_NAME,
      path: '/me',
      options: {
        body: toJsonBody(payload)
      }
    })
  );
}

export async function getMyLastResult() {
  const me = await getMe();
  return me?.lastResult ?? null;
}
