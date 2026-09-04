export type StatusFuncionario = 'EM_ANALISE' | 'APROVADO' | 'REPROVADO' | 'CONTRATADO' | string;

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cargo: string;
  departamento?: string;
  salario?: number;
  cidade?: string;
  status: StatusFuncionario;
  [key: string]: unknown;
}

export interface FuncionarioPayload {
  nome: string;
  email: string;
  telefone?: string;
  cargo: string;
  departamento?: string;
  salario: number;
  cidade?: string;
  status: StatusFuncionario;
}

export interface Indicadores {
  total?: number;
  emAnalise?: number;
  aprovados?: number;
  reprovados?: number;
  contratados?: number;
  [key: string]: unknown;
}
