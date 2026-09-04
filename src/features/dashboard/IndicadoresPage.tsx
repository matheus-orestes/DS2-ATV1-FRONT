import { BarChart3, RefreshCw } from 'lucide-react';
import type { Indicadores } from '../../types/funcionario';

interface Props {
  indicadores: Indicadores;
  loading: boolean;
  error?: string;
  onRefresh: () => void;
}

export function IndicadoresPage({ indicadores, loading, error, onRefresh }: Props) {
  const cards = [
    ['Total', indicadores.total ?? 0],
    ['Em análise', indicadores.emAnalise ?? 0],
    ['Aprovados', indicadores.aprovados ?? 0],
    ['Reprovados', indicadores.reprovados ?? 0],
    ['Contratados', indicadores.contratados ?? 0],
  ] as const;

  return (
    <div className="page-stack">
      <section className="indicator-hero card">
        <div>
          <div className="eyebrow">Endpoint extra</div>
          <h2>GET /funcionarios/indicadores</h2>
          <p>Consulta dedicada para os indicadores consolidados do processo de contratação.</p>
        </div>
        <button className="btn btn-primary" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          {loading ? 'Consultando…' : 'Atualizar indicadores'}
        </button>
      </section>

      {error && <div className="form-error" role="alert">{error}</div>}

      <section className="metric-grid metric-grid-five">
        {cards.map(([label, value]) => (
          <div className="card metric-card" key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value accent-value">{loading ? '—' : value}</div>
            <div className="metric-hint">retorno do endpoint</div>
          </div>
        ))}
      </section>

      <section className="card indicator-response-card">
        <div className="section-header">
          <div>
            <h3>Resposta do GET</h3>
            <span>Prévia normalizada que a interface utiliza.</span>
          </div>
          <span className="tag tag-green"><BarChart3 size={13} /> GET</span>
        </div>
        <pre>{JSON.stringify({
          total: indicadores.total ?? 0,
          emAnalise: indicadores.emAnalise ?? 0,
          aprovados: indicadores.aprovados ?? 0,
          reprovados: indicadores.reprovados ?? 0,
          contratados: indicadores.contratados ?? 0,
        }, null, 2)}</pre>
      </section>
    </div>
  );
}
