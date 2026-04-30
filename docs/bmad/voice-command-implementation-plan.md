# Plano de implementacao de comandos de voz

Este plano transforma o mapa operacional em uma sequencia de entrega. O inventario completo continua em `voice-command-capability-map.md`; este arquivo define ordem, arquivos, riscos e limites.

## Objetivo

Construir comandos de voz robustos sem quebrar os fluxos atuais de Financas e Lista de Compras. A entrega deve evoluir por camadas compartilhadas antes de expandir para Festometro, Metas, Analytics e Configuracoes.

## Premissas

- O MVP atual ja usa `src/hooks/useVoiceCommand.ts` e `src/services/voiceCommandParser.ts`.
- Financas e Lista de Compras ja transformam voz em rascunho revisavel.
- A `financeStore` deve continuar sendo a fonte de verdade para transacoes, categorias, budgets e settings.
- A Lista de Compras ainda persiste em `localStorage`; qualquer sincronizacao futura precisa de outra frente.
- Festometro depende de workspace e permissao de edicao.
- Metas e Analytics estao fora da navegacao mobile atual.

## Fase 0 - Preparar contrato compartilhado

Arquivos:

- `src/services/voiceCommandParser.ts`
- `src/services/voiceCommandResolver.ts` novo
- `src/services/voiceCommandExecutor.ts` novo
- `src/types/voice.ts` novo
- `src/components/VoiceCommandConfirmSheet.tsx` novo

Escopo:

- Criar `VoiceIntent` generico com `domain`, `action`, `fields`, `target`, `scope`, `risk`, `confidence` e `requiresConfirmation`.
- Manter compatibilidade com criacao atual de transacao e item de lista.
- Separar parsing de resolucao de entidade.
- Centralizar regras de confirmacao em componente compartilhado.

Riscos:

- Quebrar o parser atual.
- Executar comando de baixa confianca sem revisao.

Aceite:

- Given um comando ja suportado hoje, when ele e falado em Financas ou Lista, then o rascunho continua aparecendo para revisao.
- Given um comando ambiguo ou destrutivo, when o parser gera intent, then `requiresConfirmation` e `risk` refletem o bloqueio antes de executar.

## Fase 1 - Lista de Compras completa

Arquivos:

- `src/pages/ShoppingList.tsx`
- `src/types/shopping.ts`
- `src/services/voiceCommandParser.ts`
- `src/services/voiceCommandResolver.ts`
- `src/components/VoiceCommandConfirmSheet.tsx`

Comandos:

- Criar item.
- Marcar/desmarcar comprado.
- Alterar quantidade, unidade e preco.
- Renomear item.
- Remover item.
- Limpar comprados ou limpar lista com confirmacao.

Riscos:

- Itens duplicados com nomes parecidos.
- Limpeza acidental de lista inteira.

Aceite:

- Given dois itens com nomes parecidos, when o usuario pede para remover um deles, then a UI pede escolha visual.
- Given o usuario fala `limpar lista`, when ha itens cadastrados, then a UI mostra confirmacao antes de apagar.

## Fase 2 - Financas operacional

Arquivos:

- `src/pages/Transactions.tsx`
- `src/components/TransactionForm.tsx`
- `src/components/TransactionDeleteModal.tsx`
- `src/stores/financeStore.ts`
- `src/services/voiceCommandParser.ts`
- `src/services/voiceCommandResolver.ts`
- `src/services/voiceCommandExecutor.ts`

Comandos:

- Criar receita/despesa com data, categoria, recorrencia, parcela e nota.
- Marcar pago, recebido ou pendente.
- Alterar valor, data, titulo, categoria, nota e recorrencia.
- Excluir transacao.
- Buscar e filtrar por tipo, status, categoria, texto e mes.

Regras obrigatorias:

- Transacao recorrente ou parcelada exige escopo `single`, `future` ou `all`.
- Update/delete deve validar ids afetados usando os padroes ja existentes na store.
- Categoria deve ser resolvida por nome ou fallback seguro do tipo.

Aceite:

- Given uma assinatura mensal, when o usuario pede `mudar internet para dia 10`, then a UI pergunta se altera so este lancamento, este e futuros ou toda a serie.
- Given o usuario fala `marcar mercado como pago`, when existe um unico match visivel, then o app mostra resumo e aplica status `completed`.

## Fase 3 - Navegacao global

Arquivos:

- `src/App.tsx`
- `src/components/BottomNav.tsx`
- `src/hooks/useVoiceCommand.ts`
- novo hook global se necessario: `src/hooks/useGlobalVoiceCommand.ts`

Comandos:

- Abrir Inicio, Financas, Lista, Festometro, Metas, Dashboard e Config.
- Voltar.
- Fechar/cancelar modal ativo.

Regras:

- Metas e Dashboard podem navegar no desktop; no mobile devem avisar que nao aparecem na barra inferior.
- Rotas autenticadas continuam protegidas por `ProtectedRoute`.

## Fase 4 - Festometro

Arquivos:

- `src/pages/Leisure.tsx`
- `src/components/EventDeleteModal.tsx`
- `src/services/voiceCommandParser.ts`
- `src/services/voiceCommandResolver.ts`
- `src/services/voiceCommandExecutor.ts`

Comandos:

- Abrir eventos ou calculadora.
- Calcular evento por tipo, adultos, criancas, duracao e modo de consumo.
- Criar evento com data, orcamento e opcao de Google Agenda.
- Adicionar, editar e remover item.
- Adicionar, editar, remover e marcar participante como pago.

Regras:

- Toda mutacao exige `canEdit`.
- Alteracao de item ou participante recalcula total e rateio.
- Criar despesa financeira a partir do evento continua pedindo confirmacao.
- `marcar item como comprado` fica futuro, pois `event_items` nao tem campo de comprado.

## Fase 5 - Metas, Analytics, Configuracoes e Workspace

Arquivos:

- `src/pages/Budgets.tsx`
- `src/pages/Analytics.tsx`
- `src/pages/Settings.tsx`
- `src/hooks/useWorkspace.tsx`
- `src/hooks/useTheme.tsx`

Comandos seguros:

- Filtrar Analytics.
- Criar, pausar, reativar, concluir e excluir metas.
- Alterar tema, ciclo e notificacoes.
- Exportar JSON/CSV.
- Abrir modal de convite.

Comandos com confirmacao forte:

- Importar dados.
- Limpar todos os dados.
- Convidar pessoa.
- Renomear workspace.

Futuro:

- Remover membro e alterar permissao so entram quando houver fluxo de UI/API pronto.

## Sequencia recomendada para PRs

1. Contrato e confirm sheet, mantendo comportamento atual.
2. Lista de Compras completa.
3. Financas update/delete/filtros.
4. Navegacao global.
5. Festometro.
6. Metas, Analytics e Configuracoes.

## Validacao por entrega

- `npm run lint`
- `npm run build`
- Revisao manual em mobile e desktop.
- Conferir que comandos destrutivos nunca executam sem confirmacao.
- Conferir que comandos recorrentes nunca executam sem escopo.
