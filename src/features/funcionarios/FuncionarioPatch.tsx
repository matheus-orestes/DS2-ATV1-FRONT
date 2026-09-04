import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Funcionario, StatusFuncionario } from '../../types/funcionario';
import { STATUS_OPTIONS, money } from '../../utils/format';
import { transitionMessage } from '../../utils/validation';

export interface PatchValues {
  cargo: boolean;
  status: boolean;
  salario: boolean;
  cargoValue: string;
  statusValue: StatusFuncionario;
  salarioValue: number;
}

interface Props {
  funcionario?: Funcionario;
  selected: PatchValues;
  onSelectedChange: (next: PatchValues) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  busy?: boolean;
  error?: string;
}

export function FuncionarioPatch({ funcionario, selected, onSelectedChange, onSubmit, onCancel, busy, error }: Props) {
  if (!funcionario) {
    return <div className="card empty-state">Selecione um candidato para configurar o <strong>PATCH</strong>.</div>;
  }

  const transition = selected.status ? transitionMessage(funcionario.status, selected.statusValue) : '';
  const cargoError = selected.cargo && !selected.cargoValue.trim() ? 'Informe o novo cargo.' : '';
  const salaryNum = Number(selected.salarioValue);
  const salarioError = selected.salario && (!Number.isFinite(salaryNum) || salaryNum <= 0)
    ? 'O salário precisa ser maior que zero.'
    : selected.salario && salaryNum > 1_000_000
      ? 'O salário não pode ultrapassar R$ 1.000.000,00.'
      : '';
  const selectedError = !selected.cargo && !selected.status && !selected.salario
    ? 'Selecione ao menos um campo para atualizar.'
    : '';

  const preview: Record<string, unknown> = {};
  if (selected.cargo && selected.cargoValue.trim()) preview.cargo = selected.cargoValue.trim();
  if (selected.status) preview.status = selected.statusValue;
  if (selected.salario && !salarioError) preview.salario = salaryNum;

  const hasError = Boolean(cargoError || salarioError || selectedError || transition);
  const canSubmit = !busy && !hasError && Object.keys(preview).length > 0;
  const toggle = (key: 'cargo' | 'status' | 'salario') => onSelectedChange({ ...selected, [key]: !selected[key] });

  return (
    <div className="patch-layout">
      <section className="card form-card">
        <div className="section-header">
          <div>
            <div className="eyebrow">PATCH /funcionarios/{funcionario.id}</div>
            <h3>Campos da atualização parcial</h3>
            <span>Marque somente o que realmente mudou no candidato.</span>
          </div>
          <span className="tag tag-lime">PATCH</span>
        </div>

        <div className="patch-fields">
          <PatchField
            label="Cargo"
            checked={selected.cargo}
            error={cargoError}
            onToggle={() => toggle('cargo')}
            control={
              <input
                className="input"
                value={selected.cargoValue}
                disabled={!selected.cargo || busy}
                onChange={(e) => onSelectedChange({ ...selected, cargoValue: e.target.value })}
                placeholder="Novo cargo"
              />
            }
          />

          <PatchField
            label="Status"
            checked={selected.status}
            onToggle={() => toggle('status')}
            control={
              <select
                className="input"
                value={selected.statusValue}
                disabled={!selected.status || busy}
                onChange={(e) => onSelectedChange({ ...selected, statusValue: e.target.value as StatusFuncionario })}
              >
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            }
          />

          <PatchField
            label="Salário"
            checked={selected.salario}
            error={salarioError}
            onToggle={() => toggle('salario')}
            control={
              <input
                className="input"
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                inputMode="decimal"
                value={selected.salarioValue}
                disabled={!selected.salario || busy}
                onChange={(e) => onSelectedChange({ ...selected, salarioValue: Number(e.target.value) || 0 })}
                placeholder="9800"
              />
            }
          />
        </div>

        {selectedError && <div className="form-error">{selectedError}</div>}
        {transition && <div className="form-error">{transition}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-actions">
          <button className="btn btn-primary" disabled={!canSubmit} onClick={onSubmit}>
            <CheckCircle2 size={15} />
            {busy ? 'Aplicando…' : 'Aplicar atualização parcial'}
          </button>
          {onCancel && <button className="btn btn-secondary" disabled={busy} onClick={onCancel}>Cancelar</button>}
        </div>
      </section>

      <aside className="card request-card">
        <div className="section-header">
          <div>
            <h3>Corpo do PATCH</h3>
            <span>JSON efetivamente enviado.</span>
          </div>
          <span className="tag tag-neutral">{Object.keys(preview).length} campos</span>
        </div>
        <div className="endpoint">PATCH /funcionarios/{funcionario.id}</div>
        <pre>{JSON.stringify(preview, null, 2)}</pre>
        <div className="request-note">
          Estado atual: <strong>{funcionario.cargo}</strong> · {money(funcionario.salario)} · {funcionario.status}
        </div>
      </aside>
    </div>
  );
}

function PatchField({ label, checked, onToggle, control, error }: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  control: ReactNode;
  error?: string;
}) {
  return (
    <div className={`patch-field ${error ? 'patch-field-error' : ''}`}>
      <div className="patch-field-title">
        <label className="checkbox-line">
          <input type="checkbox" checked={checked} onChange={onToggle} />
          <span>{label}</span>
        </label>
        <span className={`tag ${checked ? 'tag-lime' : 'tag-neutral'}`}>{checked ? 'editar' : 'não alterar'}</span>
      </div>
      {control}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
