# Mapa operacional de comandos de voz

Este documento mapeia os campos, modulos, abas, entidades e possibilidades que podem virar comandos de reconhecimento por voz no Deu Bom Financas. Ele foi montado a partir das telas, stores, tipos e tabelas Supabase atuais.

## Objetivo

Criar uma camada de comandos de voz robusta para:

- navegar entre abas;
- criar, editar, buscar, filtrar, marcar, remover e confirmar dados;
- preencher formularios por voz;
- resolver ambiguidade com escolha visual;
- proteger comandos destrutivos com confirmacao.

## Estado atual do app

| Modulo | Rota | Mobile | Voz hoje | Observacao |
| --- | --- | --- | --- | --- |
| Inicio | `/` | Sim | Nao | Dashboard inicial com atalhos e resumo financeiro. |
| Financas | `/transactions` | Sim | Criar parcial | Cria despesa/receita pendente por voz e revisa antes de salvar. |
| Lista | `/shopping-list` | Sim | Criar parcial | Cria item local por voz e revisa antes de adicionar. |
| Festometro | `/festometro` | Sim | Nao | Tem eventos, calculadora, itens e participantes. |
| Metas | `/budgets` | Nao no mobile | Nao | Existe no desktop; oculto da bottom nav mobile. |
| Dashboard | `/analytics` | Nao no mobile | Nao | Analises, filtros e periodo. |
| Config | `/settings` | Sim | Nao | Perfil, workspace, tema, import/export e limpeza. |

## Arquitetura recomendada

Camadas:

- `useVoiceCommand`: captura, permissoes, estado ouvindo, transcript parcial/final.
- `voiceCommandParser`: transforma texto em uma intencao normalizada.
- `voiceCommandResolver`: encontra entidades candidatas no estado atual ou Supabase.
- `VoiceCommandConfirmSheet`: revisa comando, resolve ambiguidade e confirma risco.
- `voiceCommandExecutor`: chama store, Supabase, localStorage, navegacao ou download.

Formato sugerido:

```ts
type VoiceDomain =
  | 'navigation'
  | 'transactions'
  | 'shopping'
  | 'events'
  | 'event_items'
  | 'event_participants'
  | 'goals'
  | 'categories'
  | 'budgets'
  | 'analytics'
  | 'settings'
  | 'workspace'
  | 'profile';

type VoiceAction =
  | 'navigate'
  | 'open'
  | 'close'
  | 'create'
  | 'update'
  | 'delete'
  | 'toggle'
  | 'mark'
  | 'search'
  | 'filter'
  | 'clear'
  | 'export'
  | 'import'
  | 'invite'
  | 'calculate'
  | 'confirm'
  | 'cancel';

type VoiceIntent = {
  domain: VoiceDomain;
  action: VoiceAction;
  target?: string;
  fields: Record<string, unknown>;
  scope?: 'single' | 'future' | 'all';
  confidence: number;
  requiresConfirmation: boolean;
  risk: 'none' | 'low' | 'medium' | 'high';
  transcript: string;
};
```

## Principios de seguranca

- Criacao pode ir para rascunho visual antes de salvar.
- Edicao deve mostrar os campos interpretados antes de aplicar quando houver baixa confianca.
- Exclusao, limpeza, importacao, troca de permissoes e convite sempre exigem confirmacao.
- Transacoes recorrentes, parceladas ou em serie sempre pedem escopo: `single`, `future`, `all`.
- Entidades ambiguas devem abrir lista curta com nome, valor, data e contexto.
- Comandos sobre workspace respeitam permissoes: viewer nao executa alteracoes.
- O transcript sempre deve aparecer na interface antes ou durante a execucao.

## Vocabulario global

### Acoes

| Intencao | Sinonimos de fala |
| --- | --- |
| criar | adicionar, add, inserir, lancar, registrar, incluir, colocar, novo, nova |
| atualizar | alterar, mudar, trocar, editar, corrigir, ajustar, definir |
| excluir | apagar, deletar, remover, excluir, limpar |
| marcar | marcar, confirmar, concluir, finalizar, pagar, receber, comprado |
| desmarcar | desmarcar, reabrir, voltar para pendente, desfazer, nao pago |
| buscar | buscar, procurar, encontrar, pesquisar, mostrar |
| filtrar | filtrar, mostrar apenas, ver so, listar |
| navegar | abrir, ir para, entrar em, voltar para |
| cancelar | cancelar, fechar, sair, descartar |
| confirmar | confirmar, salvar, pode salvar, sim, aplicar |

### Numeros, moeda e datas

| Campo | Possibilidades |
| --- | --- |
| numero | `1`, `um`, `uma`, `dois`, `duas`, `tres`, ate pelo menos `vinte`; expandir para centenas e milhares. |
| moeda | `real`, `reais`, `r$`, `conto`, `contos`, `mil`, `mil reais`, `1.200`, `1200`, `1200,50`. |
| data relativa | hoje, ontem, amanha, depois de amanha, semana que vem, mes que vem, proximo mes. |
| data absoluta | dia 5, dia 05/05, 5 de maio, em dezembro, ate dezembro, 30 de abril de 2026. |
| periodo | semanal, toda semana, mensal, todo mes, anual, todo ano. |

## Navegacao

| Comando | Resultado |
| --- | --- |
| `abrir inicio` / `ir para home` | Navega para `/`. |
| `abrir financas` / `ir para lancamentos` | Navega para `/transactions`. |
| `abrir lista` / `abrir lista de compras` | Navega para `/shopping-list`. |
| `abrir festometro` / `abrir eventos` | Navega para `/festometro`. |
| `abrir metas` | Navega para `/budgets`; avisar que nao aparece na nav mobile se necessario. |
| `abrir dashboard` / `abrir analises` | Navega para `/analytics`; avisar que nao aparece na nav mobile se necessario. |
| `abrir configuracoes` / `abrir config` | Navega para `/settings`. |
| `voltar` | Usa historico do navegador quando seguro. |

## Financas

Fontes: `src/pages/Transactions.tsx`, `src/components/TransactionForm.tsx`, `src/stores/financeStore.ts`, `src/types/finance.ts`.

### Entidade `transactions`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `title` | texto | descricao, nome, titulo, lancamento | criar, renomear, buscar |
| `amount` | numero positivo | valor, preco, custo, total, parcela | criar, alterar |
| `type` | enum | receita, entrada, ganho, salario = `income`; despesa, gasto, conta, saida = `expense` | criar, alterar, filtrar |
| `status` | enum | pendente, aberto, a pagar, a receber = `pending`; pago, recebido, concluido, confirmado = `completed` | marcar, desmarcar, filtrar |
| `categoryId` | categoria | nome da categoria existente: Salario, Freelance, Investimentos, Outros, Alimentacao, Transporte, Moradia, Saude, Educacao, Lazer, Assinaturas, Compras, customizadas | criar, alterar, filtrar |
| `date` | data | hoje, amanha, dia X, mes que vem, data completa | criar, alterar, filtrar |
| `notes` | texto | observacao, nota, detalhe | criar, alterar |
| `recurrenceType` | enum | unica = `none`; parcelada, x vezes = `installment`; recorrente, fixo, todo mes = `subscription` | criar, converter, alterar |
| `installmentNumber` | numero | parcela atual, parcela 2 de 10 | leitura, resolucao |
| `totalInstallments` | numero 2-120 | parcelas, vezes, 10x | criar, alterar |
| `parentTransactionId` | id | serie de parcelas antiga | interno |
| `groupId` | id | grupo da serie recorrente | interno |
| `recurrenceInterval` | enum | semanal, mensal, anual | criar, alterar |
| `recurrenceEndDate` | data | termina em, ate, data final | criar, alterar |
| `notify` | boolean | avisar, lembrete, notificar | criar, alterar |
| `calendarEventId` | id | evento de calendario | interno |

#### Criar transacao

Exemplos:

- `adicionar despesa mercado de 45 reais`
- `lancar receita freelance 300 reais`
- `criar conta de luz 120 reais para amanha`
- `adicionar salario 5000 reais todo mes dia 5`
- `adicionar celular 120 reais em 10 vezes`
- `registrar despesa internet 99 reais categoria assinaturas`

Rascunho minimo:

- `title`
- `amount`
- `type`
- `date` com default hoje
- `categoryId` por match de categoria ou primeira categoria do tipo
- `status` default `pending`
- `recurrenceType` default `none`
- `notify` default `false`

#### Atualizar transacao

Exemplos:

- `marcar mercado como pago`
- `marcar salario como recebido`
- `voltar internet para pendente`
- `alterar mercado para 60 reais`
- `mudar vencimento da internet para dia 10`
- `trocar categoria de mercado para alimentacao`
- `renomear mercado para supermercado`
- `adicionar observacao no aluguel: vence no quinto dia util`
- `transformar academia em recorrente mensal`

Resolver por:

- titulo aproximado;
- categoria;
- valor;
- data;
- coluna atual: a pagar, a receber, concluido;
- mes selecionado quando o usuario estiver em Financas.

#### Excluir transacao

Exemplos:

- `apagar despesa mercado`
- `excluir receita freelance`
- `remover parcela do celular`
- `limpar lancamento duplicado de internet`

Confirmacao obrigatoria. Se recorrente ou parcelado, perguntar:

- somente este lancamento;
- este e os proximos;
- toda a serie.

#### Filtros e visualizacao

| Comando | Campo alterado |
| --- | --- |
| `buscar mercado` | `searchQuery` |
| `mostrar receitas` | `filterType = income` |
| `mostrar despesas` | `filterType = expense` |
| `mostrar todos` | limpa filtro de tipo/status |
| `mostrar pendentes` | `filterStatus = pending` |
| `mostrar concluidos` | `filterStatus = completed` |
| `filtrar categoria alimentacao` | `filterCategoryId` |
| `limpar filtros` | limpa busca, tipo, status e categoria |
| `mes anterior` / `proximo mes` | muda `selectedMonth` |
| `mudar ciclo para dia 5` | `settings.cycleStartDay = 5` |

## Categorias

Fonte: `src/stores/financeStore.ts`.

### Entidade `categories`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `name` | texto | nome, categoria | criar, renomear, buscar |
| `type` | enum | receita/entrada = `income`; despesa/gasto = `expense` | criar, alterar |
| `icon` | texto | icone visual; pode inferir por nome | criar, alterar |
| `color` | hex | cor, cor da categoria | criar, alterar |
| `budgetLimit` | numero opcional | limite, teto, meta mensal | criar, alterar |

Exemplos:

- `criar categoria pets como despesa`
- `criar categoria bonus como receita`
- `renomear categoria lazer para diversao`
- `mudar cor da categoria transporte para amarelo`
- `definir limite de alimentacao em 800 reais`
- `excluir categoria pets`

Regra: excluir categoria exige confirmacao e estrategia para transacoes existentes.

## Orcamentos

Fonte: `budgets` e `setBudget/removeBudget`.

### Entidade `budgets`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `categoryId` | categoria | categoria existente | criar, alterar, remover |
| `limit` / `limit_amount` | numero positivo | limite, teto, orcamento, meta de gasto | criar, alterar |
| `period` | enum | mensal, semanal; hoje a store usa mensal | criar futuro |
| `spent` | calculado | gasto, usado | leitura |

Exemplos:

- `definir orcamento de alimentacao em 800 reais`
- `mudar limite de transporte para 300 reais`
- `remover orcamento de lazer`
- `mostrar categorias estouradas`

## Lista de compras

Fontes: `src/pages/ShoppingList.tsx`, `src/types/shopping.ts`. Persistencia atual: `localStorage`.

### Entidade `shopping_items`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `name` | texto | item, produto, nome | criar, renomear, buscar |
| `quantity` | numero positivo | quantidade, qtd, unidades | criar, alterar |
| `unit` | texto | un, unidade, unidades, kg, quilo, quilos, pacote, pacotes, l, litro, litros, caixa, garrafa | criar, alterar |
| `estimatedPrice` | numero >= 0 | preco, valor, custo, previsto, cada | criar, alterar |
| `checked` | boolean | comprado, concluido, marcado | marcar, desmarcar |
| `createdAt` | data | interno | leitura |
| `updatedAt` | data | interno | leitura |

#### Criar item

Exemplos:

- `adicionar arroz dois pacotes por 18 reais`
- `colocar leite 3 unidades na lista`
- `adicionar carne 2 quilos por 60 reais`
- `adicionar cafe sem valor`

#### Atualizar, marcar e excluir

Exemplos:

- `marcar arroz como comprado`
- `desmarcar leite`
- `alterar arroz para 25 reais`
- `mudar quantidade de leite para 4 unidades`
- `trocar unidade de carne para quilo`
- `renomear acucar para acucar cristal`
- `remover arroz da lista`
- `limpar itens comprados`
- `limpar lista`

Regras:

- `limpar lista` e exclusoes multiplas exigem confirmacao.
- Item ambiguo abre escolha.
- A soma exibida usa `quantity * estimatedPrice`.

## Festometro

Fonte: `src/pages/Leisure.tsx`, tabelas `events`, `event_items`, `event_participants`.

### Abas internas

| Estado | Valores | Comandos |
| --- | --- | --- |
| `viewMode` | `events`, `calculator` | `abrir eventos`, `abrir calculadora`, `calcular festa` |
| `selectedEvent` | evento atual | `abrir churrasco`, `selecionar aniversario` |
| `showParticipantsList` | boolean | `mostrar participantes`, `esconder participantes` |
| `showItemsList` | boolean | `mostrar itens`, `esconder itens` |
| `expandedEventMetric` | `people`, `budget`, `payments`, `children` | `detalhar pessoas`, `detalhar orcamento`, `detalhar pagamentos`, `detalhar criancas` |

### Entidade `events`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `name` | texto | nome, evento, festa | criar, renomear, buscar |
| `description` | texto opcional | descricao, observacao | criar, alterar |
| `eventDate` / `event_date` | data opcional | data, dia do evento | criar, alterar |
| `eventTime` | horario de formulario | horario, as 12, meio dia, 19 horas | criar via calculadora |
| `adultsCount` / `adults_count` | numero | adultos, pessoas adultas | criar, alterar, calcular |
| `childrenCount` / `children_count` | numero | criancas | criar, alterar, calcular |
| `childrenPercentage` / `children_percentage` | 0-100 | crianca paga X por cento, peso da crianca | alterar, recalcular |
| `totalBudget` / `total_budget` | numero | orcamento, total, custo | criar, alterar, recalcular |
| `createdBy` | id | interno | leitura |
| `workspaceId` | id | workspace atual | interno |

Exemplos:

- `criar evento churrasco sabado`
- `criar aniversario para 20 pessoas`
- `criar festa com orcamento de 500 reais`
- `renomear evento churrasco para churrasco familia`
- `mudar data do churrasco para domingo`
- `alterar orcamento do churrasco para 700 reais`
- `excluir evento churrasco`

Regras:

- Precisa de `currentWorkspace`.
- Criacao/edicao exige `canEdit`.
- Exclusao de um ou varios eventos exige confirmacao.
- Se `createFinancialExpense` estiver ativo, criar despesa financeira deve ter confirmacao visual.

### Calculadora do Festometro

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `eventType` | enum | churrasco=`bbq`, pizza, festa=`party`, aniversario=`birthday`, happy hour, almoco/jantar=`dinner`, viagem=`trip`, empresa=`corporate`, cha/evento=`shower`, personalizado=`custom` | definir, calcular |
| `duration` | enum | 4 horas, 6 horas, 8 horas ou mais | definir |
| `consumptionMode` | enum | economico, padrao, generoso | definir |
| `adultsCount` | numero | adultos | definir |
| `childrenCount` | numero | criancas | definir |
| `childrenPercentage` | 0-100 | percentual infantil | definir |
| `eventName` | texto | nome do evento | definir |
| `eventDate` | data | data | definir |
| `eventTime` | horario | horario | definir |
| `addToCalendar` | boolean | adicionar ao Google Agenda | ativar/desativar |
| `createFinancialExpense` | boolean | criar despesa no financeiro | ativar/desativar |
| `calculatedItems` | lista | itens sugeridos | calcular, ajustar, remover |

Exemplos:

- `calcular churrasco para 10 adultos e 5 criancas`
- `modo generoso`
- `duracao 6 horas`
- `crianca paga cinquenta por cento`
- `adicionar ao calendario`
- `nao criar despesa no financeiro`
- `salvar evento`

### Entidade `event_items`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `name` | texto | item, produto | criar, renomear, buscar |
| `quantity` | numero | quantidade, qtd | criar, alterar |
| `unitPrice` / `unit_price` | numero | preco unitario, valor, cada | criar, alterar |
| `category` | enum/texto | carnes, bebidas, acompanhamentos, outros | criar, alterar, filtrar |
| `eventId` | id | evento selecionado ou mencionado | interno |

Exemplos:

- `adicionar carne 3 quilos no churrasco`
- `adicionar gelo 2 pacotes de 12 reais`
- `mudar cerveja para 24 unidades`
- `alterar preco da carne para 50 reais`
- `marcar gelo como comprado` ainda nao existe campo no banco; precisa campo futuro.
- `remover pao de alho`

Regra: toda alteracao em item recalcula `totalBudget` e rateio dos participantes.

### Entidade `event_participants`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `name` | texto | participante, pessoa, nome | criar, renomear, buscar |
| `email` | email opcional | email, e-mail; ditado com arroba/ponto | criar, alterar, convidar |
| `isChild` / `is_child` | boolean | crianca, infantil, adulto | criar, alterar |
| `paid` | boolean | pago, acertou, pendente | marcar, desmarcar |
| `amountDue` / `amount_due` | numero calculado | valor devido, parte, cota | recalcular, leitura |
| `eventId` | id | evento selecionado ou mencionado | interno |

Exemplos:

- `adicionar Ana no churrasco`
- `adicionar Joao adulto com email joao arroba exemplo ponto com`
- `adicionar Bia como crianca`
- `marcar Ana como paga`
- `marcar Joao como pendente`
- `mudar Ana para crianca`
- `remover Joao do evento`
- `enviar convite para Ana`

Regra: ao adicionar/remover/alterar adulto/crianca, recalcular cotas.

## Metas

Fonte: `src/pages/Budgets.tsx`, tabela `purchase_goals`. A aba existe no desktop e fica oculta na nav mobile atual.

### Entidade `purchase_goals`

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `title` | texto | meta, objetivo, compra, desejo | criar, renomear, buscar |
| `category` | texto opcional | categoria, tipo | criar, alterar |
| `target_amount` | numero positivo | valor alvo, meta, objetivo, preco | criar, alterar |
| `current_amount` | numero >= 0 | guardado, economizado, saldo da meta | criar, aportar, alterar |
| `monthly_target` | numero opcional | guardar por mes, aporte mensal | criar, alterar |
| `target_date` | data opcional | prazo, ate, data alvo | criar, alterar |
| `notes` | texto opcional | observacao, nota | criar, alterar |
| `priority` | enum | baixa=`low`, media=`medium`, alta=`high` | criar, alterar, filtrar |
| `status` | enum | ativa=`active`, pausada=`paused`, concluida=`completed` | marcar, pausar, reativar, concluir |

Exemplos:

- `criar meta viagem de 3000 reais ate dezembro`
- `criar meta celular 1500 reais prioridade alta`
- `adicionar 200 reais na meta viagem`
- `mudar aporte mensal da viagem para 300 reais`
- `alterar meta viagem para 3500 reais`
- `pausar meta celular`
- `reativar meta celular`
- `concluir meta viagem`
- `excluir meta celular`

Regra: como a nav mobile oculta metas, comandos de meta devem ou navegar para `/budgets` com aviso ou ficar atras de feature flag mobile.

## Analytics / Dashboard

Fonte: `src/pages/Analytics.tsx`.

### Campos de filtro

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `startDate` | data | inicio, de, desde | filtrar |
| `endDate` | data | fim, ate | filtrar |
| `typeFilter` | enum | todos, receitas, despesas | filtrar |
| `statusFilter` | enum | todos, pendentes, concluidos | filtrar |
| `categoryFilter` | categoria | categoria existente | filtrar |

Exemplos:

- `mostrar dashboard de janeiro`
- `mostrar receitas concluidas`
- `filtrar despesas pendentes`
- `filtrar categoria alimentacao`
- `mostrar de primeiro de janeiro ate trinta e um de janeiro`
- `limpar filtros do dashboard`

## Configuracoes

Fontes: `src/pages/Settings.tsx`, `useTheme`, `useFinanceStore`, `useWorkspace`.

### Perfil e preferencias

| Campo | Tipo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `display_name` | texto | nome, nome de exibicao, perfil | alterar |
| `email` | email | email do perfil | leitura |
| `theme` | enum | claro, escuro, sistema | alterar |
| `cycleStartDay` | 1-31 | ciclo, vencimento do ciclo, fechamento | alterar |
| `currency` | texto | moeda; hoje BRL | futuro |
| `locale` | texto | idioma/regiao; hoje pt-BR | futuro |
| `notificationsEnabled` | boolean | notificacoes, lembretes | ativar/desativar |

Exemplos:

- `mudar tema para escuro`
- `mudar tema para claro`
- `usar tema do sistema`
- `mudar ciclo para dia 5`
- `ativar notificacoes`
- `desativar notificacoes`
- `editar meu perfil`

### Dados

| Acao | Comando | Risco |
| --- | --- | --- |
| Exportar JSON | `exportar dados`, `baixar backup` | medio |
| Exportar CSV | `exportar csv`, `baixar planilha` | medio |
| Baixar modelo | `baixar modelo de importacao` | baixo |
| Importar | `importar dados` | alto |
| Limpar dados | `limpar todos os dados`, `excluir dados do workspace` | alto |

Regras:

- Importacao por voz deve apenas abrir seletor/instrucao; nao pode escolher arquivo sem acao do usuario.
- Limpeza exige digitacao ou confirmacao forte do nome do workspace/escopo.

## Workspace

Fontes: `src/pages/Settings.tsx`, `src/hooks/useWorkspace.tsx`, tabelas `workspaces`, `workspace_members`, `workspace_invitations`.

### Entidades e campos

| Entidade | Campo | Valores e aliases | Comandos |
| --- | --- | --- | --- |
| `workspaces` | `name` | nome do espaco, workspace, equipe | renomear |
| `workspace_members` | `role` | owner/proprietario, editor, viewer/visualizador | alterar futuro |
| `workspace_invitations` | `email` | email convidado | convidar |
| `workspace_invitations` | `role` | editor, visualizador | convidar |

Exemplos:

- `renomear workspace para Familia`
- `convidar maria arroba exemplo ponto com como editora`
- `convidar joao arroba exemplo ponto com como visualizador`
- `abrir modal de convite`

Regras:

- Convite exige confirmacao.
- Alterar permissao/remover membro deve ser implementado somente se a UI e API estiverem prontas.
- Apenas proprietario gerencia workspace; editor pode convidar conforme regras atuais do hook/SQL se permitido.

## Comandos de formulario

Em qualquer modal com rascunho aberto:

| Comando | Resultado |
| --- | --- |
| `salvar` / `confirmar` | Executa submit se valido. |
| `cancelar` / `fechar` | Fecha modal se nao estiver salvando. |
| `limpar formulario` | Reseta campos com confirmacao se houver dados. |
| `mudar valor para 100 reais` | Atualiza campo monetario ativo ou inferido. |
| `mudar nome para X` | Atualiza `title`, `name` ou `eventName` conforme contexto. |
| `mudar data para amanha` | Atualiza campo de data do formulario ativo. |
| `marcar como pago/comprado/concluido` | Atualiza status do item/form ativo. |

## Resolucao de ambiguidade

Pontuar candidatos por:

- similaridade entre termo falado e `title/name`;
- entidade do modulo atual;
- itens visiveis na tela;
- data mais proxima do periodo selecionado;
- valor mencionado;
- categoria mencionada;
- status mencionado.

Fluxo:

1. Se houver 1 candidato com alta confianca, mostrar resumo e executar se risco baixo.
2. Se houver 2-5 candidatos, abrir escolha visual.
3. Se houver mais de 5, pedir mais detalhe: valor, data, categoria ou evento.
4. Se risco medio/alto, sempre pedir confirmacao explicita.

## Ordem de implementacao recomendada

1. Expandir `ParsedVoiceCommand` para o `VoiceIntent` generico.
2. Criar `voiceCommandResolver` para transacoes e lista de compras.
3. Criar `VoiceCommandConfirmSheet` compartilhado.
4. Lista de compras: marcar/desmarcar, alterar quantidade/preco/unidade, remover, limpar comprados.
5. Financas: marcar pago/pendente, alterar valor/data/categoria, excluir com escopo.
6. Financas: datas naturais, categoria por voz, recorrencia semanal/mensal/anual, fim por data/ocorrencias.
7. Navegacao global por voz.
8. Festometro: calculadora, criar evento, adicionar participante, adicionar item.
9. Festometro: editar/remover participante e item com recalculo.
10. Configuracoes seguras: tema, notificacoes, ciclo, exportacao.
11. Metas e analytics quando forem priorizadas para mobile.

## Checklist de cobertura

- [x] Rotas e abas principais mapeadas.
- [x] Financas: criacao, edicao, exclusao, filtros e recorrencia.
- [x] Categorias e orcamentos.
- [x] Lista de compras.
- [x] Festometro: eventos, calculadora, itens, participantes.
- [x] Metas.
- [x] Analytics.
- [x] Configuracoes, perfil e workspace.
- [x] Regras de confirmacao, escopo e ambiguidade.
