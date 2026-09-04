# Contrata RH — React + TypeScript

Versão com o design original preservado, integração real com a API e validações de formulário.

## Rodar

```bash
npm.cmd install
npm.cmd run dev
```

## API

`VITE_API_BASE_URL=https://diogo-api.onrender.com`

O mascote enviado pelo usuário é usado como marca central, favicon, hero do painel e tela inicial de carregamento.

As operações continuam sendo reais: GET lista/detalhe/indicadores, POST, PUT, PATCH e DELETE. Erros HTTP, conflitos 409, indisponibilidade e timeout são exibidos sem mascarar a resposta do backend.
