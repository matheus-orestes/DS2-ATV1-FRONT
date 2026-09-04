import { AlertTriangle, X } from 'lucide-react';
import type { Funcionario } from '../types/funcionario';

export function ConfirmModal({ funcionario, onCancel, onConfirm, loading, error }: { funcionario: Funcionario; onCancel:()=>void; onConfirm:()=>void; loading?:boolean; error?:string }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}><div className="modal" role="dialog" aria-modal="true" onMouseDown={(e)=>e.stopPropagation()}><button className="icon-button modal-close" onClick={onCancel} aria-label="Fechar"><X size={17}/></button><div className="modal-icon"><AlertTriangle size={22}/></div><h3>Excluir candidato?</h3><p>Você está prestes a remover <strong>{funcionario.nome}</strong> do cadastro. A API será chamada com <code>DELETE /funcionarios/{funcionario.id}</code>.</p>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button className="btn btn-secondary" disabled={loading} onClick={onCancel}>Cancelar</button><button className="btn btn-danger" disabled={loading} onClick={onConfirm}>{loading?'Excluindo…':'Excluir candidato'}</button></div></div></div>;
}
