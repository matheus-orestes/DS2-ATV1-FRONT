import { useState } from 'react';
import { FUNCIONARIO_VAZIO } from '../constants';
import { API_URL } from '../api/client';
import FuncionarioForm from '../components/FuncionarioForm';
import { Tag } from '../components/Tag';
import { corpoFuncionario, validarFuncionario } from '../utils/format';

export default function CadastrarPage({ onCriar, avisar }) {
  const [form, setForm] = useState({ ...FUNCIONARIO_VAZIO });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const setCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro('');
  };

  async function enviar() {
    const problema = validarFuncionario(form);
    if (problema) {
      setErro(problema);
      return;
    }
    setEnviando(true);
    try {
      const corpo = corpoFuncionario(form);
      const novo = await onCriar(corpo);
      setForm({ ...FUNCIONARIO_VAZIO });
      avisar((novo && novo.nome ? novo.nome : corpo.nome) + ' cadastrado com sucesso', '201 Created · POST /funcionarios');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="split">
      <div className="card" style={{ padding: 'var(--space-8)', gap: 'var(--space-6)' }}>
        <div>
          <h5 style={{ margin: 0 }}>Dados do candidato</h5>
          <div className="muted" style={{ fontSize: 12 }}>
            Nome, e-mail e cargo são obrigatórios. O ID é gerado pela API.
          </div>
        </div>

        <FuncionarioForm valores={form} onCampo={setCampo} />

        {erro ? <div className="aviso">{erro}</div> : null}

        <div style={{ display: 'flex', gap: 8.4 }}>
          <button type="button" className="btn btn-primary" onClick={enviar} disabled={enviando}>
            <i className="ph ph-plus" /> {enviando ? 'Enviando…' : 'Cadastrar candidato'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => { setForm({ ...FUNCIONARIO_VAZIO }); setErro(''); }}>
            Limpar
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)', gap: 'var(--space-3)' }}>
        <div className="row">
          <h5 style={{ margin: 0 }}>Requisição</h5>
          <Tag variante="tag-mark" style={{ marginLeft: 'auto' }}>POST</Tag>
        </div>
        <div className="mono muted" style={{ fontSize: 12 }}>POST {API_URL || '(mock)'}/funcionarios</div>
        <pre className="code">{JSON.stringify(corpoFuncionario(form), null, 2)}</pre>
        <div className="muted" style={{ fontSize: 11.5 }}>
          O corpo é enviado em JSON e adicionado à lista do controller.
        </div>
      </div>
    </div>
  );
}
