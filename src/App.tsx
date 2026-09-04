import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  PencilLine,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRoundPlus,
  UsersRound,
  WifiOff,
} from 'lucide-react';
import { ConfirmModal } from './components/ConfirmModal';
import { Mascot } from './components/Mascot';
import { Dashboard } from './features/dashboard/Dashboard';
import { IndicadoresPage } from './features/dashboard/IndicadoresPage';
import { FuncionarioDetails } from './features/funcionarios/FuncionarioDetails';
import { FuncionarioForm } from './features/funcionarios/FuncionarioForm';
import { FuncionarioPatch, type PatchValues } from './features/funcionarios/FuncionarioPatch';
import { FuncionariosTable } from './features/funcionarios/FuncionariosTable';
import { API_BASE_URL, ApiError, funcionarioApi, type HttpMethod } from './services/api';
import type { Funcionario, FuncionarioPayload, StatusFuncionario } from './types/funcionario';
import { STATUS_OPTIONS, normalizeEmail, normalizeIndicators } from './utils/format';
import { transitionMessage, validatePayload } from './utils/validation';

type Page = 'painel' | 'candidatos' | 'cadastrar' | 'editar' | 'status' | 'excluir' | 'indicadores' | 'log';
type LogItem = { id: string; hora: string; method: HttpMethod; endpoint: string; status: string | number; body: string; ok: boolean };

const EMPTY: FuncionarioPayload = {
  nome: '', email: '', telefone: '', cargo: '', departamento: '', salario: 0, cidade: '', status: 'EM_ANALISE',
};

const navItems: Array<{ id: Page; label: string; icon: typeof LayoutDashboard; chip?: string }> = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'candidatos', label: 'Candidatos', icon: UsersRound },
  { id: 'cadastrar', label: 'Cadastrar', icon: UserRoundPlus, chip: 'POST' },
  { id: 'editar', label: 'Editar', icon: PencilLine, chip: 'PUT' },
  { id: 'status', label: 'Atualização parcial', icon: SlidersHorizontal, chip: 'PATCH' },
  { id: 'excluir', label: 'Excluir', icon: Trash2, chip: 'DELETE' },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3, chip: 'GET' },
];

function payloadFromFuncionario(f: Funcionario): FuncionarioPayload {
  return {
    nome: f.nome || '',
    email: f.email || '',
    telefone: f.telefone || '',
    cargo: f.cargo || '',
    departamento: f.departamento || '',
    salario: Number(f.salario) || 0,
    cidade: f.cidade || '',
    status: f.status || 'EM_ANALISE',
  };
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}

export default function App() {
  const [page, setPage] = useState<Page>('painel');
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [indicadores, setIndicadores] = useState({ total: 0, emAnalise: 0, aprovados: 0, reprovados: 0, contratados: 0 });
  const [loading, setLoading] = useState(true);
  const [indicatorLoading, setIndicatorLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [indicatorError, setIndicatorError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('TODOS');
  const [idQuery, setIdQuery] = useState('');
  const [details, setDetails] = useState<Funcionario | undefined>();
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Funcionario | undefined>();
  const [patchTarget, setPatchTarget] = useState<Funcionario | undefined>();
  const [patchValues, setPatchValues] = useState<PatchValues>({
    cargo: false,
    status: true,
    salario: false,
    cargoValue: '',
    statusValue: 'APROVADO' as StatusFuncionario,
    salarioValue: 0,
  });
  const [errorForm, setErrorForm] = useState('');
  const [bootLoading, setBootLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Funcionario | undefined>();
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState('');
  const [log, setLog] = useState<LogItem[]>([]);

  const logCall = useCallback((method: HttpMethod, endpoint: string, status: string | number, body?: unknown, ok = true) => {
    setLog((items) => [{
      id: crypto.randomUUID(),
      hora: new Date().toLocaleTimeString('pt-BR'),
      method,
      endpoint,
      status,
      body: body === undefined ? '—' : JSON.stringify(body, null, 2),
      ok,
    }, ...items].slice(0, 60));
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }, []);

  const loadFuncionarios = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const r = await funcionarioApi.findAll();
      setFuncionarios(r.data);
      logCall('GET', '/funcionarios', `${r.status} ${r.statusText || 'OK'}`);
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError(0, 'GET', `${API_BASE_URL}/funcionarios`, errorText(e), errorText(e));
      setFuncionarios([]);
      setApiError(err.message);
      logCall('GET', '/funcionarios', err.status || 'NETWORK', undefined, false);
    } finally {
      setLoading(false);
    }
  }, [logCall]);

  const loadIndicators = useCallback(async () => {
    setIndicatorLoading(true);
    setIndicatorError('');
    try {
      const r = await funcionarioApi.getIndicadores();
      setIndicadores(normalizeIndicators(r.data));
      logCall('GET', '/funcionarios/indicadores', `${r.status} ${r.statusText || 'OK'}`);
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError(0, 'GET', `${API_BASE_URL}/funcionarios/indicadores`, errorText(e), errorText(e));
      setIndicatorError(err.message);
      logCall('GET', '/funcionarios/indicadores', err.status || 'NETWORK', undefined, false);
    } finally {
      setIndicatorLoading(false);
    }
  }, [logCall]);

  const refresh = useCallback(async () => {
    await Promise.allSettled([loadFuncionarios(), loadIndicators()]);
  }, [loadFuncionarios, loadIndicators]);

  useEffect(() => {
    let active = true;
    const started = Date.now();
    const maxTimer = window.setTimeout(() => {
      if (active) setBootLoading(false);
    }, 2600);
    void refresh().finally(() => {
      const wait = Math.max(0, 700 - (Date.now() - started));
      window.setTimeout(() => {
        if (active) setBootLoading(false);
      }, wait);
    });
    return () => {
      active = false;
      window.clearTimeout(maxTimer);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return funcionarios.filter((f) => {
      const matchesFilter = filter === 'TODOS' || f.status === filter;
      const haystack = [f.nome, f.email, f.cargo, f.departamento, f.cidade, f.status].join(' ').toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [funcionarios, query, filter]);

  const fetchById = useCallback(async (id: number) => {
    setBusy(true);
    setErrorForm('');
    try {
      const r = await funcionarioApi.findById(id);
      setDetails(r.data);
      setIdQuery(String(id));
      logCall('GET', `/funcionarios/${id}`, `${r.status} ${r.statusText || 'OK'}`);
      return r.data;
    } catch (e) {
      const msg = errorText(e);
      setErrorForm(msg);
      setDetails(undefined);
      const err = e instanceof ApiError ? e : null;
      logCall('GET', `/funcionarios/${id}`, err?.status || 'NETWORK', undefined, false);
      return undefined;
    } finally {
      setBusy(false);
    }
  }, [logCall]);

  const selectPage = (next: Page) => {
    setPage(next);
    setErrorForm('');
    setFieldErrors({});
    if (next === 'status' && !patchTarget && funcionarios[0]) {
      const f = funcionarios[0];
      setPatchTarget(f);
      setPatchValues({ cargo: false, status: true, salario: false, cargoValue: f.cargo || '', statusValue: f.status, salarioValue: Number(f.salario) || 0 });
    }
  };

  const openEdit = async (id: number) => {
    const f = await fetchById(id);
    if (f) {
      setEditing(f);
      setPage('editar');
    }
  };

  const openPatch = async (id: number) => {
    const f = await fetchById(id);
    if (f) {
      setPatchTarget(f);
      setPatchValues({ cargo: false, status: true, salario: false, cargoValue: f.cargo || '', statusValue: f.status, salarioValue: Number(f.salario) || 0 });
      setPage('status');
    }
  };

  const consult = async () => {
    const id = Number(idQuery);
    if (!Number.isInteger(id) || id <= 0) {
      setErrorForm('Informe um ID válido.');
      return;
    }
    await fetchById(id);
  };

  const create = async () => {
    const errors = validatePayload(form, funcionarios);
    setFieldErrors(errors);
    setErrorForm('');
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      const payload = { ...form, email: normalizeEmail(form.email), status: 'EM_ANALISE' as StatusFuncionario };
      const r = await funcionarioApi.create(payload);
      logCall('POST', '/funcionarios', `${r.status} ${r.statusText || 'Created'}`, payload);
      notify('Candidato cadastrado com sucesso.');
      setForm(EMPTY);
      setFieldErrors({});
      await refresh();
      setPage('candidatos');
    } catch (e) {
      setErrorForm(errorText(e));
      const err = e instanceof ApiError ? e : null;
      logCall('POST', '/funcionarios', err?.status || 'NETWORK', form, false);
    } finally {
      setBusy(false);
    }
  };

  const update = async () => {
    if (!editing) return;
    const p = payloadFromFuncionario(editing);
    const errors = validatePayload(p, funcionarios, editing.id);
    const current = funcionarios.find((f) => f.id === editing.id)?.status || editing.status;
    const transition = transitionMessage(current, p.status);
    if (transition) errors.status = transition;
    setFieldErrors(errors);
    setErrorForm('');
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      const r = await funcionarioApi.update(editing.id, p);
      logCall('PUT', `/funcionarios/${editing.id}`, `${r.status} ${r.statusText || 'OK'}`, p);
      notify('Registro atualizado por completo.');
      await refresh();
      setEditing(undefined);
      setPage('candidatos');
    } catch (e) {
      setErrorForm(errorText(e));
      const err = e instanceof ApiError ? e : null;
      logCall('PUT', `/funcionarios/${editing.id}`, err?.status || 'NETWORK', p, false);
    } finally {
      setBusy(false);
    }
  };

  const applyPatch = async () => {
    if (!patchTarget) return;
    const body: Record<string, unknown> = {};
    if (patchValues.cargo) body.cargo = patchValues.cargoValue.trim();
    if (patchValues.status) body.status = patchValues.statusValue;
    if (patchValues.salario) body.salario = Number(patchValues.salarioValue);

    if (!Object.keys(body).length) {
      setErrorForm('Selecione ao menos um campo para atualizar.');
      return;
    }
    if (patchValues.cargo && !patchValues.cargoValue.trim()) {
      setErrorForm('Cargo não pode ficar vazio.');
      return;
    }
    if (patchValues.salario && (!Number.isFinite(Number(patchValues.salarioValue)) || Number(patchValues.salarioValue) <= 0)) {
      setErrorForm('Salário precisa ser maior que zero.');
      return;
    }
    if (patchValues.salario && Number(patchValues.salarioValue) > 1_000_000) {
      setErrorForm('O salário não pode ultrapassar R$ 1.000.000,00.');
      return;
    }
    const transition = patchValues.status ? transitionMessage(patchTarget.status, patchValues.statusValue) : '';
    if (transition) {
      setErrorForm(transition);
      return;
    }

    setBusy(true);
    setErrorForm('');
    try {
      const r = await funcionarioApi.patch(patchTarget.id, body);
      logCall('PATCH', `/funcionarios/${patchTarget.id}`, `${r.status} ${r.statusText || 'OK'}`, body);
      notify('Atualização parcial aplicada.');
      await refresh();
      setPatchTarget(undefined);
      setPage('candidatos');
    } catch (e) {
      setErrorForm(errorText(e));
      const err = e instanceof ApiError ? e : null;
      logCall('PATCH', `/funcionarios/${patchTarget.id}`, err?.status || 'NETWORK', body, false);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    setDeleteError('');
    try {
      const r = await funcionarioApi.remove(confirm.id);
      logCall('DELETE', `/funcionarios/${confirm.id}`, `${r.status} ${r.statusText || 'No Content'}`);
      notify('Candidato removido.');
      setConfirm(undefined);
      await refresh();
    } catch (e) {
      setDeleteError(errorText(e));
      const err = e instanceof ApiError ? e : null;
      logCall('DELETE', `/funcionarios/${confirm.id}`, err?.status || 'NETWORK', undefined, false);
    } finally {
      setBusy(false);
    }
  };

  const pageTitle: Record<Page, [string, string]> = {
    painel: ['Painel de indicadores', 'Visão geral do processo de contratação'],
    candidatos: ['Candidatos', 'Todos os candidatos cadastrados'],
    cadastrar: ['Cadastrar candidato', 'Registre um novo candidato no processo'],
    editar: ['Editar candidato', 'Revise todos os dados de um candidato'],
    status: ['Atualização parcial', 'Altere somente os campos que mudaram'],
    excluir: ['Excluir candidato', 'Remova um candidato da lista'],
    indicadores: ['Indicadores', 'Endpoint extra: GET /funcionarios/indicadores'],
    log: ['Requisições HTTP', 'Chamadas feitas pela interface nesta sessão'],
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark mascot-brand"><Mascot size={38} /></div>
          <div><strong>Contrata RH</strong><span>Recursos Humanos</span></div>
        </div>

        <div className="menu-label">Menu</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => selectPage(item.id)}>
                <Icon size={17} />
                <span>{item.label}</span>
                {item.chip && <small>{item.chip}</small>}
              </button>
            );
          })}
        </nav>

        <div className="menu-label menu-label-spaced">Geral</div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'log' ? 'active' : ''}`} onClick={() => selectPage('log')}>
            <Activity size={17} /><span>Requisições</span>{log.length > 0 && <small>{log.length}</small>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className={`api-dot ${apiError ? 'offline' : ''}`} />
          <div><strong>{apiError ? 'API indisponível' : 'API conectada'}</strong><span>{API_BASE_URL.replace(/^https?:\/\//, '')}</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">Contrata RH</div>
            <h1>{pageTitle[page][0]}</h1>
            <p>{pageTitle[page][1]}</p>
          </div>
          <div className="topbar-actions">
            <div className="api-badge"><span className={`status-dot ${apiError || indicatorError ? 'offline' : 'online'}`} />{apiError || indicatorError ? 'API com erro' : 'API online'}</div>
            <button className="icon-button" title="Sincronizar" onClick={() => void refresh()} disabled={loading || indicatorLoading}><BarChart3 size={18} /></button>
          </div>
        </header>

        {apiError && <div className="warning-banner"><WifiOff size={16} /><span>{apiError}</span><button onClick={() => void loadFuncionarios()}>Tentar novamente</button></div>}
        {indicatorError && <div className="warning-banner"><WifiOff size={16} /><span>Indicadores: {indicatorError}</span><button onClick={() => void loadIndicators()}>Tentar novamente</button></div>}

        <div className="content-body">
          {page === 'painel' && <Dashboard funcionarios={funcionarios} indicadores={indicadores} onOpenCandidates={() => setPage('candidatos')} onView={(id) => { setPage('candidatos'); setIdQuery(String(id)); void fetchById(id); }} />}

          {page === 'indicadores' && <IndicadoresPage indicadores={indicadores} loading={indicatorLoading} error={indicatorError} onRefresh={() => void loadIndicators()} />}

          {page === 'candidatos' && (
            <div className="split-page">
              <div className="card list-card">
                <div className="toolbar">
                  <div className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, cargo, cidade..." /></div>
                  <div className="filter-chips">
                    <button className={`filter-chip ${filter === 'TODOS' ? 'active' : ''}`} onClick={() => setFilter('TODOS')}>Todos</button>
                    {STATUS_OPTIONS.map((s) => <button key={s.value} className={`filter-chip ${filter === s.value ? 'active' : ''}`} onClick={() => setFilter(s.value)}>{s.label}</button>)}
                  </div>
                  <span className="result-count">{loading ? 'Carregando…' : `${filtered.length} de ${funcionarios.length} candidatos`}</span>
                </div>
                {loading ? <div className="empty-state">Carregando funcionários da API…</div> : apiError ? <div className="empty-state">A lista não pode ser exibida enquanto a API estiver indisponível.</div> : <FuncionariosTable rows={filtered} onView={(id) => { setIdQuery(String(id)); void fetchById(id); }} onEdit={openEdit} onPatch={openPatch} onDelete={(f) => { if (f.status === 'CONTRATADO') { notify('Contratados não podem ser excluídos pela interface.'); return; } setDeleteError(''); setConfirm(f); }} />}
                {!loading && !apiError && !filtered.length && <div className="empty-state">Nenhum candidato corresponde aos filtros.</div>}
              </div>

              <div className="page-stack">
                <div className="card">
                  <div className="section-header"><div><h3>Consulta por ID</h3><span>GET /funcionarios/{'{id}'}</span></div><span className="tag tag-neutral">GET</span></div>
                  <div className="id-search"><input className="input" value={idQuery} onChange={(e) => setIdQuery(e.target.value)} placeholder="ID" inputMode="numeric" /><button className="btn btn-primary" onClick={consult} disabled={busy}>Consultar</button></div>
                  {details ? <FuncionarioDetails funcionario={details} onEdit={() => void openEdit(details.id)} onPatch={() => void openPatch(details.id)} /> : <div className="empty-state">Consulte um ID para exibir os dados completos.</div>}
                  {errorForm && <div className="form-error">{errorForm}</div>}
                </div>
              </div>
            </div>
          )}

          {page === 'cadastrar' && <FuncionarioForm value={form} onChange={(next) => { setForm(next); setFieldErrors({}); setErrorForm(''); }} onSubmit={() => void create()} submitLabel="Cadastrar candidato" busy={busy} error={errorForm} fieldErrors={fieldErrors} title="Novo candidato" subtitle="Preencha os dados que serão enviados à API." method="POST" />}

          {page === 'editar' && <FuncionarioForm value={editing ? payloadFromFuncionario(editing) : EMPTY} onChange={(next) => setEditing(editing ? { ...editing, ...next } : undefined)} onSubmit={() => void update()} onCancel={() => { setEditing(undefined); setPage('candidatos'); }} submitLabel="Salvar alterações" busy={busy} error={errorForm} fieldErrors={fieldErrors} title={editing ? `Editar ${editing.nome}` : 'Editar candidato'} subtitle={editing ? `Registro #${editing.id} · PUT substitui o registro completo.` : 'Selecione um candidato na lista.'} method="PUT" />}

          {page === 'status' && (
            <div className="page-stack">
              <section className="card selector-card">
                <div className="section-header"><div><div className="eyebrow">PATCH</div><h3>Selecionar candidato</h3><span>Escolha o registro que receberá a atualização parcial.</span></div><span className="tag tag-lime">/funcionarios/{patchTarget?.id ?? 'id'}</span></div>
                <select className="input candidate-select" value={patchTarget?.id ?? ''} onChange={(e) => { const id = Number(e.target.value); if (id) void openPatch(id); else setPatchTarget(undefined); }} disabled={busy}>
                  <option value="">Selecione um candidato…</option>
                  {funcionarios.map((f) => <option key={f.id} value={f.id}>#{f.id} — {f.nome} · {f.cargo} · {f.status}</option>)}
                </select>
              </section>
              <FuncionarioPatch funcionario={patchTarget} selected={patchValues} onSelectedChange={setPatchValues} onSubmit={() => void applyPatch()} onCancel={() => { setPatchTarget(undefined); setPage('candidatos'); }} busy={busy} error={errorForm} />
            </div>
          )}

          {page === 'excluir' && (
            <div className="card">
              <div className="section-header"><div><h3>Excluir candidato</h3><span>A ação pede confirmação antes de chamar DELETE.</span></div><span className="tag tag-outline">DELETE</span></div>
              <FuncionariosTable rows={funcionarios} onView={(id) => { setPage('candidatos'); setIdQuery(String(id)); void fetchById(id); }} onEdit={openEdit} onPatch={openPatch} onDelete={(f) => { if (f.status === 'CONTRATADO') { notify('Contratados não podem ser excluídos pela interface.'); return; } setDeleteError(''); setConfirm(f); }} />
            </div>
          )}

          {page === 'log' && (
            <div className="card">
              <div className="section-header"><div><h3>Histórico de requisições</h3><span>Método, endpoint, status e corpo efetivamente usados.</span></div><button className="btn btn-secondary" onClick={() => setLog([])} disabled={!log.length}>Limpar</button></div>
              <div className="table-wrap"><table><thead><tr><th>Hora</th><th>Método</th><th>Endpoint</th><th>Resposta</th><th>Corpo</th></tr></thead><tbody>{log.map((item) => <tr key={item.id}><td className="mono muted">{item.hora}</td><td><span className={item.method === 'DELETE' ? 'tag tag-outline' : item.method === 'PUT' ? 'tag tag-green' : 'tag tag-lime'}>{item.method}</span></td><td className="mono">{item.endpoint}</td><td><span className={item.ok ? 'tag tag-green' : 'tag tag-outline'}>{item.status}</span></td><td><code className="body-code">{item.body}</code></td></tr>)}</tbody></table>{!log.length && <div className="empty-state">Nenhuma requisição registrada nesta sessão.</div>}</div>
            </div>
          )}
        </div>
      </main>

      {bootLoading && <div className="boot-screen" role="status" aria-live="polite"><div className="boot-card"><div className="boot-mascot-wrap"><Mascot size={190} /></div><div className="eyebrow">Contrata RH</div><h2>Seu copiloto de RH</h2><p>Organizando candidatos e preparando o painel…</p><div className="boot-progress"><span /></div></div></div>}
      {confirm && <ConfirmModal funcionario={confirm} onCancel={() => setConfirm(undefined)} onConfirm={() => void remove()} loading={busy} error={deleteError} />}
      {toast && <div className="toast"><Activity size={17} /><div>{toast}<small>Operação processada</small></div></div>}
    </div>
  );
}
