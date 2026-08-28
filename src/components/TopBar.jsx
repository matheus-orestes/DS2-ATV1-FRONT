export default function TopBar({ titulo, endpoint, busca, onBusca, onRecarregar }) {
  return (
    <header className="topbar">
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0 }}>{titulo}</h3>
        <div className="topbar-endpoint">{endpoint}</div>
      </div>
      <div className="topbar-actions">
        <div className="search">
          <i className="ph ph-magnifying-glass" />
          <input
            className="input"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
            placeholder="Pesquisar nome, cargo ou status"
          />
        </div>
        <button type="button" className="btn btn-secondary btn-icon" title="Recarregar" onClick={onRecarregar}>
          <i className="ph ph-arrow-clockwise" style={{ fontSize: 16 }} />
        </button>
        <button type="button" className="btn btn-secondary btn-icon" title="Sair">
          <i className="ph ph-sign-out" style={{ fontSize: 16 }} />
        </button>
      </div>
    </header>
  );
}
