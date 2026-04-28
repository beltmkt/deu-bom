---
title: 'Confiabilidade do núcleo financeiro e QA crítico'
type: 'bugfix'
created: '2026-04-27'
status: 'in-review'
baseline_commit: '51e5f880b0e121ea2dee506d45e18439217391fa'
context:
  - _bmad-output/project-context.md
  - _bmad-output/planning-artifacts/prd.md
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** O PRD define que a promessa "Finanças Sem Erro" depende de confiança no CRUD financeiro, recorrências, cálculos, persistência após reload e ausência de resíduos de dados apagados. A base já revalida dados após mutações, mas a lógica crítica de série/escopo fica embutida no store e não há um roteiro de QA explícito para validar os cenários que mais quebram confiança.

**Approach:** Tornar a confiabilidade do núcleo financeiro mais auditável e verificável: extrair/fortalecer helpers puros de escopo de séries e resumo financeiro, usar esses helpers no store sem mudar contrato de dados, melhorar mensagens de erro/sucesso diretamente ligadas a falhas críticas e criar um checklist de QA manual para CRUD, recorrência, reload, cálculo e workspace.

## Boundaries & Constraints

**Always:** preservar Supabase como fonte persistente, manter `refreshData()` após mutações críticas, respeitar `current_workspace_id`, manter escopos `single`, `future` e `all`, manter datas `yyyy-MM-dd`, reutilizar `transactionInsights` ou utilitários próximos, e manter textos visíveis em português.

**Ask First:** qualquer mudança de schema Supabase, introdução de framework de testes, alteração de política de permissões, mudança de regra de recorrência existente ou remoção de importação/exportação.

**Never:** implementar SEO público, landing page, monetização, recomendações de investimento, refatoração visual ampla, alteração gerada em `src/integrations/supabase/types.ts`, ou estados otimistas que possam contradizer o backend.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Edit single recurring item | Série com 5 itens, usuário edita o 3º como `single` | Só o item 3 muda; após reload, demais itens permanecem iguais | Se a mutação afetar quantidade inesperada, mostrar erro e não fechar fluxo como sucesso |
| Edit future recurring items | Série com 5 itens, usuário edita o 3º como `future` | Itens 3-5 mudam; itens 1-2 permanecem; datas futuras preservam intervalo correto | Erro se ids calculados ou ids retornados divergirem |
| Delete all recurring items | Série com `groupId`, usuário escolhe `all` | Todos os itens relacionados deixam de aparecer e param de afetar balanços | Erro acionável se Supabase retornar menos ids do que o esperado |
| Deleted data in balance | Item de despesa excluído e dados recarregados | `summarizeTransactions` não inclui item excluído no saldo, despesas ou pendências | QA deve falhar se balanço continuar considerando item removido |
| Workspace context | Usuário com workspace ativo cria/edita/exclui | Operações atuam no workspace ativo; dados pessoais não se misturam | Mensagem deve diferenciar falha de permissão/sincronização quando possível |
| Empty or invalid target | Id inexistente ou lista calculada vazia | Nenhuma mutação destrutiva é enviada | Toast explica que nenhum lançamento válido foi encontrado |

</frozen-after-approval>

## Code Map

- `src/stores/financeStore.ts` -- fonte de verdade para CRUD, recorrências, workspace e refresh pós-mutação.
- `src/utils/transactionInsights.ts` -- resumo e filtro mensal usados por Dashboard, Transactions e BalanceCard.
- `src/components/TransactionForm.tsx` -- fluxo de criação/edição, escopo de atualização de séries e toasts de sucesso.
- `src/components/TransactionDeleteModal.tsx` -- confirmação de exclusão e atualização em séries.
- `src/components/TransactionCard.tsx` -- acionador de exclusão/status e integração com o modal.
- `docs/bmad/current-state.md` e `docs/bmad/work-log.md` -- documentação viva a atualizar quando a frente fechar.
- `docs/qa/core-finance-reliability.md` -- novo checklist manual para validar os cenários críticos sem introduzir runner de testes.

## Tasks & Acceptance

**Execution:**
- [x] `src/utils/transactionSeries.ts` -- criar helpers puros para identificar série, calcular ids por escopo e validar contagem/ids esperados -- reduz risco de lógica opaca dentro do store.
- [x] `src/stores/financeStore.ts` -- substituir lógica inline de série pelos helpers, manter validações de ids retornados e melhorar mensagens para falha de sincronização/permissão/contagem -- preserva comportamento com rastreabilidade melhor.
- [x] `src/utils/transactionInsights.ts` -- garantir que resumos diferenciem totais gerais, concluídos e pendentes sem contar itens removidos da fonte atual -- protege Dashboard/Transactions contra balanço infiel.
- [x] `src/components/TransactionDeleteModal.tsx` e `src/components/TransactionForm.tsx` -- ajustar copy de confirmação para explicar impacto de `single`, `future` e `all`, além de estados de salvamento/exclusão -- reduz erro de escopo pelo usuário.
- [x] `docs/qa/core-finance-reliability.md` -- criar checklist Given/When/Then para CRUD, recorrências, reload, balanço, workspace e falhas esperadas -- torna QA mínimo repetível.
- [x] `docs/bmad/work-log.md` e, se necessário, `docs/bmad/current-state.md` -- registrar a frente concluída e qualquer limitação remanescente.

**Acceptance Criteria:**
- Given uma série recorrente, when o usuário edita ou exclui com escopo `single`, `future` ou `all`, then apenas os lançamentos esperados são afetados e o app revalida os dados persistidos.
- Given uma transação excluída, when o usuário recarrega e revisa Dashboard/Transactions, then o item não aparece e não compõe saldo, despesa, receita ou pendência.
- Given uma mutação que afeta quantidade inesperada de registros, when o backend retorna ids divergentes, then o app exibe erro e não apresenta toast de sucesso.
- Given um workspace ativo, when o usuário cria ou altera dados financeiros, then os registros pertencem ao contexto ativo e não ao espaço pessoal.
- Given o checklist de QA, when alguém executa os cenários, then cada resultado esperado é verificável sem conhecimento interno do código.

## Spec Change Log

## Design Notes

Manter a mudança pequena e verificável: helpers puros podem ser revisados por entrada/saída sem exigir mock completo de Supabase. O store continua dono de persistência e refresh; os componentes apenas explicam impacto e invocam escopos já existentes.

## Verification

**Commands:**
- `npm run build` -- passed em 2026-04-27; permanece aviso de chunk grande já existente.
- `npm run lint` -- passed em 2026-04-27 com 10 avisos preexistentes de `react-refresh/only-export-components`.

**Manual checks:**
- Executar `docs/qa/core-finance-reliability.md` nos fluxos de criar, editar, excluir, recorrência `single/future/all`, reload e workspace.
