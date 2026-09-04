import type { Funcionario, FuncionarioPayload, StatusFuncionario } from '../types/funcionario';
import { normalizeEmail } from './format';

export const BUSINESS_RULES = [
  'Nome obrigatório: 3 a 120 caracteres.',
  'E-mail obrigatório, válido e único dentro da lista carregada.',
  'Telefone: 10 ou 11 dígitos quando informado.',
  'Cargo, departamento e cidade são obrigatórios.',
  'Salário obrigatório, maior que zero e até R$ 1.000.000,00.',
  'Novo candidato deve iniciar em Em análise.',
  'Em análise pode avançar para Aprovado ou Reprovado.',
  'Aprovado pode avançar para Contratado.',
  'Reprovado e Contratado são estados terminais na interface.',
  'Contratado não pode ser excluído pela interface.',
] as const;

const allowedStatuses: StatusFuncionario[] = ['EM_ANALISE', 'APROVADO', 'REPROVADO', 'CONTRATADO'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePayload(payload: FuncionarioPayload, existing: Funcionario[], currentId?: number): Record<string, string> {
  const errors: Record<string, string> = {};
  const nome = payload.nome.trim();
  const email = normalizeEmail(payload.email);
  const telefone = (payload.telefone || '').replace(/\D/g, '');
  const salario = Number(payload.salario);

  if (!nome) errors.nome = 'Informe o nome.';
  else if (nome.length < 3) errors.nome = 'O nome precisa ter pelo menos 3 caracteres.';
  else if (nome.length > 120) errors.nome = 'O nome pode ter no máximo 120 caracteres.';

  if (!email) errors.email = 'Informe o e-mail.';
  else if (!emailRegex.test(email)) errors.email = 'Informe um e-mail válido.';
  else if (existing.some((f) => f.id !== currentId && normalizeEmail(f.email) === email)) errors.email = 'Já existe um candidato com este e-mail.';

  if (telefone && ![10, 11].includes(telefone.length)) errors.telefone = 'Telefone deve ter 10 ou 11 dígitos.';
  if (!payload.cargo.trim()) errors.cargo = 'Informe o cargo.';
  if (!payload.departamento?.trim()) errors.departamento = 'Informe o departamento.';
  if (!payload.cidade?.trim()) errors.cidade = 'Informe a cidade.';
  if (!Number.isFinite(salario) || salario <= 0) errors.salario = 'O salário precisa ser maior que zero.';
  else if (salario > 1_000_000) errors.salario = 'O salário não pode ultrapassar R$ 1.000.000,00.';
  if (!allowedStatuses.includes(payload.status)) errors.status = 'Status inválido.';
  return errors;
}

export function canTransitionStatus(from: StatusFuncionario, to: StatusFuncionario): boolean {
  if (from === to) return true;
  if (from === 'EM_ANALISE') return to === 'APROVADO' || to === 'REPROVADO';
  if (from === 'APROVADO') return to === 'CONTRATADO';
  return false;
}

export function transitionMessage(from: StatusFuncionario, to: StatusFuncionario): string {
  if (canTransitionStatus(from, to)) return '';
  if (from === 'CONTRATADO') return 'Um candidato contratado não pode voltar para outra etapa pela interface.';
  if (from === 'REPROVADO') return 'Um candidato reprovado é terminal pela interface.';
  if (from === 'APROVADO') return 'Depois de aprovado, o próximo status permitido é Contratado.';
  return 'A transição de status selecionada não é permitida.';
}
