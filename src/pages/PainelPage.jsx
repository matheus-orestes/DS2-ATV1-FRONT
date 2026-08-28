import { MetodoTag } from '../components/Tag';

const CORES = {
  EM_ANALISE: 'var(--color-neutral-500)',
  APROVADO: 'var(--color-mark)',
  REPROVADO: 'var(--color-neutral-300)',
  CONTRATADO: 'var(--color-accent-500)'
};

export default function PainelPage({ funcionarios, indicadores, log }) {
  const cards = [
    { label: 'Total', valor: indicadores.total, hint: 'candidatos na lista', cor: 'var(--color-text)' },
    { label: 'Em análise', valor: indicadores.emAnalise, hint: 'aguardando avaliação', cor: 'var(--color-neutral-400)' },
    { label: 'Aprovados', valor: indicadores.aprovados, hint: 'aptos à contratação', cor: 'var(--color-accent-300)' },
    { label: 'Reprovados', valor: indicadores.reprovados, hint: 'fora do processo', cor: 'var(--color-neutral-400)' },
    { label: 'Contratados', valor: indicadores.contratados, hint: 'admissão concluída', cor: 'var(--color-accent-400)' }
  ];

  const barras = [
    { chave: 'EM_ANALISE', label: 'Em análise', valor: indicadores.emAnalise },
    { chave: 'APROVADO', label: 'Aprovado', valor: indicadores.aprovados },
    { chave: 'REPROVADO', label: 'Reprovado', valor: indicadores.reprovados },
    { chave: 'CONTRATADO', label: 'Contratado', valor: indicadores.contratados }
  ];
  const maior = Math.max(1, ...barras.map((b) => b.valor));

  const porDepartamento = {};
  funcionarios.forEach((f) => {
    const d = f.departamento || 'Não informado';
    porDepartamento[d] = (porDepartamento[d] || 0) + 1;
  });
  const maiorDep = Math.max(1, ...Object.values(porDepartamento));
  const departamentos = Object.keys(porDepartamento)
    .sort((a, b) => porDepartamento[b] - porDepartamento[a])
    .slice(0, 6);

  return (
    <>
      <div className="grid-kpi">
        {cards.map((c) => (
          <div className="card" key={c.label} style={{ gap: 5.6 }}>
            <div className="card-kicker" style={{ color: c.cor }}>{c.label}</div>
            <div className="kpi-value">{c.valor}</div>
            <div className="kpi-hint">{c.hint}</div>
          </div>
        ))}
      </div>

      <div className="split">
        <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-6)' }}>
          <div>
            <h5 style={{ margin: 0 }}>Distribuição por status</h5>
            <div className="muted" style={{ fontSize: 12 }}>Candidatos no processo de contratação</div>
          </div>
          <div className="chart">
            {barras.map((b) => (
              <div className="chart-col" key={b.chave}>
                <div style={{ fontSize: 13, color: 'var(--color-neutral-300)' }}>{b.valor}</div>
                <div
                  className="chart-bar"
                  style={{ height: Math.max(6, Math.round((b.valor / maior) * 170)), background: CORES[b.chave] }}
                />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {barras.map((b) => (
              <span key={b.chave}>{b.label}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
            <h5 style={{ margin: 0 }}>Por departamento</h5>
            {departamentos.map((d) => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{d}</span>
                  <span className="muted">{porDepartamento[d]}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: Math.round((porDepartamento[d] / maiorDep) * 100) + '%' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-3)' }}>
            <h5 style={{ margin: 0 }}>Últimas requisições</h5>
            {log.slice(0, 4).map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 8.4, fontSize: 12 }}>
                <MetodoTag metodo={l.metodo} style={{ minWidth: 56, justifyContent: 'center' }} />
                <span className="mono" style={{ color: 'var(--color-neutral-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.endpoint}
                </span>
                <span className="muted" style={{ marginLeft: 'auto' }}>{l.status}</span>
              </div>
            ))}
            {log.length === 0 ? <div className="muted" style={{ fontSize: 12 }}>Nenhuma requisição ainda.</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
