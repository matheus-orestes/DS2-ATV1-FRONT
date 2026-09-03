import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, ClipboardList, FilePlus2, LayoutDashboard, PencilLine, Search, SlidersHorizontal, Trash2, UserRoundPlus, UsersRound, WifiOff } from 'lucide-react';
import { ConfirmModal } from './components/ConfirmModal';
import { Dashboard } from './features/dashboard/Dashboard';
import { DEMO_FUNCIONARIOS } from './features/funcionarios/seed';
import { FuncionarioDetails } from './features/funcionarios/FuncionarioDetails';
import { FuncionarioForm } from './features/funcionarios/FuncionarioForm';
import { FuncionarioPatch } from './features/funcionarios/FuncionarioPatch';
import { FuncionariosTable } from './features/funcionarios/FuncionariosTable';
import { API_BASE_URL, funcionarioApi } from './services/api';
import type { Funcionario, FuncionarioPayload, StatusFuncionario } from './types/funcionario';
import { STATUS_OPTIONS, normalizeFuncionarios, normalizeIndicators } from './utils/format';

type Page = 'painel' | 'candidatos' | 'cadastrar' | 'editar' | 'status' | 'excluir' | 'log';
type LogItem = { id: string; hora: string; method: string; endpoint: string; status: string; body: string };

const EMPTY_FORM: FuncionarioPayload = { nome: '', email: '', telefone: '', cargo: '', departamento: '', salario: 0, cidade: '', status: 'EM_ANALISE' };
const navItems: Array<{ id: Page; label: string; icon: typeof LayoutDashboard; chip?: string }> = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'candidatos', label: 'Candidatos', icon: UsersRound },
  { id: 'cadastrar', label: 'Cadastrar', icon: UserRoundPlus, chip: 'POST' },
  { id: 'editar', label: 'Editar', icon: PencilLine, chip: 'PUT' },
  { id: 'status', label: 'Atualizar status', icon: SlidersHorizontal, chip: 'PATCH' },
  { id: 'excluir', label: 'Excluir', icon: Trash2, chip: 'DELETE' },
  { id: 'log', label: 'Requisições', icon: Activity },
];

function toPayload(f: Funcionario): FuncionarioPayload {
  return { nome: f.nome || '', email: f.email || '', telefone: f.telefone || '', cargo: f.cargo || '', departamento: f.departamento || '', salario: Number(f.salario) || 0, cidade: f.cidade || '', status: f.status || 'EM_ANALISE' };
}

function App() {
  const [page, setPage] = useState<Page>('painel');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [indicadores, setIndicadores] = useState<import('./types/funcionario').IndicatorSnapshot | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('TODOS');
  const [idQuery, setIdQuery] = useState('');
  const [details, setDetails] = useState<Funcionario | undefined>();
  const [form, setForm] = useState<FuncionarioPayload>(EMPTY_FORM);
  const [editing, setEditing] = useState<Funcionario | undefined>();
  const [patchTarget, setPatchTarget] = useState<Funcionario | undefined>();
  const [patchValues, setPatchValues] = useState({ cargo: false, status: true, salario: false, cargoValue: '', statusValue: 'APROVADO' as StatusFuncionario, salarioValue: 0 });
  const [errorForm, setErrorForm] = useState('');
  const [busyAction, setBusyAction] = useState(false);
  const [confirm, setConfirm] = useState<Funcionario | undefined>();
  const [log, setLog] = useState<LogItem[]>([]);
  const [toast, setToast] = useState('');

  const registrar = useCallback((method: string, endpoint: string, status: string, body?: unknown) => {
    setLog((current) => [{ id: crypto.randomUUID(), hora: new Date().toLocaleTimeString('pt-BR'), method, endpoint, status, body: body ? JSON.stringify(body) : '—' }, ...current].slice(0, 50));
  }, []);

  const avisar = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  }, []);

  const loadFuncionarios = useCallback(async () => {
    setLoading(true);
    try {
      const [listResult, indicatorResult] = await Promise.allSettled([funcionarioApi.findAll(), funcionarioApi.indicadores()]);
      if (listResult.status === 'fulfilled') {
        const data = normalizeFuncionarios(listResult.value.data);
        setFuncionarios(data);
        setUsingDemo(false);
        setApiError('');
        registrar('GET', '/funcionarios', `${listResult.value.status} ${listResult.value.statusText || 'OK'}`);
      } else {
        const message = listResult.reason instanceof Error ? listResult.reason.message : 'Falha ao consultar a API.';
        setFuncionarios(DEMO_FUNCIONARIOS);
        setUsingDemo(true);
        setApiError(`A API não pôde ser consultada agora. Exibindo dados de demonstração. ${message}`);
        registrar('GET', '/funcionarios', 'FALHA', { message });
      }
      if (indicatorResult.status === 'fulfilled') {
        setIndicadores(normalizeIndicators(indicatorResult.value.data));
        registrar('GET', '/funcionarios/indicadores', `${indicatorResult.value.status} ${indicatorResult.value.statusText || 'OK'}`);
      } else {
        setIndicadores(null);
      }
    } finally { setLoading(false); }
  }, [registrar]);

  useEffect(() => { void loadFuncionarios(); }, [loadFuncionarios]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return funcionarios.filter((f) => {
      const matchFilter = filter === 'TODOS' || f.status === filter;
      const matchSearch = !term || [f.nome, f.email, f.cargo, f.departamento, f.cidade, f.status].join(' ').toLowerCase().includes(term);
      return matchFilter && matchSearch;
    });
  }, [funcionarios, query, filter]);

  const findRemoteById = async (id: number) => {
    setBusyAction(true);
    try { const result = await funcionarioApi.findById(id); setDetails(result.data); registrar('GET', `/funcionarios/${id}`, `${result.status} ${result.statusText || 'OK'}`); setSelectedId(id); }
    catch (error) { const message = error instanceof Error ? error.message : 'Funcionário não encontrado.'; setDetails(undefined); registrar('GET', `/funcionarios/${id}`, 'FALHA', { message }); setErrorForm(message); }
    finally { setBusyAction(false); }
  };

  const openEdit = async (id: number) => {
    setPage('editar'); setErrorForm('');
    try {
      const remote = await funcionarioApi.findById(id); setEditing(remote.data); setSelectedId(id); registrar('GET', `/funcionarios/${id}`, `${remote.status} ${remote.statusText || 'OK'}`);
    } catch { const local = funcionarios.find((item) => item.id === id); setEditing(local); setSelectedId(id); registrar('GET', `/funcionarios/${id}`, usingDemo ? 'DEMO' : 'FALHA'); }
  };

  const openPatch = (id: number) => {
    const local = funcionarios.find((item) => item.id === id); setPatchTarget(local); setPatchValues({ cargo: false, status: true, salario: false, cargoValue: local?.cargo || '', statusValue: local?.status || 'APROVADO', salarioValue: Number(local?.salario) || 0 }); setSelectedId(id); setPage('status'); setErrorForm('');
  };

  const create = async () => {
    if (!form.nome.trim() || !form.email.trim() || !form.cargo.trim()) return setErrorForm('Nome, e-mail e cargo são obrigatórios.');
    setBusyAction(true); setErrorForm('');
    try {
      const result = await funcionarioApi.create(form);
      const created = result.data;
      setFuncionarios((current) => [...current, created]); setForm(EMPTY_FORM); registrar('POST', '/funcionarios', `${result.status} ${result.statusText || 'Created'}`, form); avisar('Candidato cadastrado com sucesso.'); setPage('candidatos');
    } catch (error) { const message = error instanceof Error ? error.message : 'Falha ao cadastrar.'; setErrorForm(message); registrar('POST', '/funcionarios', 'FALHA', form); }
    finally { setBusyAction(false); }
  };

  const update = async () => {
    if (!editing) return;
    const payload = toPayload(editing);
    if (!payload.nome.trim() || !payload.email.trim() || !payload.cargo.trim()) return setErrorForm('Nome, e-mail e cargo são obrigatórios.');
    setBusyAction(true); setErrorForm('');
    try { const result = await funcionarioApi.update(editing.id, payload); setFuncionarios((current) => current.map((item) => item.id === editing.id ? result.data : item)); registrar('PUT', `/funcionarios/${editing.id}`, `${result.status} ${result.statusText || 'OK'}`, payload); avisar('Registro atualizado por completo.'); setPage('candidatos'); }
    catch (error) { const message = error instanceof Error ? error.message : 'Falha ao atualizar.'; setErrorForm(message); registrar('PUT', `/funcionarios/${editing.id}`, 'FALHA', payload); }
    finally { setBusyAction(false); }
  };

  const applyPatch = async () => {
    if (!patchTarget) return;
    const payload: Record<string, unknown> = {};
    if (patchValues.cargo) payload.cargo = patchValues.cargoValue;
    if (patchValues.status) payload.status = patchValues.statusValue;
    if (patchValues.salario) payload.salario = Number(patchValues.salarioValue) || 0;
    if (!Object.keys(payload).length) return setErrorForm('Selecione ao menos um campo para atualizar.');
    setBusyAction(true); setErrorForm('');
    try { const result = await funcionarioApi.patch(patchTarget.id, payload); setFuncionarios((current) => current.map((item) => item.id === patchTarget.id ? ({ ...item, ...(result.data && typeof result.data === 'object' ? result.data : payload) }) : item)); setPatchTarget((current) => current ? ({ ...current, ...(result.data && typeof result.data === 'object' ? result.data : payload) }) : current); registrar('PATCH', `/funcionarios/${patchTarget.id}`, `${result.status} ${result.statusText || 'OK'}`, payload); avisar('Atualização parcial aplicada.'); setPage('candidatos'); }
    catch (error) { const message = error instanceof Error ? error.message : 'Falha no PATCH.'; setErrorForm(message); registrar('PATCH', `/funcionarios/${patchTarget.id}`, 'FALHA', payload); }
    finally { setBusyAction(false); }
  };

  const remove = async () => {
    if (!confirm) return;
    setBusyAction(true);
    try { const result = await funcionarioApi.remove(confirm.id); setFuncionarios((current) => current.filter((item) => item.id !== confirm.id)); registrar('DELETE', `/funcionarios/${confirm.id}`, `${result.status} ${result.statusText || 'No Content'}`); avisar('Candidato removido.'); setConfirm(undefined); if (page === 'excluir') setPage('candidatos'); }
    catch (error) { const message = error instanceof Error ? error.message : 'Falha ao excluir.'; registrar('DELETE', `/funcionarios/${confirm.id}`, 'FALHA', { message }); avisar(message); }
    finally { setBusyAction(false); }
  };

  const consult = async () => {
    const id = Number(idQuery); if (!Number.isInteger(id) || id <= 0) return setErrorForm('Informe um ID válido.');
    await findRemoteById(id);
  };

  const pageTitle: Record<Page, [string, string]> = {
    painel: ['Painel de indicadores', 'Visão geral do processo de contratação'],
    candidatos: ['Candidatos', 'Todos os candidatos cadastrados'],
    cadastrar: ['Cadastrar candidato', 'Registre um novo candidato no processo'],
    editar: ['Editar candidato', 'Revise todos os dados de um candidato'],
    status: ['Atualização parcial', 'Altere apenas o que mudou no processo'],
    excluir: ['Excluir candidato', 'Remova um candidato da lista'],
    log: ['Requisições HTTP', 'Chamadas feitas pela interface nesta sessão'],
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">♙</div><div><strong>Contrata RH</strong><span>Recursos Humanos</span></div></div>
      <div className="menu-label">Menu</div>
      <nav className="sidebar-nav">{navItems.slice(0, 6).map((item) => { const Icon = item.icon; const active = page === item.id; return <button className={`nav-item ${active ? 'active' : ''}`} key={item.id} onClick={() => setPage(item.id)}><Icon size={17} /><span>{item.label}</span>{item.chip && <small>{item.chip}</small>}</button>; })}</nav>
      <div className="menu-label menu-label-spaced">Geral</div>
      <nav className="sidebar-nav">{navItems.slice(6).map((item) => { const Icon = item.icon; return <button className={`nav-item ${page === item.id ? 'active' : ''}`} key={item.id} onClick={() => setPage(item.id)}><Icon size={17} /><span>{item.label}</span>{item.id === 'log' && log.length > 0 && <small>{log.length}</small>}</button>; })}</nav>
      <div className="sidebar-footer"><div className="api-dot" /><div><strong>API conectada</strong><span>{API_BASE_URL.replace(/^https?:\/\//, '')}</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div><div className="eyebrow">Contrata RH</div><h1>{pageTitle[page][0]}</h1><p>{pageTitle[page][1]}</p></div><div className="topbar-actions"><div className="api-badge"><span className={`status-dot ${apiError ? 'offline' : 'online'}`} />{apiError ? 'Modo demonstração' : 'API online'}</div><button className="icon-button" title="Recarregar dados" onClick={() => void loadFuncionarios()}><BarChart3 size={18} /></button></div></header>
      {apiError && <div className="warning-banner"><WifiOff size={16} /><span>{apiError}</span><button onClick={() => void loadFuncionarios()}>Tentar novamente</button></div>}
      {usingDemo && !apiError && <div className="info-banner"><ClipboardList size={16} /><span>Os registros exibidos estão em modo de demonstração.</span></div>}

      <div className="content-body">
        {page === 'painel' && <Dashboard funcionarios={funcionarios} indicadores={indicadores} onOpenCandidates={() => setPage('candidatos')} onView={(id) => { setPage('candidatos'); setIdQuery(String(id)); void findRemoteById(id); }} />}
        {page === 'candidatos' && <div className="split-page"><div className="card list-card"><div className="toolbar"><div className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, cargo, cidade..." /></div><div className="filter-chips"><button className={filter === 'TODOS' ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter('TODOS')}>Todos</button>{STATUS_OPTIONS.map((item) => <button className={filter === item.value ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(item.value)} key={item.value}>{item.label}</button>)}</div><span className="result-count">{filtered.length} de {funcionarios.length} candidatos</span></div><FuncionariosTable rows={filtered} onView={(id) => { setIdQuery(String(id)); void findRemoteById(id); }} onEdit={openEdit} onPatch={openPatch} onDelete={setConfirm} /></div><div className="page-stack"><div className="card"><div className="section-header"><div><h3>Consulta por ID</h3><span>GET /funcionarios/{'{id}'}</span></div><span className="tag tag-neutral">GET</span></div><div className="id-search"><input className="input" value={idQuery} onChange={(e) => setIdQuery(e.target.value)} placeholder="ID" /><button className="btn btn-primary" onClick={consult} disabled={busyAction}>Consultar</button></div>{details && <FuncionarioDetails funcionario={details} onEdit={() => void openEdit(details.id)} onPatch={() => openPatch(details.id)} />}{errorForm && <div className="form-error">{errorForm}</div>}</div></div></div>}
        {page === 'cadastrar' && <FuncionarioForm value={form} onChange={setForm} onSubmit={() => void create()} submitLabel="Cadastrar candidato" busy={busyAction} error={errorForm} title="Novo candidato" subtitle="Preencha os dados que serão enviados à API." method="POST" />}
        {page === 'editar' && <FuncionarioForm value={editing ? toPayload(editing) : EMPTY_FORM} onChange={(next) => setEditing(editing ? { ...editing, ...next } : undefined)} onSubmit={() => void update()} onCancel={() => setPage('candidatos')} submitLabel="Salvar alterações" busy={busyAction} error={errorForm} title="Editar candidato" subtitle={editing ? `Editando #${editing.id} — ${editing.nome}` : 'Selecione um candidato na lista.'} method="PUT" />}
        {page === 'status' && <div className="split-page"><div className="card"><div className="section-header"><div><h3>Selecionar candidato</h3><span>Escolha o registro que receberá o PATCH.</span></div><span className="tag tag-accent">PATCH</span></div><select className="input" value={patchTarget?.id ?? ''} onChange={(e) => e.target.value ? openPatch(Number(e.target.value)) : setPatchTarget(undefined)}><option value="">Selecione…</option>{funcionarios.map((f) => <option key={f.id} value={f.id}>#{f.id} — {f.nome} · {f.cargo}</option>)}</select></div><FuncionarioPatch funcionario={patchTarget} selected={patchValues} onSelectedChange={setPatchValues} onSubmit={() => void applyPatch()} busy={busyAction} error={errorForm} /></div>}
        {page === 'excluir' && <div className="card"><div className="section-header"><div><h3>Excluir candidato</h3><span>A ação pede confirmação antes de chamar DELETE.</span></div><span className="tag tag-outline">DELETE</span></div><FuncionariosTable rows={funcionarios} onView={(id) => { setPage('candidatos'); setIdQuery(String(id)); void findRemoteById(id); }} onEdit={openEdit} onPatch={openPatch} onDelete={setConfirm} /></div>}
        {page === 'log' && <div className="card"><div className="section-header"><div><h3>Histórico de requisições</h3><span>Cada ação registra método, endpoint, resposta e corpo.</span></div><Activity size={19} /></div><div className="table-wrap"><table><thead><tr><th>Hora</th><th>Método</th><th>Endpoint</th><th>Resposta</th><th>Corpo</th></tr></thead><tbody>{log.map((item) => <tr key={item.id}><td className="mono muted">{item.hora}</td><td>{item.method}</td><td className="mono">{item.endpoint}</td><td>{item.status}</td><td><code className="body-code">{item.body}</code></td></tr>)}</tbody></table>{log.length === 0 && <div className="empty-state">Nenhuma requisição registrada nesta sessão.</div>}</div></div>}
      </div>
    </main>
    {confirm && <ConfirmModal funcionario={confirm} onCancel={() => setConfirm(undefined)} onConfirm={() => void remove()} loading={busyAction} />}
    {toast && <div className="toast"><Activity size={17} /><div>{toast}<small>Operação processada</small></div></div>}
  </div>;
}

export default App;
