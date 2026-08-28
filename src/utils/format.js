import { STATUS } from '../constants';

export function moeda(valor) {
  const n = Number(valor) || 0;
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rotuloStatus(status) {
  const encontrado = STATUS.find((s) => s.value === status);
  return encontrado ? encontrado.label : status;
}

export function classeStatus(status) {
  if (status === 'APROVADO') return 'tag-mark';
  if (status === 'CONTRATADO') return 'tag-accent';
  if (status === 'REPROVADO') return 'tag-outline';
  return 'tag-neutral';
}

export function classeMetodo(metodo) {
  if (metodo === 'POST' || metodo === 'PATCH') return 'tag-mark';
  if (metodo === 'PUT') return 'tag-accent';
  if (metodo === 'DELETE') return 'tag-outline';
  return 'tag-neutral';
}

/** Normaliza o formulário para o corpo JSON esperado pela API. */
export function corpoFuncionario(form) {
  return {
    nome: (form.nome || '').trim(),
    email: (form.email || '').trim(),
    telefone: form.telefone || '',
    cargo: (form.cargo || '').trim(),
    departamento: form.departamento || '',
    salario: Number(form.salario) || 0,
    cidade: form.cidade || '',
    status: form.status || 'EM_ANALISE'
  };
}

/** Regras obrigatórias do desafio: nome, e-mail e cargo. */
export function validarFuncionario(form) {
  if (!form.nome || !form.nome.trim()) return 'O nome é obrigatório.';
  if (!form.email || !form.email.trim()) return 'O e-mail é obrigatório.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Informe um e-mail válido.';
  if (!form.cargo || !form.cargo.trim()) return 'O cargo é obrigatório.';
  return null;
}
