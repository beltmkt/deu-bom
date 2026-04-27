---
status: ready-for-review
created: 2026-04-27
route: one-shot
---

# Review Prompt: Corrigir textos com encoding quebrado

Faça uma revisão adversarial, sem assumir que a alteração está correta.

## Intent

Problema: textos públicos do app exibiam mojibake em "FINANÇAS", especialmente em meta tags sociais do `index.html`.

Abordagem: substituir as ocorrências quebradas por `FINANÇAS`, mantendo o restante do HTML inalterado.

## Arquivo Alterado

- `index.html`

## Mudança Para Revisar

- `og:site_name` agora usa `DEU BOM!! FINANÇAS SEM ERRO`.
- `og:image:alt` agora usa `Logo do aplicativo DEU BOM!! FINANÇAS SEM ERRO`.
- `twitter:title` agora usa `DEU BOM!! FINANÇAS SEM ERRO`.

## Validação Já Executada

- Busca por padrões típicos de mojibake em `src`, `public`, `index.html`, `package.json`, `README.md` e `docs` não retornou ocorrências.
- `npm run build` passou.

## Perguntas De Revisão

- Algum texto público visível continua com encoding quebrado?
- A alteração introduziu risco em SEO/social previews?
- Há algum arquivo de app relevante que deveria estar no escopo e ficou fora?
