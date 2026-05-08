---
title: 'Lista de compras com preco opcional'
type: 'feature'
created: '2026-05-08'
status: 'done'
route: 'one-shot'
---

# Lista de compras com preco opcional

## Intent

**Problem:** A lista de compras precisava aceitar itens mesmo quando o usuario ainda nao sabe o preco, sem tratar ausencia de valor como `R$ 0,00` definitivo.

**Approach:** O preco estimado passou a aceitar `null`, o formulario manual e o fluxo por voz permitem campo vazio, e cada item ganhou um campo para atualizar o preco posteriormente.

## Suggested Review Order

**Preco opcional**

- Entrada unica converte campo vazio em preco pendente.
  [`ShoppingList.tsx:30`](../../src/pages/ShoppingList.tsx#L30)

- Estado do formulario preserva campo vazio ate salvar.
  [`ShoppingList.tsx:67`](../../src/pages/ShoppingList.tsx#L67)

- Criacao manual grava item sem preco quando vazio.
  [`ShoppingList.tsx:122`](../../src/pages/ShoppingList.tsx#L122)

**Atualizacao posterior**

- Item existente pode receber preco depois de criado.
  [`ShoppingList.tsx:190`](../../src/pages/ShoppingList.tsx#L190)

- Campo inline edita o preco salvo no item.
  [`ShoppingList.tsx:465`](../../src/pages/ShoppingList.tsx#L465)

**Exibicao e tipos**

- Itens antigos sao normalizados antes de renderizar.
  [`ShoppingList.tsx:51`](../../src/pages/ShoppingList.tsx#L51)

- UI diferencia preco pendente de valor zerado.
  [`ShoppingList.tsx:457`](../../src/pages/ShoppingList.tsx#L457)

- Tipo compartilhado permite preco ausente.
  [`shopping.ts:6`](../../src/types/shopping.ts#L6)
