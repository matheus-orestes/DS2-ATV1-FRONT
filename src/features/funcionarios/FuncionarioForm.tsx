import type { ChangeEvent } from 'react';
import type { FuncionarioPayload, StatusFuncionario } from '../../types/funcionario';
import { STATUS_OPTIONS, money } from '../../utils/format';

interface Props { value: FuncionarioPayload; onChange: (value: FuncionarioPayload) => void; onSubmit: () => void; onCancel?: () => void; submitLabel: string; busy?: boolean; error?: string; title: string; subtitle: string; method: string; }

export function FuncionarioForm({ value, onChange, onSubmit, onCancel, submitLabel, busy, error, title, subtitle, method }: Props) {
  const change = (field: keyof FuncionarioPayload) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...value, [field]: field === 'salario' ? Number(e.target.value) : e.target.value });
  };
  const valid = value.nome.trim() && value.email.trim() && value.cargo.trim();
  return (
    <div className="form-layout">
      <div className="card form-card">
        <div className="section-header"><div><h3>{title}</h3><span>{subtitle}</span></div><span className="tag tag-outline">{method}</span></div>
        <div className="form-grid">
          <label className="field"><span>Nome *</span><input className="input" value={value.nome} onChange={change('nome')} placeholder="Nome completo" /></label>
          <label className="field"><span>E-mail *</span><input className="input" type="email" value={value.email} onChange={change('email')} placeholder="nome@email.com" /></label>
          <label className="field"><span>Telefone</span><input className="input" value={value.telefone || ''} onChange={change('telefone')} placeholder="(11) 99999-9999" /></label>
          <label className="field"><span>Cargo *</span><input className="input" value={value.cargo} onChange={change('cargo')} placeholder="Ex.: Desenvolvedor Backend" /></label>
          <label className="field"><span>Departamento</span><input className="input" value={value.departamento || ''} onChange={change('departamento')} placeholder="Tecnologia" /></label>
          <label className="field"><span>Salário</span><input className="input" type="number" min="0" step="0.01" value={value.salario} onChange={change('salario')} placeholder="9800" /></label>
          <label className="field"><span>Cidade</span><input className="input" value={value.cidade || ''} onChange={change('cidade')} placeholder="São Paulo" /></label>
          <label className="field"><span>Status</span><select className="input" value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as StatusFuncionario })}>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions"><button className="btn btn-primary" disabled={!valid || busy} onClick={onSubmit}>{busy ? 'Enviando…' : submitLabel}</button>{onCancel && <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>}</div>
      </div>
      <div className="card request-card"><div className="section-header"><div><h3>Requisição</h3><span>Payload enviado para a API.</span></div><span className="tag tag-lime">{method}</span></div><div className="endpoint">{method} /funcionarios</div><pre>{JSON.stringify({ ...value, salario: Number(value.salario) || 0 }, null, 2)}</pre><div className="request-note">Prévia do salário: {money(value.salario)}</div></div>
    </div>
  );
}
