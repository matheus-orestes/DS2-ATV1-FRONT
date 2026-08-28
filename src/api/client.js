/**
 * Cliente HTTP único da aplicação (Fetch API).
 *
 * Toda a comunicação com o Spring Boot passa por aqui, o que permite registrar
 * cada requisição em um log — usado na aba "Requisições" para demonstrar
 * POST / GET / PUT / PATCH / DELETE.
 */

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** Sem VITE_API_URL a aplicação roda em modo mock (lista em memória). */
export const MODO_MOCK = API_URL === '';

export class ApiError extends Error {
  constructor(status, mensagem, corpo) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.corpo = corpo;
  }
}

const ouvintes = new Set();

/** Assina o log de requisições. Retorna a função de cancelamento. */
export function assinarLog(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export function registrarRequisicao(entrada) {
  const registro = {
    ...entrada,
    hora: new Date().toLocaleTimeString('pt-BR'),
    id: Math.random().toString(36).slice(2)
  };
  ouvintes.forEach((fn) => fn(registro));
  return registro;
}

/**
 * Executa uma requisição HTTP e registra o resultado no log.
 * @param {string} metodo GET | POST | PUT | PATCH | DELETE
 * @param {string} caminho ex.: '/funcionarios/3'
 * @param {object} [corpo] enviado como JSON quando informado
 */
export async function request(metodo, caminho, corpo) {
  const url = API_URL + caminho;
  const opcoes = {
    method: metodo,
    headers: { Accept: 'application/json' }
  };
  if (corpo !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch (erro) {
    registrarRequisicao({ metodo, endpoint: caminho, status: 'falha de rede', corpo });
    throw new ApiError(0, 'Não foi possível falar com a API em ' + (API_URL || '/') + '.');
  }

  const texto = await resposta.text();
  const dados = texto ? tentarJson(texto) : null;
  registrarRequisicao({
    metodo,
    endpoint: caminho,
    status: resposta.status + ' ' + resposta.statusText,
    corpo
  });

  if (!resposta.ok) {
    const mensagem = (dados && (dados.mensagem || dados.message)) || 'Erro ' + resposta.status + ' em ' + metodo + ' ' + caminho;
    throw new ApiError(resposta.status, mensagem, dados);
  }
  return dados;
}

function tentarJson(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}
