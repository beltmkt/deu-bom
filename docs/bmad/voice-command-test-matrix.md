# Matriz de testes de comandos de voz

Esta matriz define casos de aceite em Given/When/Then. Ela nao substitui o mapa operacional; serve para validar implementacoes por fase.

## Financas

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Criar despesa simples | Usuario esta em Financas | Fala `adicionar despesa mercado de 45 reais` | Aparece rascunho com tipo despesa, titulo mercado, valor 45 e status pendente. |
| Criar receita | Usuario esta em Financas | Fala `lancar receita freelance 300 reais` | Aparece rascunho com tipo receita, titulo freelance e valor 300. |
| Criar parcelado | Usuario esta em Financas | Fala `geladeira 6x de 600 dia 20` | Aparece rascunho parcelado com 6 parcelas, valor da parcela 600 e dia 20. |
| Marcar pago | Ha uma despesa pendente chamada mercado | Fala `marcar mercado como pago` | O app confirma o alvo e altera status para concluido. |
| Ambiguidade | Ha dois lancamentos chamados mercado | Fala `marcar mercado como pago` | O app mostra escolha visual com os dois candidatos. |
| Excluir recorrente | Ha assinatura internet mensal | Fala `excluir internet` | O app exige confirmacao e escopo `single/future/all`. |
| Filtrar | Ha lancamentos de receita e despesa | Fala `mostrar receitas pendentes` | A tela aplica filtros de receita e pendente. |

## Lista de Compras

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Criar item | Usuario esta na Lista | Fala `adicionar arroz dois pacotes por 18 reais` | Aparece rascunho com arroz, quantidade 2, unidade pacote e preco 18. |
| Marcar comprado | Ha item arroz pendente | Fala `marcar arroz como comprado` | O item fica marcado como comprado. |
| Desmarcar | Ha item leite comprado | Fala `desmarcar leite` | O item volta para pendente. |
| Alterar quantidade | Ha item leite | Fala `mudar quantidade de leite para 4 unidades` | O item fica com quantidade 4 e unidade un. |
| Remover item | Ha item arroz | Fala `remover arroz da lista` | O app pede confirmacao antes de remover. |
| Limpar comprados | Ha itens comprados e pendentes | Fala `limpar itens comprados` | O app pede confirmacao e remove apenas comprados. |
| Limpar lista | Ha qualquer item | Fala `limpar lista` | O app pede confirmacao forte antes de apagar tudo. |

## Navegacao

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Abrir Financas | Usuario esta autenticado | Fala `abrir financas` | Navega para `/transactions`. |
| Abrir Lista | Usuario esta autenticado | Fala `abrir lista de compras` | Navega para `/shopping-list`. |
| Abrir Metas no mobile | Usuario esta no mobile | Fala `abrir metas` | Navega para `/budgets` ou avisa que a aba nao aparece na navegacao mobile. |
| Fechar modal | Modal esta aberto e nao esta salvando | Fala `fechar` | Modal fecha sem executar mutacao. |

## Festometro

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Abrir calculadora | Usuario esta no Festometro | Fala `abrir calculadora` | `viewMode` muda para calculadora. |
| Calcular evento | Usuario pode editar workspace | Fala `calcular churrasco para 10 adultos e 5 criancas` | Calculadora preenche tipo churrasco, adultos 10, criancas 5 e mostra estimativa. |
| Criar evento | Usuario pode editar workspace | Fala `criar evento churrasco sabado` | App mostra rascunho/confirmacao com nome e data inferida. |
| Adicionar participante | Evento churrasco esta selecionado | Fala `adicionar Ana como adulta` | Participante Ana e adicionada e rateio e recalculado. |
| Marcar participante pago | Ana esta no evento | Fala `marcar Ana como paga` | `paid` vira true e totais de pagamento atualizam. |
| Adicionar item | Evento churrasco esta selecionado | Fala `adicionar carne 3 quilos de 50 reais` | Item carne entra com quantidade 3 e preco unitario 50, recalculando total. |
| Remover evento | Ha evento churrasco | Fala `excluir evento churrasco` | App pede confirmacao antes de excluir. |

## Metas

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Criar meta | Usuario pode editar | Fala `criar meta viagem de 3000 reais ate dezembro` | App cria ou mostra rascunho com titulo viagem, alvo 3000 e prazo inferido. |
| Aportar | Meta viagem existe | Fala `adicionar 200 reais na meta viagem` | `current_amount` aumenta em 200 apos confirmacao. |
| Pausar | Meta celular ativa existe | Fala `pausar meta celular` | Status vira `paused`. |
| Concluir | Meta viagem existe | Fala `concluir meta viagem` | Status vira `completed` apos confirmacao. |
| Excluir | Meta celular existe | Fala `excluir meta celular` | App pede confirmacao antes de excluir. |

## Analytics

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Filtrar periodo | Usuario esta em Analytics | Fala `mostrar de primeiro de janeiro ate trinta e um de janeiro` | `startDate` e `endDate` sao aplicados. |
| Filtrar tipo | Usuario esta em Analytics | Fala `mostrar despesas concluidas` | Tipo despesa e status concluido ficam ativos. |
| Categoria | Categoria Alimentacao existe | Fala `filtrar categoria alimentacao` | Categoria correspondente fica ativa. |
| Limpar | Ha filtros ativos | Fala `limpar filtros do dashboard` | Filtros voltam ao padrao. |

## Configuracoes e Workspace

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Tema escuro | Usuario esta autenticado | Fala `mudar tema para escuro` | Tema vira dark. |
| Ciclo | Usuario esta autenticado | Fala `mudar ciclo para dia 5` | `cycleStartDay` vira 5. |
| Notificacoes | Usuario esta autenticado | Fala `desativar notificacoes` | `notificationsEnabled` vira false. |
| Exportar | Ha dados financeiros | Fala `exportar csv` | App confirma/aciona exportacao CSV. |
| Convidar | Usuario tem permissao | Fala `convidar maria arroba exemplo ponto com como editora` | App mostra confirmacao com email normalizado e papel editor. |
| Limpar dados | Usuario e owner | Fala `limpar todos os dados` | App exige confirmacao forte pelo nome do workspace/escopo. |

## Regras transversais

| Caso | Given | When | Then |
| --- | --- | --- | --- |
| Baixa confianca | Parser nao identifica campos minimos | Qualquer comando incompleto | App pede mais detalhes e nao executa. |
| Mais de 5 candidatos | Busca retorna muitos itens | Usuario usa termo generico | App pede detalhe adicional como valor, data, categoria ou evento. |
| Sem permissao | Usuario viewer tenta mutar workspace | Fala comando de criacao/edicao | App mostra erro de permissao e nao chama executor. |
| Transcript visivel | Microfone captura fala | Qualquer comando | Texto reconhecido aparece na tela antes ou durante a revisao. |
