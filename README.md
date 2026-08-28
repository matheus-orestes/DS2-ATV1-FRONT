# Contrata RH — front-end React

Sistema interno de gestão de candidatos para o setor de RH. Consome a API REST
em Spring Boot do desafio (`Funcionario` + `ArrayList`) usando a Fetch API.

## Rodando

```bash
npm install
cp .env.example .env   # opcional
npm run dev            # http://localhost:5173
```

Sem `VITE_API_URL` a aplicação roda em **modo mock**: a lista fica em memória no
navegador, com os mesmos códigos de resposta da API (201, 200, 204, 404, 409).
Com a variável definida, todas as ações passam a ser requisições HTTP reais.

O `vite.config.js` já traz um proxy `/api → http://localhost:8080`, o que evita
configurar CORS durante o desenvolvimento.

## Endpoints consumidos

| Método | Endpoint | Onde aparece na interface |
| --- | --- | --- |
| GET | `/funcionarios` | Painel e aba Candidatos |
| GET | `/funcionarios/{id}` | Cartão "Consulta por ID" |
| POST | `/funcionarios` | Aba Cadastrar |
| PUT | `/funcionarios/{id}` | Aba Editar |
| PATCH | `/funcionarios/{id}` | Aba Atualizar status |
| DELETE | `/funcionarios/{id}` | Aba Excluir e ações da tabela |

## Estrutura

```
src/
  api/
    client.js         cliente HTTP (fetch), erros e log de requisições
    funcionarios.js   repositório: escolhe entre HTTP e mock
    mockAdapter.js    simula o controller sobre uma lista em memória
  components/         Sidebar, TopBar, Tag, Field, FuncionarioForm,
                      FuncionariosTable, ConfirmDialog, Toast
  pages/              uma página por funcionalidade/método HTTP
  hooks/
    useFuncionarios.js estado central + operações CRUD + indicadores
    useToast.js        avisos com a resposta HTTP
  styles/
    tokens.css        cores, tipografia, espaçamento e sombras
    base.css          reset e componentes (botões, campos, tabelas, diálogo)
    app.css           layout das telas
  data/seed.js        candidatos fictícios do modo mock
  utils/format.js     moeda, rótulos, validação e montagem do corpo JSON
  constants.js        status, abas e campos do formulário
```

## Trocar de mock para a API real

1. Suba a API Spring Boot em `http://localhost:8080`.
2. Crie `.env` com `VITE_API_URL=/api` (proxy) ou a URL completa.
3. Reinicie `npm run dev`. Nenhum componente precisa mudar — só a camada `api/`.

Se a API devolver o objeto criado/atualizado no corpo, o hook usa esse retorno;
caso devolva vazio, ele aplica o corpo enviado ao estado local.

## Identidade visual

Base off-white (`#f7f6f1`), preto quente para texto e amarelo `#ffd21e` como cor
de marca — aplicada em preenchimentos, indicador da aba ativa e gráficos. Todos
os valores vêm de variáveis CSS em `styles/tokens.css`.
