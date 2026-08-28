import { useEffect, useState } from 'react';
import { FUNCIONARIO_VAZIO } from '../constants';
import { API_URL } from '../api/client';
import FuncionarioForm from '../components/FuncionarioForm';
import { SelectField } from '../components/Field';
import { Tag } from '../components/Tag';
import { corpoFuncionario, validarFuncionario } from '../utils/format';

export default function EditarPage({ funcionarios, idSelecionado, onSelecionar, onAtualizar, avisar }) {
  const [form, setForm] = useState({ ...FUNCIONARIO_VAZIO });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const alvo = funcionarios.find((f) => f.id === Number(idSelecionado));
    if (alvo) setForm({ ...alvo, salario: String(alvo.salario ?? '') });
  }, [idSelecionado, funcionarios]);

  const setCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro('');
  };

  async function salvar() {
    const problema = validarFuncionario(form);
    if (problema) {
      setErro(problema);
      return;
    }
    setEnviando(true);
    try {
      await onAtualizar(idSelecionado, corpoFuncionario(form));
      avisar('Registro ' + idSelecionado + ' substituído por completo', '200 OK · PUT /funcionarios/' + idSelecionado);
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
          <Tag variante="tag-outline">PUT</Tag>
        </div>

        {idSelecionado ? (
          <>
            <FuncionarioForm valores={form} onCampo={setCampo} />
            {erro ? <div className="aviso">{erro}</div> : null}
            <div style={{ display: 'flex', gap: 8.4 }}>
              <button type="button" className="btn btn-primary" onClick={salvar} disabled={enviando}>
                <i className="ph ph-floppy-disk" /> {enviando ? 'Salvando…' : 'Salvar (substituir registro)'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onSelecionar(null)}>
                Cancelar
              </button>
            </div>
          </>
        ) : null}
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-3)' }}>
        <h5 style={{ margin: 0 }}>PUT — atualização completa</h5>
        <div className="mono muted" style={{ fontSize: 12 }}>
          PUT {API_URL || '(mock)'}/funcionarios/{idSelecionado || '{id}'}
        </div>
        <div className="muted" style={{ fontSize: 12.5 }}>
          O registro é localizado pelo ID e todos os atributos são substituídos pelos valores enviados. Campos deixados em
          branco também são sobrescritos.
        </div>
      </div>
    </div>
  );
}
