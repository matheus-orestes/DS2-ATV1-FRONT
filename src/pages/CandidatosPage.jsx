import { useMemo, useState } from 'react';
import { STATUS } from '../constants';
import FuncionariosTable from '../components/FuncionariosTable';
import { Tag } from '../components/Tag';
import { moeda, rotuloStatus } from '../utils/format';

const FILTROS = [{ value: 'TODOS', label: 'Todos' }, ...STATUS];

export default function CandidatosPage({ funcionarios, busca, onEditar, onPatch, onExcluir, obter }) {
  const [filtro, setFiltro] = useState('TODOS');
  const [idBusca, setIdBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [erroBusca, setErroBusca] = useState('');

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return funcionarios.filter((f) => {
      if (filtro !== 'TODOS' && f.status !== filtro) return false;
      if (!q) return true;
      return [f.nome, f.cargo, f.departamento, f.cidade, rotuloStatus(f.status), f.status]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [funcionarios, busca, filtro]);

  async function consultar(id) {
    setIdBusca(String(id));
    try {
      const dados = await obter(id);
      setSelecionado(dados);
      setErroBusca('');
    } catch (e) {
      setSelecionado(null);
      setErroBusca(e.message);
    }
  }

  const campos = selecionado
    ? [
        { label: 'ID', valor: String(selecionado.id) },
        { label: 'E-mail', valor: selecionado.email },
        { label: 'Telefone', valor: selecionado.telefone || '—' },
        { label: 'Cidade', valor: selecionado.cidade || '—' },
        { label: 'Salário', valor: moeda(selecionado.salario) },
        { label: 'Status', valor: rotuloStatus(selecionado.status) }
      ]
    : [];

  return (
    <div className="split">
      <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-6)', minWidth: 0 }}>
        <div className="row">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={'chip' + (filtro === f.value ? ' is-active' : '')}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </button>
          ))}
          <div className="muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
            {filtrados.length} de {funcionarios.length} candidatos
          </div>
        </div>

        <FuncionariosTable
          funcionarios={filtrados}
          onVer={consultar}
          onEditar={onEditar}
          onPatch={onPatch}
          onExcluir={onExcluir}
        />

        {filtrados.length === 0 ? (
          <div className="muted" style={{ padding: 'var(--space-8)', textAlign: 'center', fontSize: 13 }}>
            Nenhum candidato corresponde aos critérios informados.
          </div>
        ) : null}
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
        <div className="row">
          <h5 style={{ margin: 0 }}>Consulta por ID</h5>
          <Tag variante="tag-outline" style={{ marginLeft: 'auto' }}>GET</Tag>
        </div>
        <div style={{ display: 'flex', gap: 5.6 }}>
          <input
            className="input"
            value={idBusca}
            onChange={(e) => setIdBusca(e.target.value)}
            placeholder="ID"
            style={{ width: 80 }}
          />
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => consultar(idBusca)}>
            Consultar
          </button>
        </div>

        {selecionado ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8.4, paddingTop: 5.6 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{selecionado.nome}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {selecionado.cargo} · {selecionado.departamento}
              </div>
            </div>
            {campos.map((c) => (
              <div className="detalhe-linha" key={c.label}>
                <span className="muted">{c.label}</span>
                <span style={{ textAlign: 'right' }}>{c.valor}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 5.6, marginTop: 5.6 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onEditar(selecionado.id)}>
                Editar
              </button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onPatch(selecionado.id)}>
                Status
              </button>
            </div>
          </div>
        ) : null}

        {erroBusca ? <div className="aviso">{erroBusca}</div> : null}
      </div>
    </div>
  );
}
