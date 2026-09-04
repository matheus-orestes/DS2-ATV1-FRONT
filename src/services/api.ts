import type { Funcionario, FuncionarioPayload, Indicadores } from '../types/funcionario';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://diogo-api.onrender.com').replace(/\/$/, '');
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);
const RETRIES = Number(import.meta.env.VITE_API_RETRIES || 1);

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly method: HttpMethod,
    public readonly endpoint: string,
    message: string,
    public readonly details?: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResult<T> {
  data: T;
  status: number;
  statusText: string;
}

function extractMessage(body: unknown): string {
  if (typeof body === 'string') return body.trim();
  if (!body || typeof body !== 'object') return '';
  const o = body as Record<string, unknown>;
  const keys = ['message', 'detail', 'error', 'title', 'mensagem', 'erro'];
  for (const key of keys) if (o[key] != null && String(o[key]).trim()) return String(o[key]).trim();
  return '';
}

function friendlyMessage(status: number, method: HttpMethod, body: unknown): string {
  const server = extractMessage(body);
  if (status === 400) return server || 'A API recusou os dados enviados. Revise os campos informados.';
  if (status === 401) return 'A API exige autenticação para esta operação.';
  if (status === 403) return 'A API não permite esta operação para o usuário atual.';
  if (status === 404) return 'O recurso solicitado não foi encontrado. Verifique o endpoint ou o ID.';
  if (status === 409) {
    if (/email|e-mail|duplicate|duplic|already|exist/i.test(server)) return `Conflito: já existe um registro com esses dados. ${server}`.trim();
    if (method === 'DELETE') return `Conflito: o backend não permite excluir este registro no estado atual. ${server}`.trim();
    return `Conflito: a API recusou a operação porque o estado atual do registro não permite essa alteração. ${server}`.trim();
  }
  if (status === 422) return server || 'Os dados foram rejeitados pela API. Revise os campos e tente novamente.';
  if (status >= 500) return `A API está indisponível ou apresentou erro interno (HTTP ${status}). Tente novamente.`;
  return server || `A API retornou HTTP ${status} para ${method}.`;
}

async function readBody(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return undefined;
  try { return JSON.parse(raw) as unknown; } catch { return raw; }
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<ApiResult<T>> {
  const endpoint = `${API_BASE_URL}${path}`;
  let lastUnknown: unknown;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: body === undefined
          ? { Accept: 'application/json' }
          : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const parsed = await readBody(response);
      if (!response.ok) {
        throw new ApiError(
          response.status,
          method,
          endpoint,
          friendlyMessage(response.status, method, parsed),
          extractMessage(parsed) || undefined,
          parsed,
        );
      }
      return { data: parsed as T, status: response.status, statusText: response.statusText };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      lastUnknown = error;
      if (attempt < RETRIES) {
        await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      throw new ApiError(
        0,
        method,
        endpoint,
        isAbort
          ? `A requisição excedeu ${Math.round(TIMEOUT_MS / 1000)}s e foi interrompida.`
          : 'Não foi possível conectar à API. Verifique sua internet, CORS ou a disponibilidade do servidor.',
        lastUnknown instanceof Error ? lastUnknown.message : undefined,
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastUnknown;
}

function unwrapList(value: unknown): Funcionario[] {
  if (Array.isArray(value)) return value as Funcionario[];
  if (!value || typeof value !== 'object') return [];
  const o = value as Record<string, unknown>;
  for (const key of ['content', 'data', 'funcionarios', 'items', 'results']) {
    if (Array.isArray(o[key])) return o[key] as Funcionario[];
  }
  return [];
}

function unwrapOne(value: unknown): Funcionario {
  if (value && typeof value === 'object' && 'data' in value) {
    const d = (value as { data?: unknown }).data;
    if (d && typeof d === 'object') return d as Funcionario;
  }
  return value as Funcionario;
}

function unwrapIndicators(value: unknown): Indicadores {
  if (value && typeof value === 'object' && 'indicadores' in value) {
    const d = (value as { indicadores?: unknown }).indicadores;
    if (d && typeof d === 'object') return d as Indicadores;
  }
  return (value && typeof value === 'object' ? value : {}) as Indicadores;
}

export const funcionarioApi = {
  findAll: async (): Promise<ApiResult<Funcionario[]>> => {
    const result = await request<unknown>('GET', '/funcionarios');
    return { ...result, data: unwrapList(result.data) };
  },
  findById: async (id: number): Promise<ApiResult<Funcionario>> => {
    const result = await request<unknown>('GET', `/funcionarios/${id}`);
    return { ...result, data: unwrapOne(result.data) };
  },
  indicadores: async (): Promise<ApiResult<Indicadores>> => {
    const result = await request<unknown>('GET', '/funcionarios/indicadores');
    return { ...result, data: unwrapIndicators(result.data) };
  },
  create: async (payload: FuncionarioPayload): Promise<ApiResult<Funcionario>> => {
    const result = await request<unknown>('POST', '/funcionarios', payload);
    return { ...result, data: unwrapOne(result.data) };
  },
  update: async (id: number, payload: FuncionarioPayload): Promise<ApiResult<Funcionario>> => {
    const result = await request<unknown>('PUT', `/funcionarios/${id}`, payload);
    return { ...result, data: unwrapOne(result.data) };
  },
  patch: async (id: number, payload: Partial<FuncionarioPayload>): Promise<ApiResult<Funcionario | unknown>> => {
    const result = await request<unknown>('PATCH', `/funcionarios/${id}`, payload);
    return { ...result, data: result.data };
  },
  remove: (id: number): Promise<ApiResult<unknown>> => request<unknown>('DELETE', `/funcionarios/${id}`),
};
