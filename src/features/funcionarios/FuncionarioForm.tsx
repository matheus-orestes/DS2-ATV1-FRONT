import { useEffect, useMemo, useState, type ChangeEvent, type FocusEvent, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { FuncionarioPayload, StatusFuncionario } from '../../types/funcionario';
import { STATUS_OPTIONS, money } from '../../utils/format';

interface Props {
  value: FuncionarioPayload;
  onChange: (next: FuncionarioPayload) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  busy?: boolean;
  error?: string;
  title: string;
  subtitle: string;
  method: string;
  fieldErrors?: Record<string, string>;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneDigits = (value: string) => value.replace(/\D/g, '');

function localFieldError(key: keyof FuncionarioPayload, value: FuncionarioPayload): string {
  if (key === 'nome') {
    const v = value.nome.trim();
    if (!v) return 'Informe o nome.';
    if (v.length < 3) return 'O nome precisa ter pelo menos 3 caracteres.';
    if (v.length > 120) return 'O nome pode ter no máximo 120 caracteres.';
  }
  if (key === 'email') {
    const v = value.email.trim();
    if (!v) return 'Informe o e-mail.';
    if (!emailRegex.test(v)) return 'Informe um e-mail válido.';
  }
  if (key === 'telefone') {
    const digits = phoneDigits(value.telefone || '');
    if (digits && ![10, 11].includes(digits.length)) return 'Telefone deve ter 10 ou 11 dígitos.';
  }
  if (key === 'cargo' && !value.cargo.trim()) return 'Informe o cargo.';
  if (key === 'departamento' && !value.departamento?.trim()) return 'Informe o departamento.';
  if (key === 'cidade' && !value.cidade?.trim()) return 'Informe a cidade.';
  if (key === 'salario') {
    const salary = Number(value.salario);
    if (!Number.isFinite(salary) || salary <= 0) return 'O salário precisa ser maior que zero.';
    if (salary > 1000000) return 'O salário não pode ultrapassar R$ 1.000.000,00.';
  }
  if (key === 'status' && !value.status) return 'Selecione um status.';
  return '';
}

export function FuncionarioForm({ value, onChange, onSubmit, onCancel, submitLabel, busy, error, title, subtitle, method, fieldErrors = {} }: Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTouched({});
  }, [title, method]);

  const valid = useMemo(() => !(['nome','email','cargo','departamento','cidade','salario'] as Array<keyof FuncionarioPayload>).some((key) => localFieldError(key, value)), [value]);

  const change = (key: keyof FuncionarioPayload) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...value, [key]: key === 'salario' ? Number(e.target.value) || 0 : e.target.value });
  };

  const blur = (key: keyof FuncionarioPayload) => (_e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const displayedError = (key: keyof FuncionarioPayload) => fieldErrors[key] || (touched[key] ? localFieldError(key, value) : '');

  const submit = () => {
    setTouched({ nome: true, email: true, telefone: true, cargo: true, departamento: true, salario: true, cidade: true, status: true });
    onSubmit();
  };

  return <div className="form-layout">
    <div className="card form-card">
      <div className="section-header"><div><div className="eyebrow">{method} /funcionarios</div><h3>{title}</h3><span>{subtitle}</span></div><span className="tag tag-lime">{method}</span></div>
      <div className="form-grid">
        <Field label="Nome *" error={displayedError('nome')}><input className="input" required minLength={3} maxLength={120} autoComplete="name" value={value.nome} disabled={busy} onBlur={blur('nome')} onChange={change('nome')} placeholder="Nome completo" /></Field>
        <Field label="E-mail *" error={displayedError('email')}><input className="input" required type="email" autoComplete="email" value={value.email} disabled={busy} onBlur={blur('email')} onChange={change('email')} placeholder="nome@email.com" /></Field>
        <Field label="Telefone" error={displayedError('telefone')}><input className="input" inputMode="tel" autoComplete="tel" value={value.telefone || ''} disabled={busy} onBlur={blur('telefone')} onChange={change('telefone')} placeholder="(11) 99999-9999" /></Field>
        <Field label="Cargo *" error={displayedError('cargo')}><input className="input" required value={value.cargo} disabled={busy} onBlur={blur('cargo')} onChange={change('cargo')} placeholder="Ex.: Desenvolvedor Backend" /></Field>
        <Field label="Departamento *" error={displayedError('departamento')}><input className="input" required value={value.departamento || ''} disabled={busy} onBlur={blur('departamento')} onChange={change('departamento')} placeholder="Tecnologia" /></Field>
        <Field label="Salário *" error={displayedError('salario')}><input className="input" required type="number" min="0.01" max="1000000" step="0.01" inputMode="decimal" value={value.salario} disabled={busy} onBlur={blur('salario')} onChange={change('salario')} placeholder="9800" /></Field>
        <Field label="Cidade *" error={displayedError('cidade')}><input className="input" required value={value.cidade || ''} disabled={busy} onBlur={blur('cidade')} onChange={change('cidade')} placeholder="São Paulo" /></Field>
        <Field label="Status" error={displayedError('status')}><select className="input" value={value.status} disabled={busy || method === 'POST'} onBlur={blur('status')} onChange={(e) => onChange({ ...value, status: e.target.value as StatusFuncionario })}>{STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>{method === 'POST' && <small className="field-help">Novos candidatos começam em Em análise.</small>}</Field>
      </div>
      {!valid && <div className="validation-hint">Revise os campos destacados antes de enviar.</div>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-actions"><button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Enviando…' : submitLabel}</button>{onCancel && <button className="btn btn-secondary" disabled={busy} onClick={onCancel}>Cancelar</button>}</div>
    </div>
    <div className="card request-card"><div className="section-header"><div><h3>Requisição</h3><span>Payload que será enviado ao backend.</span></div><CheckCircle2 size={18} color="var(--mark)" /></div><div className="endpoint">{method} /funcionarios{method === 'PUT' ? '/{id}' : ''}</div><pre>{JSON.stringify({ ...value, salario: Number(value.salario) || 0 }, null, 2)}</pre><div className="request-note">Prévia do salário: {money(value.salario)}</div></div>
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className={`field ${error ? 'has-error' : ''}`}><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}
