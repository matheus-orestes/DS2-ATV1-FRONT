import { useCallback, useEffect, useMemo, useState } from 'react';
import { funcionariosApi } from '../api/funcionarios';
import { assinarLog } from '../api/client';

/**
 * Estado central dos candidatos: carrega a lista da API e expõe as operações
 * dos cinco métodos HTTP, além do log de requisições.
 */
export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [log, setLog] = useState([]);

  useEffect(() => assinarLog((registro) => setLog((atual) => [registro, ...atual].slice(0, 60))), []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await funcionariosApi.listar();
      setFuncionarios(Array.isArray(dados) ? dados : []);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(async (corpo) => {
    const novo = await funcionariosApi.criar(corpo);
    setFuncionarios((atual) => (novo && novo.id ? [...atual, novo] : atual));
    return novo;
  }, []);

  const atualizar = useCallback(async (id, corpo) => {
    const salvo = await funcionariosApi.atualizar(id, corpo);
    setFuncionarios((atual) => atual.map((f) => (f.id === Number(id) ? (salvo && salvo.id ? salvo : { ...f, ...corpo }) : f)));
    return salvo;
  }, []);

  const atualizarParcial = useCallback(async (id, corpo) => {
    const salvo = await funcionariosApi.atualizarParcial(id, corpo);
    setFuncionarios((atual) => atual.map((f) => (f.id === Number(id) ? (salvo && salvo.id ? salvo : { ...f, ...corpo }) : f)));
    return salvo;
  }, []);

  const remover = useCallback(async (id) => {
    await funcionariosApi.remover(id);
    setFuncionarios((atual) => atual.filter((f) => f.id !== Number(id)));
  }, []);

  const obter = useCallback((id) => funcionariosApi.obter(id), []);

  const restaurar = useCallback(async () => {
    const dados = await funcionariosApi.restaurar();
    if (Array.isArray(dados)) setFuncionarios(dados);
  }, []);

  const indicadores = useMemo(() => {
    const conta = (status) => funcionarios.filter((f) => f.status === status).length;
    return {
      total: funcionarios.length,
      emAnalise: conta('EM_ANALISE'),
      aprovados: conta('APROVADO'),
      reprovados: conta('REPROVADO'),
      contratados: conta('CONTRATADO')
    };
  }, [funcionarios]);

  return {
    funcionarios,
    carregando,
    erro,
    log,
    indicadores,
    criar,
    atualizar,
    atualizarParcial,
    remover,
    obter,
    carregar,
    restaurar
  };
}
