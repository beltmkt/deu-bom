# Mapa de Comandos de Voz

Este mapa define tudo que pode virar comando de voz no app, separando o que ja existe no MVP do que precisa de confirmacao visual, busca por item e suporte de dados.

## Principios

- Comandos destrutivos sempre pedem confirmacao antes de executar.
- Quando houver mais de um resultado parecido, o app deve mostrar uma lista curta para o usuario escolher.
- Em transacoes recorrentes ou parceladas, toda atualizacao/exclusao precisa perguntar escopo: somente este lancamento, este e futuros, ou serie inteira.
- O texto reconhecido deve aparecer na tela antes ou durante a execucao.
- O parser deve produzir uma intencao estruturada validada antes de chamar store, Supabase ou localStorage.

## Status Atual

| Area | Criar | Atualizar | Excluir | Observacao |
| --- | --- | --- | --- | --- |
| Financas | Parcial | Nao | Nao | Cria despesa/receita pendente por voz. |
| Lista de Compras | Parcial | Nao | Nao | Cria item local por voz. |
| Festometro | Nao | Nao | Nao | Tem muitos dados editaveis, precisa camada propria. |
| Metas | Nao | Nao | Nao | Aba oculta no mobile por enquanto. |
| Configuracoes | Nao | Nao | Nao | Deve aceitar poucos comandos seguros. |

## Financas

Fonte tecnica:
- Store: `src/stores/financeStore.ts`
- UI: `src/pages/Transactions.tsx`, `src/components/TransactionForm.tsx`, `src/components/TransactionCard.tsx`
- Entidades: `transactions`, `categories`, `budgets`, `settings`

### Transacoes

Comandos de criacao:
- "adicionar despesa mercado de 45 reais"
- "lancar receita freelance de 300 reais"
- "adicionar conta de luz 120 reais para amanha"
- "criar despesa internet 99 reais todo mes"
- "adicionar compra parcelada celular 1200 reais em 10 vezes"

Campos mapeaveis:
- tipo: receita ou despesa
- titulo
- valor
- categoria
- data
- status: pendente ou confirmado
- observacao
- recorrencia: unica, parcelada, assinatura
- quantidade de parcelas
- intervalo recorrente: semanal, mensal, anual

Comandos de atualizacao:
- "marcar mercado como pago"
- "alterar mercado para 60 reais"
- "mudar vencimento da internet para dia 10"
- "trocar categoria de mercado para alimentacao"
- "transformar salario em recorrente mensal"
- "renomear mercado para supermercado"

Comandos de exclusao:
- "apagar despesa mercado"
- "excluir receita freelance"
- "remover parcela do celular"

Regras de seguranca:
- Para update/delete, localizar por titulo aproximado, valor, data e categoria.
- Se houver mais de um match, mostrar sheet de escolha.
- Para recorrencia/parcela, sempre abrir modal de escopo.

## Lista de Compras

Fonte tecnica:
- UI e estado local: `src/pages/ShoppingList.tsx`
- Tipo: `src/types/shopping.ts`
- Persistencia atual: `localStorage`

Comandos de criacao:
- "adicionar arroz dois pacotes por 18 reais"
- "colocar leite 3 unidades na lista"
- "adicionar carne 2 quilos por 60 reais"
- "adicionar cafe sem valor"

Campos mapeaveis:
- nome do item
- quantidade
- unidade: unidade, pacote, kg, litro
- valor estimado
- status comprado

Comandos de atualizacao:
- "marcar arroz como comprado"
- "desmarcar leite"
- "alterar arroz para 25 reais"
- "mudar quantidade de leite para 4 unidades"
- "renomear acucar para acucar cristal"

Comandos de exclusao:
- "remover arroz da lista"
- "apagar leite"
- "limpar itens comprados"
- "limpar lista"

Regras de seguranca:
- "limpar lista" e exclusoes multiplas precisam de confirmacao.
- Item ambiguo deve abrir escolha.
- Futuro Supabase: sincronizar por usuario/workspace antes de promocoes e mercado ideal.

## Festometro

Fonte tecnica:
- UI principal: `src/pages/Leisure.tsx`
- Tabelas: `events`, `event_items`, `event_participants`
- Servico: `supabase/functions/send-event-invite-email`

### Eventos

Comandos de criacao:
- "criar evento churrasco sabado"
- "criar aniversario para 20 pessoas"
- "criar festa com orcamento de 500 reais"

Comandos de atualizacao:
- "alterar churrasco para domingo"
- "mudar orcamento do churrasco para 700 reais"
- "renomear evento para churrasco familia"
- "marcar evento como finalizado" se houver status futuro

Comandos de exclusao:
- "excluir evento churrasco"
- "apagar festa de aniversario"

### Participantes

Comandos:
- "adicionar Ana no churrasco"
- "adicionar Joao com email joao arroba exemplo ponto com"
- "marcar Ana como paga"
- "alterar quantidade da Ana para 2 adultos"
- "remover Joao do evento"

### Itens do evento

Comandos:
- "adicionar carne 3 quilos no churrasco"
- "alterar cerveja para 24 unidades"
- "marcar gelo como comprado"
- "remover pao de alho"

Regras de seguranca:
- Precisa identificar evento ativo ou pedir escolha.
- Alteracoes financeiras devem recalcular rateio antes de salvar.
- Criar despesa financeira a partir do evento deve continuar pedindo confirmacao.

## Metas

Fonte tecnica:
- UI: `src/pages/Budgets.tsx`
- Tabela: `purchase_goals`
- Estado: atualmente fora da navegacao mobile

Comandos de criacao:
- "criar meta viagem de 3000 reais ate dezembro"
- "criar meta celular 1500 reais prioridade alta"

Comandos de atualizacao:
- "adicionar 200 reais na meta viagem"
- "alterar meta viagem para 3500 reais"
- "pausar meta celular"
- "concluir meta viagem"

Comandos de exclusao:
- "excluir meta celular"

Regras:
- Como a aba esta oculta no mobile, comandos de meta devem ficar desativados ate a volta da feature.

## Categorias e Orcamentos

Fonte tecnica:
- Store: `addCategory`, `updateCategory`, `deleteCategory`, `setBudget`, `removeBudget`
- UI: `BudgetCard`, `BudgetForm`, `Settings` parcialmente

Comandos:
- "criar categoria pets como despesa"
- "renomear categoria lazer para diversao"
- "excluir categoria pets"
- "definir meta de alimentacao em 800 reais"
- "remover orcamento de transporte"

Regras:
- Excluir categoria pode afetar transacoes existentes; precisa confirmacao e plano de categoria substituta.
- Orcamento deve validar categoria existente.

## Configuracoes e Workspace

Fonte tecnica:
- Store: `updateSettings`
- Hook: `useWorkspace`
- UI: `Settings`, `WorkspaceInviteModal`

Comandos seguros:
- "mudar ciclo para dia 5"
- "ativar notificacoes"
- "desativar notificacoes"
- "mudar tema para escuro" se exposto por hook de tema

Comandos que exigem confirmacao forte:
- "convidar pessoa para equipe"
- "remover membro"
- "alterar permissao para editor"
- "exportar dados"
- "importar dados"

## Arquitetura Recomendada

Camadas:
- `useVoiceCommand`: captura, permissoes, transcript parcial/final.
- `voiceCommandParser`: transforma texto em intencao estruturada.
- `voiceCommandResolver`: busca entidades candidatas no estado atual.
- `VoiceCommandConfirmSheet`: confirma comandos destrutivos ou ambiguos.
- `voiceCommandExecutor`: executa store/Supabase/localStorage.

Formato de intencao sugerido:

```ts
type VoiceIntent = {
  domain: 'transactions' | 'shopping' | 'events' | 'goals' | 'settings';
  action: 'create' | 'update' | 'delete' | 'toggle' | 'search';
  target?: string;
  fields: Record<string, unknown>;
  confidence: number;
  requiresConfirmation: boolean;
};
```

## Ordem de Implementacao Recomendada

1. Lista de Compras: atualizar, marcar comprado, remover item.
2. Financas: marcar pago/pendente, alterar valor, remover transacao com confirmacao.
3. Financas: suporte a data, categoria, recorrencia e parcelas na criacao por voz.
4. Festometro: adicionar participante e item no evento ativo.
5. Festometro: atualizar/remover participante e item com confirmacao.
6. Metas e configuracoes quando voltarem para o fluxo mobile.
