import type { ChangeEvent } from 'react';
import type { Funcionario, StatusFuncionario } from '../../types/funcionario';
import { STATUS_OPTIONS } from '../../utils/format';

export function FuncionarioPatch({ funcionario, selected, onSelectedChange, onSubmit, busy, error }: {
  funcionario?: Funcionario;
  selected: { cargo: boolean; status: boolean; salario: boolean; cargoValue: string; statusValue: StatusFuncionario; salarioValue: number };
  onSelectedChange: (next: typeof selected) => void;
  onSubmit: () => void;
  busy?: boolean;
  error?: string;
}) {
  if (!funcionario) return <div className="empty-state">Selecione um candidato para aplicar um <strong>PATCH</strong>.</div>;
  const toggle = (key: 'cargo' | 'status' | 'salario') => onSelectedChange({ ...selected, [key]: !selected[key] });
  const changeText = (field: 'cargoValue') => (e: ChangeEvent<HTMLInputElement>) => onSelectedChange({ ...selected, [field]: e.target.value });
  const changeStatus = (e: ChangeEvent<HTMLSelectElement>) => onSelectedChange({ ...selected, statusValue: e.target.value as StatusFuncionario });
  const changeNumber = (field: 'salarioValue') => (e: ChangeEvent<HTMLInputElement>) => onSelectedChange({ ...selected, [field]: Number(e.target.value) || 0 });
  return <div className="form-layout"><div className="card form-card"><div className="section-header"><div><h3>Atualização parcial</h3><span>Altere somente os campos necessários de {funcionario.nome}.</span></div><span className="tag tag-accent">PATCH</span></div>
    <div className="patch-list">
      <label className="toggle-row"><input type="checkbox" checked={selected.cargo} onChange={() => toggle('cargo')} /><span>Cargo</span><input className="input" disabled={!selected.cargo} value={selected.cargoValue} onChange={changeText('cargoValue')} /></label>
      <label className="toggle-row"><input type="checkbox" checked={selected.status} onChange={() => toggle('status')} /><span>Status</span><select className="input" disabled={!selected.status} value={selected.statusValue} onChange={changeStatus}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label className="toggle-row"><input type="checkbox" checked={selected.salario} onChange={() => toggle('salario')} /><span>Salário</span><input className="input" type="number" disabled={!selected.salario} value={selected.salarioValue} onChange={changeNumber('salarioValue')} /></label>
    </div>
    {error && <div className="form-error">{error}</div>}
    <button className="btn btn-primary" disabled={busy || !(selected.cargo || selected.status || selected.salario)} onClick={onSubmit}>{busy ? 'Aplicando…' : 'Aplicar atualização parcial'}</button>
  </div><div className="card request-card"><div className="section-header"><div><h3>Corpo do PATCH</h3><span>JSON efetivamente enviado.</span></div><span className="tag tag-lime">PATCH</span></div><pre>{JSON.stringify(Object.fromEntries([selected.cargo ? ['cargo', selected.cargoValue] : null, selected.status ? ['status', selected.statusValue] : null, selected.salario ? ['salario', Number(selected.salarioValue) || 0] : null].filter(Boolean) as [string, unknown][]), null, 2)}</pre></div></div>;
}
