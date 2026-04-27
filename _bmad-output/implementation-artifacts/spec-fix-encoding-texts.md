---
title: 'Corrigir textos com encoding quebrado'
type: 'bugfix'
created: '2026-04-27'
status: 'done'
route: 'one-shot'
---

# Corrigir textos com encoding quebrado

## Intent

**Problem:** Textos públicos do app exibiam mojibake em "FINANÇAS", prejudicando título, descrição e previews sociais.

**Approach:** Normalizar as ocorrências quebradas no `index.html` para `FINANÇAS` e confirmar que não restaram padrões típicos de encoding quebrado no escopo do app.

## Suggested Review Order

- Confira o título e descrição usados pelo navegador e buscadores.
  [`index.html:16`](../../index.html#L16)

- Confira metadados Open Graph e Twitter usados em compartilhamentos sociais.
  [`index.html:28`](../../index.html#L28)

- Revise o prompt deixado para revisão adversarial separada.
  [`review-prompt-fix-encoding-texts.md:1`](review-prompt-fix-encoding-texts.md#L1)
