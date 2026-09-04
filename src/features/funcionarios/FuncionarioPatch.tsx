import { useState, type ChangeEvent } from 'react';
import type { Funcionario, StatusFuncionario } from '../../types/funcionario';
import { STATUS_OPTIONS, money } from '../../utils/format';
import { transitionMessage } from '../../utils/validation';

export function FuncionarioPatch({ funcionario, selected, onSelectedChange, onSubmit, onCancel, busy, error }: {
  funcionario?: Funcionario;
  selected: { cargo:boolean; status:boolean; salario:boolean; cargoValue:string; statusValue:StatusFuncionario; salarioValue:number };
  onSelectedChange:(next: typeof selected)=>void;
  onSubmit:()=>void;
  onCancel?:()=>void;
  busy?:boolean;
  error?:string;
}) {
  const [submitted, setSubmitted] = useState(false);
  if (!funcionario) return <div className="card empty-state">Selecione um candidato para aplicar um <strong>PATCH</strong>.</div>;
  const transition = selected.status ? transitionMessage(funcionario.status, selected.statusValue) : '';
  const cargoError = selected.cargo && !selected.cargoValue.trim() ? 'Informe o novo cargo.' : '';
  const salaryNum = Number(selected.salarioValue);
  const salarioError = selected.salario && (!Number.isFinite(salaryNum) || salaryNum <= 0) ? 'O salário precisa ser maior que zero.' : selected.salario && salaryNum > 1000000 ? 'O salário não pode ultrapassar R$ 1.000.000,00.' : '';
  const selectedError = !selected.cargo && !selected.status && !selected.salario ? 'Selecione ao menos um campo para atualizar.' : '';
  const preview: Record<string, unknown> = {};
  if (selected.cargo && selected.cargoValue.trim()) preview.cargo = selected.cargoValue.trim();
  if (selected.status) preview.status = selected.statusValue;
  if (selected.salario && !salarioError) preview.salario = salaryNum;
  const hasError = Boolean(cargoError || salarioError || selectedError || transition);
  const canSubmit = !busy && !hasError && Object.keys(preview).length > 0;
  const toggle = (key:'cargo'|'status'|'salario') => onSelectedChange({ ...selected, [key]: !selected[key] });
  const text = (e: ChangeEvent<HTMLInputElement>) => onSelectedChange({ ...selected, cargoValue: e.target.value });
  const submit = () => { setSubmitted(true); if (canSubmit) onSubmit(); };
  const show = (message:string) => (submitted || message ? message : '');
  return <div className="form-layout">
    <div className="card form-card"><div className="section-header"><div><h3>Atualização parcial</h3><span>Altere somente o que mudou em <strong>{funcionario.nome}</strong>.</span></div><span className="tag tag-lime">PATCH</span></div>
      <div className="patch-list">
        <label className={`toggle-row ${show(cargoError)?'patch-error':''}`}><input type="checkbox" checked={selected.cargo} onChange={() => toggle('cargo')} /><span>Cargo</span><input className="input" disabled={!selected.cargo || busy} value={selected.cargoValue} onChange={text} placeholder="Novo cargo" />{show(cargoError)&&<small className="field-error">{cargoError}</small>}</label>
        <label className="toggle-row"><input type="checkbox" checked={selected.status} onChange={() => toggle('status')} /><span>Status</span><select className="input" disabled={!selected.status || busy} value={selected.statusValue} onChange={(e)=>onSelectedChange({ ...selected, statusValue: e.target.value as StatusFuncionario })}>{STATUS_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
        <label className={`toggle-row ${show(salarioError)?'patch-error':''}`}><input type="checkbox" checked={selected.salario} onChange={() => toggle('salario')} /><span>Salário</span><input className="input" type="number" min="0.01" max="1000000" step="0.01" disabled={!selected.salario || busy} value={selected.salarioValue} onChange={(e)=>onSelectedChange({ ...selected, salarioValue:Number(e.target.value)||0 })} placeholder="9800" />{show(salarioError)&&<small className="field-error">{salarioError}</small>}</label>
      </div>
      {show(selectedError)&&<div className="form-error">{selectedError}</div>}
      {transition && <div className="form-error">{transition}</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-actions"><button className="btn btn-primary" disabled={!canSubmit} onClick={submit}>{busy ? 'Aplicando…' : 'Aplicar atualização parcial'}</button>{onCancel && <button className="btn btn-secondary" disabled={busy} onClick={onCancel}>Cancelar</button>}</div>
    </div>
    <div className="card request-card"><div className="section-header"><div><h3>Corpo do PATCH</h3><span>JSON efetivamente enviado.</span></div></div><pre>{JSON.stringify(preview, null, 2)}</pre><div className="request-note">Estado atual: {funcionario.cargo} · {money(funcionario.salario)} · {funcionario.status}</div></div>
  </div>;
}
