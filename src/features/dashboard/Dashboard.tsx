import { ArrowUpRight, UsersRound } from 'lucide-react';
import { MetricCard } from '../../components/MetricCard';
import { StatusTag } from '../../components/StatusTag';
import { initials, money } from '../../utils/format';
import type { Funcionario, IndicatorSnapshot } from '../../types/funcionario';

interface DashboardProps {
  funcionarios: Funcionario[];
  onOpenCandidates: () => void;
  onView: (id: number) => void;
  indicadores?: IndicatorSnapshot | null;
}

export function Dashboard({ funcionarios, onOpenCandidates, onView, indicadores }: DashboardProps) {
  const localCount = (status: string) => funcionarios.filter((f) => f.status === status).length;
  const total = indicadores?.total || funcionarios.length;
  const count = (status: string) => status === 'EM_ANALISE' ? (indicadores?.emAnalise ?? localCount(status)) : status === 'APROVADO' ? (indicadores?.aprovados ?? localCount(status)) : status === 'REPROVADO' ? (indicadores?.reprovados ?? localCount(status)) : status === 'CONTRATADO' ? (indicadores?.contratados ?? localCount(status)) : localCount(status);
  const departamentos = Object.entries(funcionarios.reduce<Record<string, number>>((acc, item) => {
    const dep = item.departamento || 'Não informado';
    acc[dep] = (acc[dep] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxDep = Math.max(1, ...departamentos.map(([, value]) => value));
  const recentes = [...funcionarios].sort((a, b) => b.id - a.id).slice(0, 5);
  const chart = [
    { label: 'Em análise', value: count('EM_ANALISE'), cls: 'bar-coral' },
    { label: 'Aprovados', value: count('APROVADO'), cls: 'bar-lime' },
    { label: 'Reprovados', value: count('REPROVADO'), cls: 'bar-muted' },
    { label: 'Contratados', value: count('CONTRATADO'), cls: 'bar-green' },
  ];
  const maxChart = Math.max(1, ...chart.map((item) => item.value));

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <div className="hero-kicker">Processo de contratação</div>
          <h2>Olá! 👋</h2>
          <p>{count('EM_ANALISE')} candidatos aguardam avaliação e {count('APROVADO')} já estão aprovados para contratação.</p>
          <button className="btn btn-lime hero-action" onClick={onOpenCandidates}>Ver candidatos <ArrowUpRight size={15} /></button>
        </div>
        <div className="hero-art"><UsersRound size={72} strokeWidth={1.5} /></div>
      </section>

      <section className="metric-grid">
        <MetricCard label="Total" value={total} hint="candidatos no processo" />
        <MetricCard label="Em análise" value={count('EM_ANALISE')} hint="aguardando avaliação" />
        <MetricCard label="Aprovados" value={count('APROVADO')} hint="aptos à contratação" accent />
        <MetricCard label="Contratados" value={count('CONTRATADO')} hint="admissão concluída" accent />
      </section>

      <section className="dashboard-grid">
        <div className="page-stack">
          <div className="card">
            <div className="section-header"><div><h3>Progresso do recrutamento</h3><span>Visão resumida dos últimos candidatos.</span></div><button className="link-button" onClick={onOpenCandidates}>Ver tudo</button></div>
            <div className="table-wrap"><table><thead><tr><th>Nome</th><th>Cargo</th><th>Etapa</th><th>Salário</th></tr></thead><tbody>
              {funcionarios.slice(0, 6).map((f) => <tr key={f.id} onClick={() => onView(f.id)} className="clickable-row"><td><div className="name-cell"><span className="avatar">{initials(f.nome)}</span><div><strong>{f.nome}</strong><small>{f.email}</small></div></div></td><td>{f.cargo}</td><td><StatusTag status={f.status} /></td><td>{money(f.salario)}</td></tr>)}
            </tbody></table></div>
          </div>
        </div>
        <div className="page-stack">
          <div className="card"><div className="section-header"><div><h3>Candidatos recentes</h3><span>Registros mais novos.</span></div><button className="link-button" onClick={onOpenCandidates}>ver todos</button></div>
            <div className="recent-list">{recentes.map((f) => <button className="recent-item" key={f.id} onClick={() => onView(f.id)}><span className="avatar">{initials(f.nome)}</span><span className="recent-copy"><strong>{f.nome}</strong><small>{f.cargo}</small></span><StatusTag status={f.status} /></button>)}</div>
          </div>

          <div className="card"><div className="section-header"><div><h3>Distribuição por status</h3><span>Quantidade de candidatos.</span></div></div>
            <div className="chart">{chart.map((item) => <div className="chart-col" key={item.label}><strong>{item.value}</strong><div className={`chart-bar ${item.cls}`} style={{ height: `${Math.max(8, Math.round((item.value / maxChart) * 100))}px` }} /><small>{item.label}</small></div>)}</div>
          </div>

          <div className="card"><div className="section-header"><div><h3>Por departamento</h3><span>Concentração atual.</span></div></div>
            <div className="dept-list">{departamentos.map(([label, value]) => <div key={label} className="dept-item"><div><span>{label}</span><b>{value}</b></div><div className="progress"><span style={{ width: `${(value / maxDep) * 100}%` }} /></div></div>)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
