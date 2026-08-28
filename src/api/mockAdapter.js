/**
 * Adaptador mock — reproduz o comportamento do controller Spring Boot sobre uma
 * lista em memória, com os mesmos códigos de resposta. Serve para rodar a
 * interface sem o back-end no ar; ao definir VITE_API_URL o repositório passa a
 * usar o cliente HTTP real, sem mudanças nos componentes.
 */
import { FUNCIONARIOS_INICIAIS } from '../data/seed';
import { ApiError, registrarRequisicao } from './client';

let lista = FUNCIONARIOS_INICIAIS.map((f) => ({ ...f }));
let proximoId = lista.length + 1;

const espera = () => new Promise((r) => setTimeout(r, 160));

function log(metodo, endpoint, status, corpo) {
  registrarRequisicao({ metodo, endpoint, status, corpo });
}

function acharIndice(id) {
  return lista.findIndex((f) => f.id === Number(id));
}

export const mockAdapter = {
  async listar() {
    await espera();
    log('GET', '/funcionarios', '200 OK');
    return lista.map((f) => ({ ...f }));
  },

  async obter(id) {
    await espera();
    const i = acharIndice(id);
    if (i < 0) {
      log('GET', '/funcionarios/' + id, '404 Not Found');
      throw new ApiError(404, 'Funcionário com ID ' + id + ' não encontrado.');
    }
    log('GET', '/funcionarios/' + id, '200 OK');
    return { ...lista[i] };
  },

  async criar(corpo) {
    await espera();
    if (lista.some((f) => f.email.toLowerCase() === String(corpo.email).toLowerCase())) {
      log('POST', '/funcionarios', '409 Conflict', corpo);
      throw new ApiError(409, 'Já existe um candidato cadastrado com este e-mail.');
    }
    const novo = { id: proximoId++, ...corpo };
    lista = [...lista, novo];
    log('POST', '/funcionarios', '201 Created', corpo);
    return { ...novo };
  },

  async atualizar(id, corpo) {
    await espera();
    const i = acharIndice(id);
    if (i < 0) {
      log('PUT', '/funcionarios/' + id, '404 Not Found', corpo);
      throw new ApiError(404, 'Funcionário com ID ' + id + ' não encontrado.');
    }
    const atualizado = { id: Number(id), ...corpo };
    lista = lista.map((f, idx) => (idx === i ? atualizado : f));
    log('PUT', '/funcionarios/' + id, '200 OK', corpo);
    return { ...atualizado };
  },

  async atualizarParcial(id, corpo) {
    await espera();
    const i = acharIndice(id);
    if (i < 0) {
      log('PATCH', '/funcionarios/' + id, '404 Not Found', corpo);
      throw new ApiError(404, 'Funcionário com ID ' + id + ' não encontrado.');
    }
    const atualizado = { ...lista[i], ...corpo };
    lista = lista.map((f, idx) => (idx === i ? atualizado : f));
    log('PATCH', '/funcionarios/' + id, '200 OK', corpo);
    return { ...atualizado };
  },

  async remover(id) {
    await espera();
    const i = acharIndice(id);
    if (i < 0) {
      log('DELETE', '/funcionarios/' + id, '404 Not Found');
      throw new ApiError(404, 'Funcionário com ID ' + id + ' não encontrado.');
    }
    lista = lista.filter((_, idx) => idx !== i);
    log('DELETE', '/funcionarios/' + id, '204 No Content');
    return null;
  },

  async restaurar() {
    lista = FUNCIONARIOS_INICIAIS.map((f) => ({ ...f }));
    proximoId = lista.length + 1;
    return this.listar();
  }
};
