import { MetodoTag } from '../components/Tag';

export default function RequisicoesPage({ log }) {
  return (
    <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-6)' }}>
      <div>
        <h5 style={{ margin: 0 }}>Histórico de requisições</h5>
        <div className="muted" style={{ fontSize: 12 }}>
          Cada ação da interface corresponde a uma chamada HTTP à API Spring Boot.
        </div>
      </div>
      <div className="table-scroll">
        <table className="table" style={{ minWidth: 620 }}>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Método</th>
              <th>Endpoint</th>
              <th>Resposta</th>
              <th>Corpo</th>
            </tr>
          </thead>
          <tbody>
            {log.map((l) => (
              <tr key={l.id}>
                <td className="muted">{l.hora}</td>
                <td>
                  <MetodoTag metodo={l.metodo} />
                </td>
                <td className="mono">{l.endpoint}</td>
                <td className="muted">{l.status}</td>
                <td className="mono muted" style={{ fontSize: 11.5, maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.corpo ? JSON.stringify(l.corpo) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {log.length === 0 ? (
        <div className="muted" style={{ fontSize: 13, textAlign: 'center', padding: 'var(--space-8)' }}>
          Nenhuma requisição registrada nesta sessão.
        </div>
      ) : null}
    </div>
  );
}
