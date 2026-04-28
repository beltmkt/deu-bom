# Work Log

## 2026-04-15

- Repositorio local foi recuperado e conectado ao GitHub.
- `.env` passou a ficar fora do versionamento com `.env.example` seguro.
- Dashboard e Transactions foram separados em papeis:
  - Dashboard = leitura executiva
  - Transactions = operacao e manutencao
- Store financeira passou a recarregar do banco apos mutacoes para evitar inconsistencias.

## Proxima retomada

- Aplicar a nova base visual em todas as abas e componentes principais.
- Testar exclusao/edicao de series direto na interface.
- Normalizar textos com acentos quebrados.
- Expandir o BMAD com decisoes de produto e arquitetura conforme novas frentes forem abertas.

## Checkpoint visual - em andamento

- Objetivo: deixar o sistema simples, funcional, robusto e menos poluido.
- Direcao:
  - cada aba com funcao clara e identidade propria
  - cards mais contidos e menos decorativos
  - melhor uso de largura em desktop
  - mesma qualidade de leitura em mobile

## 2026-04-15 - checkpoint consolidado

- Criada base visual compartilhada:
  - `AppShell`
  - `PageIntro`
  - `SurfaceCard`
  - `EmptyState`
- Navegacao inferior ajustada para ficar mais elegante e utilizavel em desktop.
- Dashboard e Transactions ajustados para melhor largura em telas maiores.
- Analytics redesenhada para leitura historica mais limpa.
- Budgets redesenhada com cards mais objetivos e distribuicao mais clara.
- Settings reorganizada para separar melhor equipe, conta, dados e preferencias.
- Leisure/Festometro recebeu base responsiva de cabecalho e largura maior para desktop.
- Build validada com sucesso.

## Dúvidas levantadas nesta rodada

- Festometro:
  - a regra ideal para criancas continua sendo percentual unico por evento ou precisamos suportar faixas?
  - o fluxo principal deve priorizar "calculadora" ou "eventos salvos" ao abrir a aba?
- Importacao/exportacao:
  - o CSV atual deve continuar simples ou precisa aceitar importacao bidirecional no futuro?
- Workspace:
  - owners e editors devem ter diferencas visuais mais explicitas dentro das telas colaborativas?

## Próxima retomada sugerida

- Normalizar textos com encoding quebrado em todo o projeto.
- Revisar Festometro internamente com mais profundidade visual e funcional.
- Tratar o backlog de lint antigo fora da frente visual.

## 2026-04-27 - PRD e confiabilidade financeira

- PRD completo criado em `_bmad-output/planning-artifacts/prd.md`.
- Primeira frente derivada do PRD selecionada: confiabilidade do nucleo financeiro e QA critico.
- Criado checklist manual em `docs/qa/core-finance-reliability.md` cobrindo:
  - CRUD basico
  - recorrencias e parcelas
  - reload e persistencia
  - balanco mensal
  - workspace
  - falhas de permissao, sincronizacao e contagem divergente
- Helpers de serie/escopo foram separados para facilitar revisao e reduzir risco de logica opaca no store.
