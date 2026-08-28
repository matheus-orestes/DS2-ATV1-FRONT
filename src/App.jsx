import { useState } from 'react';
import { ABAS } from './constants';
import { API_URL, MODO_MOCK } from './api/client';
import { useFuncionarios } from './hooks/useFuncionarios';
import { useToast } from './hooks/useToast';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import PainelPage from './pages/PainelPage';
import CandidatosPage from './pages/CandidatosPage';
import CadastrarPage from './pages/CadastrarPage';
import EditarPage from './pages/EditarPage';
import StatusPage from './pages/StatusPage';
import ExcluirPage from './pages/ExcluirPage';
import RequisicoesPage from './pages/RequisicoesPage';

const NOME_SISTEMA = 'Contrata RH';

export default function App() {
  const [aba, setAba] = useState('painel');
  const [busca, setBusca] = useState('');
  const [editId, setEditId] = useState(null);
  const [patchId, setPatchId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);

  const { toast, avisar } = useToast();
  const {
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
  } = useFuncionarios();

  const abaAtual = ABAS.find((a) => a.id === aba) || ABAS[0];
  const alvoExclusao = funcionarios.find((f) => f.id === Number(excluirId)) || null;

  function irParaEdicao(id) {
    setEditId(Number(id));
    setAba('editar');
  }

  function irParaPatch(id) {
    setPatchId(Number(id));
    setAba('status');
  }

  async function confirmarExclusao() {
    const alvo = alvoExclusao;
    try {
      await remover(excluirId);
      avisar((alvo ? alvo.nome : 'Registro ' + excluirId) + ' removido da lista', '204 No Content · DELETE /funcionarios/' + excluirId);
    } catch (e) {
      avisar(e.message, 'DELETE /funcionarios/' + excluirId);
    } finally {
      setExcluirId(null);
    }
  }

  async function recarregar() {
    if (MODO_MOCK) {
      await restaurar();
      avisar('Lista restaurada com os dados fictícios', '200 OK · GET /funcionarios');
    } else {
      await carregar();
      avisar('Lista recarregada da API', '200 OK · GET /funcionarios');
    }
  }

  return (
    <div className="app">
      <Sidebar
        nomeSistema={NOME_SISTEMA}
        abaAtiva={aba}
        onNavegar={setAba}
        totalCandidatos={funcionarios.length}
        totalRequisicoes={log.length}
      />

      <main className="main">
        <TopBar
          titulo={abaAtual.titulo}
          endpoint={abaAtual.endpoint}
          busca={busca}
          onBusca={setBusca}
          onRecarregar={recarregar}
        />

        <div className="page">
          {erro ? <div className="aviso">{erro} — verifique se a API está no ar em {API_URL || '(mock)'}.</div> : null}
          {carregando ? <div className="muted">Carregando candidatos…</div> : null}

          {aba === 'painel' ? <PainelPage funcionarios={funcionarios} indicadores={indicadores} log={log} /> : null}

          {aba === 'candidatos' ? (
            <CandidatosPage
              funcionarios={funcionarios}
              busca={busca}
              obter={obter}
              onEditar={irParaEdicao}
              onPatch={irParaPatch}
              onExcluir={setExcluirId}
            />
          ) : null}

          {aba === 'cadastrar' ? <CadastrarPage onCriar={criar} avisar={avisar} /> : null}

          {aba === 'editar' ? (
            <EditarPage
              funcionarios={funcionarios}
              idSelecionado={editId}
              onSelecionar={setEditId}
              onAtualizar={atualizar}
              avisar={avisar}
            />
          ) : null}

          {aba === 'status' ? (
            <StatusPage
              funcionarios={funcionarios}
              idSelecionado={patchId}
              onSelecionar={setPatchId}
              onAtualizarParcial={atualizarParcial}
              avisar={avisar}
            />
          ) : null}

          {aba === 'excluir' ? <ExcluirPage funcionarios={funcionarios} onExcluir={setExcluirId} /> : null}

          {aba === 'log' ? <RequisicoesPage log={log} /> : null}
        </div>
      </main>

      <ConfirmDialog
        aberto={excluirId !== null}
        funcionario={alvoExclusao}
        endpoint={'DELETE ' + (API_URL || '(mock)') + '/funcionarios/' + (excluirId ?? '')}
        onCancelar={() => setExcluirId(null)}
        onConfirmar={confirmarExclusao}
      />

      <Toast toast={toast} />
    </div>
  );
}
