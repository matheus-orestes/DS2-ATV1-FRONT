/**
 * Repositório de funcionários — a única camada que os componentes conhecem.
 *
 * Com VITE_API_URL definido, cada método vira uma requisição HTTP à API Spring
 * Boot; sem ela, cai no adaptador mock. Os endpoints seguem o desafio:
 *
 *   POST   /funcionarios       cadastrar
 *   GET    /funcionarios       consultar todos
 *   GET    /funcionarios/{id}  consultar por ID
 *   PUT    /funcionarios/{id}  atualizar completamente
 *   PATCH  /funcionarios/{id}  atualizar parcialmente
 *   DELETE /funcionarios/{id}  excluir
 */
import { MODO_MOCK, request } from './client';
import { mockAdapter } from './mockAdapter';

const httpAdapter = {
  listar: () => request('GET', '/funcionarios'),
  obter: (id) => request('GET', '/funcionarios/' + id),
  criar: (corpo) => request('POST', '/funcionarios', corpo),
  atualizar: (id, corpo) => request('PUT', '/funcionarios/' + id, corpo),
  atualizarParcial: (id, corpo) => request('PATCH', '/funcionarios/' + id, corpo),
  remover: (id) => request('DELETE', '/funcionarios/' + id),
  restaurar: () => request('GET', '/funcionarios')
};

const adapter = MODO_MOCK ? mockAdapter : httpAdapter;

export const funcionariosApi = {
  listar: () => adapter.listar(),
  obter: (id) => adapter.obter(id),
  criar: (corpo) => adapter.criar(corpo),
  atualizar: (id, corpo) => adapter.atualizar(id, corpo),
  atualizarParcial: (id, corpo) => adapter.atualizarParcial(id, corpo),
  remover: (id) => adapter.remover(id),
  restaurar: () => adapter.restaurar()
};
