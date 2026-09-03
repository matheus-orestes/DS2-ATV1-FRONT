import type { Funcionario, FuncionarioPayload, Indicadores } from '../types/funcionario';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://diogo-api.onrender.com').replace(/\/$/, '');

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiResult<T> {
  data: T;
  status: number;
  statusText: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();
  let body: unknown = undefined;
  if (raw) {
    body = contentType.includes('application/json') ? safeJson(raw) : raw;
  }

  if (!response.ok) {
    const message = typeof body === 'object' && body && 'message' in body
      ? String((body as { message?: unknown }).message)
      : `HTTP ${response.status} ${response.statusText}`;
    throw new ApiError(response.status, message, body);
  }

  return { data: body as T, status: response.status, statusText: response.statusText };
}

function safeJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return raw; }
}

export const funcionarioApi = {
  async findAll() {
    return request<Funcionario[] | { content?: Funcionario[]; data?: Funcionario[] }>('/funcionarios');
  },
  async findById(id: number) {
    return request<Funcionario>(`/funcionarios/${id}`);
  },
  async indicadores() {
    return request<Indicadores>('/funcionarios/indicadores');
  },
  async create(payload: FuncionarioPayload) {
    return request<Funcionario>('/funcionarios', { method: 'POST', body: JSON.stringify(payload) });
  },
  async update(id: number, payload: FuncionarioPayload) {
    return request<Funcionario>(`/funcionarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async patch(id: number, payload: Partial<FuncionarioPayload>) {
    return request<Funcionario>(`/funcionarios/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async remove(id: number) {
    return request<unknown>(`/funcionarios/${id}`, { method: 'DELETE' });
  },
};
