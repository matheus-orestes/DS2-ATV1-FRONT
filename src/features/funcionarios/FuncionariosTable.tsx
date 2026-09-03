import { Eye, Pencil, SlidersHorizontal, Trash2 } from 'lucide-react';
import type { Funcionario } from '../../types/funcionario';
import { StatusTag } from '../../components/StatusTag';
import { money } from '../../utils/format';

export function FuncionariosTable({ rows, onView, onEdit, onPatch, onDelete }: {
  rows: Funcionario[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPatch: (id: number) => void;
  onDelete: (funcionario: Funcionario) => void;
}) {
  return <div className="table-wrap"><table><thead><tr><th>ID</th><th>Nome</th><th>Cargo</th><th>Cidade</th><th>Salário</th><th>Status</th><th className="actions-col">Ações</th></tr></thead><tbody>
    {rows.map((row) => <tr key={row.id}><td className="muted mono">{row.id}</td><td><div className="name-cell"><span className="avatar">{row.nome ? row.nome.slice(0, 2).toUpperCase() : '—'}</span><div><strong>{row.nome}</strong><small>{row.email}</small></div></div></td><td><div>{row.cargo}</div><small>{row.departamento || '—'}</small></td><td className="muted">{row.cidade || '—'}</td><td>{money(row.salario)}</td><td><StatusTag status={row.status} /></td><td><div className="action-buttons"><button className="icon-button" title="Consultar" onClick={() => onView(row.id)}><Eye size={16} /></button><button className="icon-button" title="Editar" onClick={() => onEdit(row.id)}><Pencil size={16} /></button><button className="icon-button" title="PATCH" onClick={() => onPatch(row.id)}><SlidersHorizontal size={16} /></button><button className="icon-button danger-ghost" title="Excluir" onClick={() => onDelete(row)}><Trash2 size={16} /></button></div></td></tr>)}
  </tbody></table>{rows.length === 0 && <div className="empty-state">Nenhum candidato corresponde aos critérios informados.</div>}</div>;
}
