---
title: 'Voice Command Documentation Package'
type: 'feature'
created: '2026-04-30'
status: 'in-review'
baseline_commit: 'b3995682207f038765807dec3d4134bd0f06d485'
context:
  - '{project-root}/_bmad-output/project-context.md'
  - '{project-root}/docs/bmad/current-state.md'
  - '{project-root}/docs/bmad/voice-command-capability-map.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** O app ja tem um mapa amplo de comandos de voz, mas ainda falta transformar esse inventario em documentacao operacional para guiar implementacao, revisao e testes sem redescobrir campos em cada tela. Sem esse pacote, agentes e devs podem implementar comandos de forma inconsistente, com lacunas de confirmacao, escopo e ambiguidade.

**Approach:** Criar um pacote documental complementar ao mapa existente: um plano de implementacao por fases, um contrato tecnico de intents/resolver/executor e uma matriz de testes/comandos cobrindo os modulos principais. A documentacao deve ser pronta para desenvolvimento, com caminhos de codigo, regras de seguranca e criterios Given/When/Then.

## Boundaries & Constraints

**Always:** Manter `docs/bmad/voice-command-capability-map.md` como fonte de inventario e evitar duplicar todo o conteudo literalmente. Escrever em pt-BR sem acentos novos desnecessarios, seguindo o padrao atual de ASCII para reduzir risco de encoding. Cobrir Financas, Lista, Festometro, Metas, Analytics, Configuracoes, Workspace e navegacao. Explicitar confirmacao para comandos destrutivos, escopo `single/future/all` para series financeiras e resolucao visual para ambiguidades.

**Ask First:** Antes de alterar codigo funcional, adicionar tabelas Supabase, mudar navegacao mobile, ativar Metas no mobile, criar fluxo de permissao de membro ou transformar o parser atual em producao. Se a documentacao revelar que uma feature ainda nao existe no banco, registrar como dependencia/futuro em vez de inventar implementacao.

**Never:** Nao implementar comandos de voz nesta spec. Nao editar arquivos gerados de Supabase. Nao prometer comandos sem indicar dependencias quando o campo ou acao ainda nao existe. Nao remover o mapa operacional ja publicado.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pacote documental principal | Mapa operacional existente e codigo atual | Documentos novos conectam inventario, arquitetura, fases e criterios de teste | Se houver lacuna de produto, registrar como dependencia e nao preencher com fantasia |
| Comando destrutivo | Excluir transacao, limpar lista, excluir evento, limpar dados | Documentacao exige confirmacao visual e resumo do impacto | Marcar risco medio/alto e bloquear execucao direta |
| Transacao recorrente | Update/delete em parcela ou assinatura | Documentacao exige escopo `single`, `future` ou `all` | Se escopo ausente, pedir escolha antes de executar |
| Entidade ambigua | Dois itens chamados mercado/arroz/Ana | Documentacao define escolha visual com candidatos ranqueados | Se mais de 5 candidatos, pedir detalhe adicional |

</frozen-after-approval>

## Code Map

- `docs/bmad/voice-command-capability-map.md` -- Inventario completo de dominios, campos, aliases, comandos e regras.
- `src/services/voiceCommandParser.ts` -- Parser atual, limitado a criacao de transacao e item de lista.
- `src/hooks/useVoiceCommand.ts` -- Captura Web Speech API, transcript parcial/final e erros de permissao.
- `src/pages/Transactions.tsx` -- Fluxo atual de voz para rascunho financeiro e filtros/kanban.
- `src/pages/ShoppingList.tsx` -- Fluxo atual de voz para rascunho de item local.
- `src/pages/Leisure.tsx` -- Festometro: eventos, calculadora, participantes, itens e rateio.
- `src/pages/Budgets.tsx` -- Metas de compra em `purchase_goals`.
- `src/pages/Analytics.tsx` -- Filtros de periodo, tipo, status e categoria.
- `src/pages/Settings.tsx` -- Tema, ciclo, export/import, limpeza, perfil e workspace.
- `src/stores/financeStore.ts` -- Mutacoes financeiras, categorias, budgets, settings e series.
- `src/integrations/supabase/types.ts` -- Campos reais das tabelas usadas pela documentacao.

## Tasks & Acceptance

**Execution:**
- [x] `docs/bmad/voice-command-implementation-plan.md` -- Criar plano por fases com escopo, dependencias, arquivos tocados, riscos e ordem de entrega -- transforma o mapa amplo em roteiro implementavel.
- [x] `docs/bmad/voice-command-intent-contract.md` -- Criar contrato tecnico para `VoiceIntent`, dominios, actions, parser, resolver, confirm sheet e executor -- estabiliza a interface entre captura, interpretacao e execucao.
- [x] `docs/bmad/voice-command-test-matrix.md` -- Criar matriz Given/When/Then com comandos por modulo, casos ambiguos, riscos e criterios de aceite -- permite testar a cobertura sem depender de memoria.
- [x] `docs/bmad/README.md` -- Atualizar indice BMAD para referenciar o novo pacote de voz -- torna a documentacao descobrivel.
- [x] `docs/bmad/work-log.md` -- Registrar a conclusao da frente documental -- preserva continuidade do projeto.

**Acceptance Criteria:**
- Given um dev abre `docs/bmad/README.md`, when procura a frente de comandos de voz, then encontra links para mapa operacional, plano de implementacao, contrato de intent e matriz de testes.
- Given um agente vai implementar voz em Financas ou Lista, when consulta o plano, then ve exatamente quais arquivos tocar primeiro e quais comandos ficam fora do primeiro lote.
- Given um comando destrutivo ou ambiguo aparece na matriz, when o criterio e lido, then ha confirmacao visual, escolha de candidato ou pedido de detalhe antes da execucao.
- Given uma transacao recorrente sera alterada por voz, when a documentacao descreve o fluxo, then o escopo `single/future/all` e obrigatorio antes de chamar a store.
- Given um modulo ainda nao tem suporte tecnico completo, when aparece nos documentos, then ele fica marcado como dependencia/fase futura, nao como comportamento ja pronto.

## Spec Change Log

## Design Notes

O pacote deve ser complementar:

- Mapa operacional = tudo que existe e pode virar comando.
- Plano de implementacao = em que ordem construir e quais arquivos tocar.
- Contrato de intent = formato tecnico para parser/resolver/executor.
- Matriz de testes = frases, estados e resultados esperados.

Evitar transformar os novos documentos em copias longas do mapa. Cada doc deve apontar para o mapa quando o detalhe completo ja estiver ali.

## Verification

**Commands:**
- `npm run lint` -- expected: sem erros; warnings existentes de Fast Refresh podem permanecer.
- `npm run build` -- expected: build Vite/PWA concluido; aviso existente de chunk grande pode permanecer.
- `git diff --check` -- expected: sem erros de whitespace.

**Manual checks (if no CLI):**
- Abrir os tres documentos novos e confirmar que cada um tem proposito distinto, links relativos funcionais e criterios Given/When/Then claros.
