import type { Funcionario, StatusFuncionario } from '../types/funcionario';

export const STATUS_OPTIONS: Array<{ value: StatusFuncionario; label: string }> = [
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'CONTRATADO', label: 'Contratado' },
];

export function statusLabel(status: StatusFuncionario): string { return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status; }
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
  const n = Number(value);
  return (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function initials(name: string): string { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase(); }
export function normalizeEmail(email: string | undefined): string { return (email || '').trim().toLowerCase(); }
export function normalizeFuncionarios(input: unknown): Funcionario[] {
  if (Array.isArray(input)) return input as Funcionario[];
  if (!input || typeof input !== 'object') return [];
  const o = input as Record<string, unknown>;
  for (const k of ['content', 'data', 'funcionarios', 'items', 'results']) if (Array.isArray(o[k])) return o[k] as Funcionario[];
  return [];
}
export function normalizeIndicators(input: unknown): { total: number; emAnalise: number; aprovados: number; reprovados: number; contratados: number } {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const nested = (o.indicadores && typeof o.indicadores === 'object' ? o.indicadores : o) as Record<string, unknown>;
  const read = (keys: string[]) => {
    for (const k of keys) { const v = nested[k]; const n = Number(v); if (Number.isFinite(n)) return n; }
    return 0;
  };
  return { total: read(['total','totalFuncionarios','totalCandidatos']), emAnalise: read(['emAnalise','em_analise','pendentes']), aprovados: read(['aprovados','aprovado']), reprovados: read(['reprovados','reprovado']), contratados: read(['contratados','contratado']) };
}
