export const STATUS = [
  { value: 'EM_ANALISE', label: 'Em análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'CONTRATADO', label: 'Contratado' }
];

export const CAMPOS_FUNCIONARIO = [
  'nome',
  'email',
  'telefone',
  'cargo',
  'departamento',
  'salario',
  'cidade',
  'status'
];

export const FUNCIONARIO_VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  cargo: '',
  departamento: '',
  salario: '',
  cidade: '',
  status: 'EM_ANALISE'
};

export const ABAS = [
  { id: 'painel', label: 'Painel', icon: 'ph-chart-pie-slice', chip: '', titulo: 'Painel de indicadores', endpoint: 'GET /funcionarios — agregações da lista' },
  { id: 'candidatos', label: 'Candidatos', icon: 'ph-users-three', chip: 'GET', titulo: 'Candidatos', endpoint: 'GET /funcionarios · GET /funcionarios/{id}' },
  { id: 'cadastrar', label: 'Cadastrar', icon: 'ph-user-plus', chip: 'POST', titulo: 'Cadastrar candidato', endpoint: 'POST /funcionarios' },
  { id: 'editar', label: 'Editar', icon: 'ph-pencil-simple', chip: 'PUT', titulo: 'Editar candidato', endpoint: 'PUT /funcionarios/{id}' },
  { id: 'status', label: 'Atualizar status', icon: 'ph-sliders-horizontal', chip: 'PATCH', titulo: 'Atualização parcial', endpoint: 'PATCH /funcionarios/{id}' },
  { id: 'excluir', label: 'Excluir', icon: 'ph-trash', chip: 'DELETE', titulo: 'Excluir candidato', endpoint: 'DELETE /funcionarios/{id}' },
  { id: 'log', label: 'Requisições', icon: 'ph-terminal-window', chip: '', titulo: 'Requisições HTTP', endpoint: 'Registro das chamadas feitas pela interface' }
];
