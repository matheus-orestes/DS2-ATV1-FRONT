import { STATUS } from '../constants';
import { TextField, SelectField } from './Field';

/** Formulário completo do candidato — usado no POST (cadastro) e no PUT (edição). */
export default function FuncionarioForm({ valores, onCampo }) {
  const set = (campo) => (valor) => onCampo(campo, valor);
  return (
    <div className="grid-form">
      <TextField label="Nome *" value={valores.nome} onChange={set('nome')} placeholder="Nome completo" />
      <TextField label="E-mail *" value={valores.email} onChange={set('email')} placeholder="nome@email.com" />
      <TextField label="Telefone" value={valores.telefone} onChange={set('telefone')} placeholder="(11) 90000-0000" />
      <TextField label="Cargo *" value={valores.cargo} onChange={set('cargo')} placeholder="Ex.: Desenvolvedor Backend" />
      <TextField label="Departamento" value={valores.departamento} onChange={set('departamento')} placeholder="Ex.: Tecnologia" />
      <TextField label="Cidade" value={valores.cidade} onChange={set('cidade')} placeholder="Ex.: São Paulo" />
      <TextField label="Salário (R$)" type="number" value={valores.salario} onChange={set('salario')} placeholder="0,00" />
      <SelectField label="Status" value={valores.status} onChange={set('status')} options={STATUS.map((s) => ({ value: s.value, label: s.label }))} />
    </div>
  );
}
