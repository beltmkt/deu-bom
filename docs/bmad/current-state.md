# Estado Atual

## Produto

- App financeiro com foco em fluxo mensal, transacoes, orcamentos, analise e configuracoes.
- Persistencia principal em Supabase com suporte a workspace compartilhado.
- UI mobile-first em React + Vite + Tailwind + shadcn.

## Estrutura funcional

- `Dashboard`: painel resumido do mes, com foco em leitura rapida e acao.
- `Transactions`: central operacional para busca, filtro e manutencao de lancamentos.
- `Budgets`: acompanhamento por categoria.
- `Analytics`: leitura historica e tendencias.
- `Settings`: equipe, tema, exportacao/importacao e preferencias.

## Ajustes concluidos nesta etapa

- Protecao de `.env` e `.workspace/` no Git.
- Store refatorada para:
  - operar series por `group_id` e `parent_transaction_id`
  - revalidar dados com `refreshData()` apos criar, editar e excluir
  - reduzir risco de transacoes "voltarem" apos refresh
- Helpers de serie/escopo extraidos para facilitar revisao de `single`, `future` e `all`.
- Checklist QA de confiabilidade financeira criado em `docs/qa/core-finance-reliability.md`.
- Dashboard e Transactions redesenhadas com identidade distinta.
- Utilitarios compartilhados de agrupamento e resumo para reduzir duplicidade.

## Frente atual em andamento

- Revisao visual e funcional de todas as abas.
- Criacao de uma linguagem mais minimalista, coerente e responsiva para desktop e mobile.
- Consolidacao de headers, cards, grids e estados vazios para diminuir poluicao visual.
- Ajuste das paginas secundarias para manter identidade propria sem quebrar simplicidade.

## Pontos de atencao

- Alguns textos antigos ainda aparecem com encoding inconsistente em partes do projeto.
- Ainda falta auditoria completa das demais telas para alinhamento visual com a nova direcao.
- O fluxo de importacao/exportacao merece revisao separada para validacao e feedback detalhado.
- O checklist QA novo precisa ser executado manualmente em ambiente com dados reais de teste.
