import { moeda } from '../utils/format';
import { StatusTag } from './Tag';

/** Tabela de candidatos com as ações que disparam cada método HTTP. */
export default function FuncionariosTable({ funcionarios, onVer, onEditar, onPatch, onExcluir }) {
  return (
    <div className="table-scroll">
      <table className="table" style={{ minWidth: 620 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Cidade</th>
            <th>Salário</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map((f) => (
            <tr key={f.id}>
              <td className="mono muted">{f.id}</td>
              <td>
                <div>{f.nome}</div>
                <div className="muted" style={{ fontSize: 11 }}>{f.email}</div>
              </td>
              <td>
                <div>{f.cargo}</div>
                <div className="muted" style={{ fontSize: 11 }}>{f.departamento}</div>
              </td>
              <td>{f.cidade}</td>
              <td>{moeda(f.salario)}</td>
              <td>
                <StatusTag status={f.status} />
              </td>
              <td>
                <div style={{ display: 'flex', gap: 2.8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" title="GET /funcionarios/{id}" onClick={() => onVer(f.id)}>
                    <i className="ph ph-eye" style={{ fontSize: 15 }} />
                  </button>
                  <button type="button" className="btn btn-ghost" title="PUT /funcionarios/{id}" onClick={() => onEditar(f.id)}>
                    <i className="ph ph-pencil-simple" style={{ fontSize: 15 }} />
                  </button>
                  <button type="button" className="btn btn-ghost" title="PATCH /funcionarios/{id}" onClick={() => onPatch(f.id)}>
                    <i className="ph ph-sliders-horizontal" style={{ fontSize: 15 }} />
                  </button>
                  <button type="button" className="btn btn-ghost" title="DELETE /funcionarios/{id}" onClick={() => onExcluir(f.id)}>
                    <i className="ph ph-trash" style={{ fontSize: 15 }} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
