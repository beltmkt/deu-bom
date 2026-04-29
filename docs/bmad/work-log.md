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

## 2026-04-28 - Direcao do Festometro

- Usuario definiu que o Festometro deve priorizar organizacao de valores entre participantes e lista do que comprar com quantidade.
- Direcao escolhida: gerenciador completo de eventos, com visual mais divertido e fluxo principal simples.
- Tipos de evento devem ser ampliados de forma organizada e minimalista, sem transformar a tela em catalogo confuso.
- Percentual de crianca deve virar configuracao avancada.
- Ao salvar evento, o app deve perguntar antes de criar despesa no financeiro.
- Lista de compras entrou no roadmap como plus importante da ferramenta.
- Primeira implementacao aplicada em `src/pages/Leisure.tsx`:
  - fluxo inicial mais simples
  - opcoes avancadas recolhidas
  - novos tipos de evento
  - consumo economico/padrao/generoso
  - toggle para criar despesa no financeiro antes de salvar

## 2026-04-28 - UX Design Specification concluida

- Workflow `bmad-create-ux-design` concluido.
- Documento principal salvo em `_bmad-output/planning-artifacts/ux-design-specification.md`.
- Visualizador de direcoes salvo em `_bmad-output/planning-artifacts/ux-design-directions.html`.
- Decisao de UX consolidada:
  - Inicio como guia diario do mes.
  - Financas como central operacional em kanban.
  - Mobile com filtros compactos, bottom sheets e alternativa ao drag.
  - Festometro com eventos em cards e detalhes sob demanda.
  - WCAG 2.2 AA como meta formal de acessibilidade.
- Proximo passo recomendado: transformar a especificacao em epicos/stories ou executar ajustes por tela com `bmad-quick-dev`.

## 2026-04-28 - Epicos e stories concluidos

- Workflow `bmad-create-epics-and-stories` concluido.
- Documento principal salvo em `_bmad-output/planning-artifacts/epics.md`.
- Resultado consolidado:
  - 9 epicos.
  - 62 historias.
  - 98 requisitos funcionais cobertos.
  - 33 requisitos de UX cobertos.
- Ajuste importante feito na validacao final:
  - Festometro entrou como Epic 9 proprio, pois estava forte na UX mas ainda sem rastreabilidade de producao.
- Recomendacao antes de iniciar implementacao:
  - criar um Architecture Lite curto com modelo de transacao, saldo, datas, recorrencia/parcela, store/query keys e workspace.
  - iniciar producao pela historia vertical "Cadastrar e listar transacoes manuais do mes atual".

## 2026-04-29 - Foco mobile e proximas abas

- Barra inferior mobile reduzida para Inicio, Financas, Festometro e Config.
- Aba Metas foi ocultada momentaneamente no mobile.
- Dashboard/relatorios foi removido da navegacao mobile.
- Criado mapa em `docs/bmad/mobile-next-features-map.md` para:
  - aba Lista de Compras;
  - indicacao de promocoes e melhores mercados por localizacao;
  - comando de voz para adicionar, atualizar e apagar transacoes, receitas, despesas e itens da lista.

## 2026-04-29 - Lista de Compras e voz MVP

- Criada rota autenticada `/shopping-list`.
- Adicionada aba Lista na barra inferior mobile.
- Lista de Compras permite adicionar, marcar comprado e remover itens, persistindo em `localStorage`.
- Reconhecimento de voz adicionado em:
  - `Financas`: cria despesa ou receita pendente com categoria sugerida por tipo.
  - `Lista de Compras`: cria item com quantidade, unidade e valor estimado.
- Parser inicial de comandos em `src/services/voiceCommandParser.ts`.
- Hook compartilhado de captura por voz em `src/hooks/useVoiceCommand.ts`.

## 2026-04-29 - Voz: fallback e mapa abrangente

- Corrigido reconhecimento que escrevia texto parcial mas nao executava quando o navegador nao emitia resultado final.
- Parser passou a aceitar contexto preferencial da tela (`transaction` ou `shopping`) para evitar comando cair no dominio errado.
- Criado mapa completo em `docs/bmad/voice-command-capability-map.md` cobrindo criacao, atualizacao e exclusao por voz em Financas, Lista de Compras, Festometro, Metas, Categorias, Orcamentos, Configuracoes e Workspace.
