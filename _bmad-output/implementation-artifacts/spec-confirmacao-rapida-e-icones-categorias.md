---
title: 'Confirmacao rapida e icones de categorias'
type: 'one-shot'
created: '2026-04-29'
status: 'done'
route: 'one-shot'
---

# Confirmacao rapida e icones de categorias

## Intent

Problem: no mobile, confirmar um lancamento como pago ou recebido ainda ficava pouco explicito e os icones podiam herdar categorias antigas incoerentes.

Approach: separar a acao de confirmar em um botao externo ao card e centralizar a escolha de icones por nome de categoria para corrigir a exibicao em lancamentos, formularios e orcamentos.

## Suggested Review Order

1. [src/components/TransactionCard.tsx](../../src/components/TransactionCard.tsx) - conferir o novo botao externo de status, clique no card e fluxo para recorrentes.
2. [src/utils/categoryIcons.ts](../../src/utils/categoryIcons.ts) - revisar o mapa de nomes de categoria para icones canonicos.
3. [src/components/TransactionForm.tsx](../../src/components/TransactionForm.tsx) - validar seletor de categoria usando o resolvedor compartilhado.
4. [src/components/BudgetForm.tsx](../../src/components/BudgetForm.tsx) - validar seletor de categorias de orcamento.
5. [src/components/BudgetCard.tsx](../../src/components/BudgetCard.tsx) - validar exibicao de icones nos orcamentos.
