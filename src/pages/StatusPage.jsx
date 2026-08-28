import { useEffect, useState } from 'react';
import { STATUS } from '../constants';
import { SelectField } from '../components/Field';
import { Tag } from '../components/Tag';

/** PATCH — envia apenas os campos marcados, mantendo os demais inalterados. */
export default function StatusPage({ funcionarios, idSelecionado, onSelecionar, onAtualizarParcial, avisar }) {
  const [ativos, setAtivos] = useState({ cargo: false, status: true, salario: false });
  const [form, setForm] = useState({ cargo: '', status: 'APROVADO', salario: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const alvo = funcionarios.find((f) => f.id === Number(idSelecionado));
    if (alvo) setForm({ cargo: alvo.cargo || '', status: alvo.status, salario: String(alvo.salario ?? '') });
  }, [idSelecionado, funcionarios]);

  const corpo = {};
  if (ativos.cargo) corpo.cargo = form.cargo;
  if (ativos.status) corpo.status = form.status;
  if (ativos.salario) corpo.salario = Number(form.salario) || 0;

  const alternar = (campo) => setAtivos((atual) => ({ ...atual, [campo]: !atual[campo] }));
  const setCampo = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }));

  async function aplicar() {
    if (Object.keys(corpo).length === 0) {
      setErro('Selecione ao menos um campo para atualizar.');
      return;
    }
    setEnviando(true);
    try {
      await onAtualizarParcial(idSelecionado, corpo);
      setErro('');
      avisar('Atualização parcial aplicada ao registro ' + idSelecionado, '200 OK · PATCH /funcionarios/' + idSelecionado);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  const opcoes = funcionarios.map((f) => ({ value: String(f.id), label: '#' + f.id + ' — ' + f.nome + ' · ' + f.cargo }));

  return (
    <div className="split">
      <div className="card" style={{ padding: 'var(--space-8)', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <SelectField
              label="Candidato"
              value={idSelecionado ? String(idSelecionado) : ''}
              onChange={(v) => onSelecionar(v ? Number(v) : null)}
              options={opcoes}
              placeholder="Selecione um candidato…"
            />
          </div>
          <Tag variante="tag-outline">PATCH</Tag>
        </div>

        {idSelecionado ? (
          <>
            <div className="muted" style={{ fontSize: 12.5 }}>
              Somente os campos marcados são enviados. Os demais atributos permanecem inalterados.
            </div>
            <div className="grid-patch">
              <div className={'patch-box' + (ativos.cargo ? ' is-on' : '')}>
                <label className="check">
                  <input type="checkbox" checked={ativos.cargo} onChange={() => alternar('cargo')} />
                  <span>cargo</span>
                </label>
                <input className="input" value={form.cargo} disabled={!ativos.cargo} onChange={(e) => setCampo('cargo', e.target.value)} />
              </div>

              <div className={'patch-box' + (ativos.status ? ' is-on' : '')}>
                <label className="check">
                  <input type="checkbox" checked={ativos.status} onChange={() => alternar('status')} />
                  <span>status</span>
                </label>
                <select className="input" value={form.status} disabled={!ativos.status} onChange={(e) => setCampo('status', e.target.value)}>
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={'patch-box' + (ativos.salario ? ' is-on' : '')}>
                <label className="check">
                  <input type="checkbox" checked={ativos.salario} onChange={() => alternar('salario')} />
                  <span>salario</span>
                </label>
                <input
                  className="input"
                  type="number"
                  value={form.salario}
                  disabled={!ativos.salario}
                  onChange={(e) => setCampo('salario', e.target.value)}
                />
              </div>
            </div>

            {erro ? <div className="aviso">{erro}</div> : null}

            <button type="button" className="btn btn-primary" onClick={aplicar} disabled={enviando} style={{ alignSelf: 'flex-start' }}>
              <i className="ph ph-check" /> {enviando ? 'Enviando…' : 'Aplicar atualização parcial'}
            </button>
          </>
        ) : null}
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-3)' }}>
        <div className="row">
          <h5 style={{ margin: 0 }}>Corpo do PATCH</h5>
          <Tag variante="tag-mark" style={{ marginLeft: 'auto' }}>PATCH</Tag>
        </div>
        <pre className="code">{JSON.stringify(corpo, null, 2)}</pre>
      </div>
    </div>
  );
}
