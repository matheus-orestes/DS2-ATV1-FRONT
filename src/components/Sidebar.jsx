import { ABAS } from '../constants';

export default function Sidebar({ nomeSistema, abaAtiva, onNavegar, totalCandidatos, totalRequisicoes }) {
  return (
    <aside className="sidebar theme-dark">
      <div className="sidebar-brand">
        <div className="sidebar-mark">
          <i className="ph ph-identification-badge" />
        </div>
        <div>
          <div className="sidebar-name">{nomeSistema}</div>
          <div className="sidebar-sub">Recursos Humanos</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {ABAS.map((aba) => {
          let chip = aba.chip;
          if (aba.id === 'candidatos') chip = String(totalCandidatos);
          if (aba.id === 'log') chip = String(totalRequisicoes);
          return (
            <button
              key={aba.id}
              type="button"
              className={'nav-item' + (aba.id === abaAtiva ? ' is-active' : '')}
              onClick={() => onNavegar(aba.id)}
            >
              <i className={'ph ' + aba.icon} style={{ fontSize: 17 }} />
              <span>{aba.label}</span>
              <span className="nav-chip">{chip}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
