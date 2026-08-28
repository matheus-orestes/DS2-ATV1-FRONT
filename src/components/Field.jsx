export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function TextField({ label, value, onChange, ...resto }) {
  return (
    <Field label={label}>
      <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...resto} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, placeholder, ...resto }) {
  return (
    <Field label={label}>
      <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...resto}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
