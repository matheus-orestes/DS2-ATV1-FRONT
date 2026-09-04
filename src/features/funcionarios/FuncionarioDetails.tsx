import { Pencil, SlidersHorizontal } from 'lucide-react';
import type { Funcionario } from '../../types/funcionario';
import { statusClass, statusLabel, money } from '../../utils/format';

export function FuncionarioDetails({ funcionario, onEdit, onPatch }: { funcionario?: Funcionario; onEdit:()=>void; onPatch:()=>void }) {
  if (!funcionario) return <div className="empty-state">Consulte um ID para exibir os dados completos.</div>;
  const rows = [['ID',String(funcionario.id)],['E-mail',funcionario.email],['Telefone',funcionario.telefone || '—'],['Cidade',funcionario.cidade || '—'],['Salário',money(funcionario.salario)]];
  return <div className="details-card"><div className="detail-top"><div className="avatar avatar-lg">{funcionario.nome.slice(0,2).toUpperCase()}</div><div><h3>{funcionario.nome}</h3><span>{funcionario.cargo} · {funcionario.departamento || 'Sem departamento'}</span></div></div><div className="detail-grid">{rows.map(([label,value])=><div className="detail-row" key={label}><span>{label}</span><b>{value}</b></div>)}<div className="detail-row"><span>Status</span><b><span className={statusClass(funcionario.status)}>{statusLabel(funcionario.status)}</span></b></div></div><div className="form-actions"><button className="btn btn-primary" onClick={onEdit}><Pencil size={15}/>Editar</button><button className="btn btn-secondary" onClick={onPatch}><SlidersHorizontal size={15}/>PATCH</button></div></div>;
}
