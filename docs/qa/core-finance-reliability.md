# QA - Confiabilidade do núcleo financeiro

Use este roteiro antes de liberar mudanças em CRUD financeiro, recorrências, workspace, importação/exportação ou cálculos de balanço.

## Preparação

- Usar um usuário de teste com acesso ao app.
- Validar primeiro no contexto pessoal e depois em um workspace compartilhado.
- Após cada mutação crítica, recarregar a página e conferir se o estado persistiu.
- Registrar qualquer divergência com: ação executada, escopo escolhido, mês ativo, ids/títulos afetados e resultado observado.

## CRUD básico

### Criar receita

Given o usuário está autenticado e em um mês sem receita nova,  
When cadastra uma receita com valor, categoria, data e status,  
Then a receita aparece na lista, o balanço reflete o valor e o dado permanece após reload.

### Criar despesa

Given o usuário está autenticado e em um mês sem despesa nova,  
When cadastra uma despesa com valor, categoria, data e status,  
Then a despesa aparece na lista, o balanço reflete o valor e o dado permanece após reload.

### Atualizar lançamento

Given existe uma receita ou despesa cadastrada,  
When o usuário altera valor, categoria, data ou status,  
Then a lista e o balanço usam os dados atualizados após a sincronização e após reload.

### Excluir lançamento

Given existe uma receita ou despesa contabilizada no mês,  
When o usuário exclui o lançamento,  
Then o item desaparece da lista, deixa de compor o balanço e não volta após reload.

## Recorrências e parcelas

### Editar apenas uma ocorrência

Given existe uma série recorrente com pelo menos 5 lançamentos,  
When o usuário edita o 3º lançamento e escolhe "Apenas este",  
Then somente o 3º lançamento muda e os demais permanecem iguais após reload.

### Editar este e os próximos

Given existe uma série recorrente com pelo menos 5 lançamentos,  
When o usuário edita o 3º lançamento e escolhe "Este e os próximos",  
Then os lançamentos 3, 4 e 5 mudam, os lançamentos 1 e 2 permanecem iguais e as datas futuras preservam o intervalo esperado.

### Editar todos da série

Given existe uma série recorrente com pelo menos 5 lançamentos,  
When o usuário edita qualquer lançamento e escolhe "Todos da série",  
Then todos os lançamentos relacionados mudam e permanecem consistentes após reload.

### Excluir apenas uma ocorrência

Given existe uma série recorrente contabilizada no mês,  
When o usuário exclui uma ocorrência e escolhe "Excluir apenas este",  
Then somente aquela ocorrência desaparece e deixa de compor o balanço.

### Excluir este e os próximos

Given existe uma série recorrente com lançamentos futuros,  
When o usuário escolhe "Este e os próximos",  
Then o lançamento selecionado e os futuros desaparecem; os anteriores continuam visíveis e contabilizados.

### Excluir todos da série

Given existe uma série recorrente com lançamentos em vários meses,  
When o usuário escolhe "Excluir todos da série",  
Then todos os lançamentos relacionados desaparecem e deixam de afetar balanços em todos os meses.

## Balanço e leitura financeira

### Totais gerais e concluídos

Given existem receitas e despesas pendentes e concluídas,  
When o usuário visualiza Dashboard e Transactions,  
Then os totais gerais, concluídos, pendentes e saldo exibem valores coerentes com os lançamentos visíveis.

### Item removido não contabiliza

Given uma despesa foi excluída e a página foi recarregada,  
When o usuário revisa o balanço do mês,  
Then a despesa excluída não aparece em despesa total, saldo, pendências ou agrupamentos.

## Workspace

### Criar em workspace ativo

Given o usuário está em um workspace compartilhado,  
When cadastra uma receita ou despesa,  
Then o lançamento aparece para aquele workspace e não aparece no contexto pessoal após alternar de contexto.

### Excluir em workspace ativo

Given existe um lançamento em workspace compartilhado,  
When o usuário exclui o lançamento,  
Then o lançamento desaparece apenas daquele workspace e não altera dados pessoais.

## Falhas esperadas

### Id inexistente ou alvo vazio

Given uma ação tenta operar sobre um lançamento inexistente ou lista vazia,  
When a mutação é executada,  
Then o app não deve enviar operação destrutiva e deve orientar que nenhum lançamento válido foi encontrado.

### Divergência de quantidade afetada

Given o app espera alterar ou excluir uma lista específica de ids,  
When o backend retorna quantidade ou ids diferentes do esperado,  
Then o app deve mostrar erro, não mostrar sucesso e orientar recarregar/tentar novamente.

### Falha de permissão ou sincronização

Given o usuário não tem permissão ou a sincronização falha,  
When tenta criar, editar ou excluir,  
Then o app deve exibir mensagem acionável e preservar o estado anterior até nova sincronização confiável.
