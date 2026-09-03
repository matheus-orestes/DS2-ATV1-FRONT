# Contrata RH — React + TypeScript

Aplicação de gestão de candidatos inspirada no HTML de referência enviado, reestruturada em componentes React e serviços TypeScript.

## API utilizada

Base padrão: `https://diogo-api.onrender.com`

- `GET /funcionarios`
- `GET /funcionarios/{id}`
- `GET /funcionarios/indicadores`
- `POST /funcionarios`
- `PUT /funcionarios/{id}`
- `PATCH /funcionarios/{id}`
- `DELETE /funcionarios/{id}`

A URL pode ser sobrescrita em `.env` com `VITE_API_BASE_URL`.

## Rodando

```bash
npm install
npm run dev
```

Para produção:

```bash
npm run build
npm run preview
```

## Organização

- `src/services`: acesso HTTP e tratamento de erros da API.
- `src/types`: contratos TypeScript.
- `src/components`: componentes visuais reutilizáveis.
- `src/features/dashboard`: painel de indicadores e visualizações.
- `src/features/funcionarios`: formulário, tabela, detalhes e PATCH.
- `src/utils`: status, moeda, normalização e formatação.

O dashboard usa os dados de `GET /funcionarios`. O endpoint de indicadores está implementado no serviço para uso posterior/expansão sem acoplar a UI a um formato de resposta desconhecido.

Quando a API estiver indisponível, a interface mantém o layout funcional com os 8 registros de demonstração presentes no HTML de referência e exibe um aviso explícito de modo demonstração.
