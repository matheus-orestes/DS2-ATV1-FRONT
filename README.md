# Contrata RH — React + TypeScript

Frontend completo para gestão de candidatos, com o design original preservado e a integração com a API real.

## Correções desta versão

- Tela de PATCH reorganizada para evitar o layout quebrado causado por grids aninhados.
- O PATCH agora deixa **Cargo**, **Status** e **Salário** claramente visíveis e independentes.
- O seletor de candidato ficou separado do formulário de PATCH.
- O JSON do PATCH mostra exatamente os campos marcados para alteração.
- Validações de formulário permanecem ativas para nome, e-mail, telefone, cargo, departamento, salário, cidade e status.
- O endpoint extra **GET /funcionarios/indicadores** agora tem uma área própria de **Indicadores**, com botão de consulta, cards e prévia da resposta.
- O serviço expõe `getIndicadores()` e mantém `indicadores()` como alias de compatibilidade.
- O histórico de requisições registra GET de lista, GET por ID, GET de indicadores, POST, PUT, PATCH e DELETE.
- O mascote continua como identidade central do produto e tela de carregamento.

## Rodar

```bash
npm install
npm run dev
```

## API

Por padrão:

```text
VITE_API_BASE_URL=https://diogo-api.onrender.com
```

Pode ser sobrescrita por variável de ambiente.
