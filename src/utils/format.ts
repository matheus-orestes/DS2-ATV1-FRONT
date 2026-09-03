import type { Funcionario, StatusFuncionario } from '../types/funcionario';

export const STATUS_OPTIONS: Array<{ value: StatusFuncionario; label: string }> = [
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'CONTRATADO', label: 'Contratado' },
];

export function statusLabel(status: StatusFuncionario): string {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

export function statusClass(status: StatusFuncionario): string {
  if (status === 'APROVADO') return 'tag tag-lime';
  if (status === 'CONTRATADO') return 'tag tag-green';
  if (status === 'REPROVADO') return 'tag tag-outline';
  return 'tag tag-neutral';
}

export function methodClass(method: string): string {
  if (method === 'POST' || method === 'PATCH') return 'tag tag-lime';
  if (method === 'PUT') return 'tag tag-green';
  if (method === 'DELETE') return 'tag tag-outline';
  return 'tag tag-neutral';
}

export function money(value: unknown): string {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((item) => item[0]).join('').toUpperCase();
}

export function normalizeFuncionarios(input: unknown): Funcionario[] {
  if (Array.isArray(input)) return input as Funcionario[];
  if (input && typeof input === 'object') {
    const obj = input as { content?: unknown; data?: unknown; funcionarios?: unknown };
    for (const key of ['content', 'data', 'funcionarios'] as const) {
      if (Array.isArray(obj[key])) return obj[key] as Funcionario[];
    }
  }
  return [];
}

export function normalizeIndicators(input: unknown): import('../types/funcionario').IndicatorSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  const nested = (obj.indicadores && typeof obj.indicadores === 'object') ? obj.indicadores as Record<string, unknown> : obj;
  const read = (keys: string[], fallback: number) => { for (const key of keys) { const value = nested[key]; if (typeof value === 'number' && Number.isFinite(value)) return value; if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value); } return fallback; };
  return {
    total: read(['total','quantidadeTotal','totalFuncionarios','totalCandidatos'], 0),
    emAnalise: read(['emAnalise','em_analise','pendentes','aguardandoAvaliacao'], 0),
    aprovados: read(['aprovados','aprovado','quantidadeAprovados'], 0),
    reprovados: read(['reprovados','reprovado','quantidadeReprovados'], 0),
    contratados: read(['contratados','contratado','quantidadeContratados'], 0),
  };
}
