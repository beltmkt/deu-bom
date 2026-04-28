---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
extractionStatus: confirmed
status: complete
completedAt: '2026-04-28'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
architectureDocument: not_found
---

# Deu Bom Financas sem erro - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Deu Bom Financas sem erro, decomposing the requirements from the PRD and UX Design into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Usuarios podem criar conta e acessar o app com autenticacao.
FR2: Usuarios autenticados podem acessar areas financeiras protegidas.
FR3: Usuarios podem recuperar ou redefinir acesso quando necessario.
FR4: Usuarios podem editar informacoes basicas do proprio perfil.
FR5: O sistema pode impedir acesso nao autenticado a dados financeiros.
FR6: Usuarios podem cadastrar receitas.
FR7: Usuarios podem cadastrar despesas.
FR8: Usuarios podem atualizar receitas existentes.
FR9: Usuarios podem atualizar despesas existentes.
FR10: Usuarios podem excluir receitas existentes.
FR11: Usuarios podem excluir despesas existentes.
FR12: Usuarios podem classificar receitas e despesas por categoria.
FR13: Usuarios podem definir data, valor, descricao, status e observacoes em lancamentos financeiros.
FR14: Usuarios podem visualizar feedback de sucesso ou erro apos acoes financeiras criticas.
FR15: Usuarios podem criar lancamentos recorrentes.
FR16: Usuarios podem criar lancamentos parcelados.
FR17: Usuarios podem visualizar recorrencias e parcelas nos meses correspondentes.
FR18: Usuarios podem editar uma unica ocorrencia de uma serie.
FR19: Usuarios podem editar ocorrencias futuras de uma serie.
FR20: Usuarios podem editar uma serie inteira.
FR21: Usuarios podem excluir uma unica ocorrencia de uma serie.
FR22: Usuarios podem excluir ocorrencias futuras de uma serie.
FR23: Usuarios podem excluir uma serie inteira.
FR24: O sistema pode explicar o impacto de alteracoes ou exclusoes em series antes da confirmacao.
FR25: Usuarios podem visualizar o balanco mensal com receitas, despesas e saldo.
FR26: Usuarios podem identificar se o mes esta positivo ou negativo.
FR27: Usuarios podem visualizar valores pendentes e concluidos.
FR28: Usuarios podem navegar entre meses financeiros.
FR29: Usuarios podem visualizar lancamentos recentes.
FR30: Usuarios podem entender quais dados compoem os totais exibidos.
FR31: Usuarios podem visualizar categorias ou agrupamentos que expliquem a composicao dos gastos.
FR32: O sistema pode apresentar estados vazios orientativos quando nao houver dados suficientes.
FR33: Usuarios podem criar orcamentos por categoria.
FR34: Usuarios podem atualizar orcamentos existentes.
FR35: Usuarios podem remover orcamentos existentes.
FR36: Usuarios podem comparar gastos realizados com limites definidos.
FR37: Usuarios podem visualizar sinais de estouro ou proximidade do limite de orcamento.
FR38: Usuarios podem acompanhar metas ou objetivos financeiros simples quando disponiveis.
FR39: Usuarios podem criar ou acessar um workspace financeiro.
FR40: Usuarios podem alternar entre contexto pessoal e contexto compartilhado quando aplicavel.
FR41: Usuarios podem convidar outras pessoas para um workspace.
FR42: Usuarios convidados podem aceitar convite para participar de um workspace.
FR43: Usuarios podem visualizar qual workspace esta ativo.
FR44: O sistema pode separar dados financeiros por usuario e workspace.
FR45: O sistema pode aplicar permissoes diferentes para leitura, edicao e administracao.
FR46: Administradores de workspace podem gerenciar informacoes basicas do workspace.
FR47: Usuarios podem exportar dados financeiros.
FR48: Usuarios podem importar dados financeiros.
FR49: O sistema pode validar dados importados antes de alterar registros existentes.
FR50: Usuarios podem limpar ou remover dados de um contexto com confirmacao explicita.
FR51: O sistema pode preservar consistencia dos calculos apos importacao, exclusao ou limpeza de dados.
FR52: O sistema pode orientar usuarios sobre o primeiro passo para comecar do zero.
FR53: O sistema pode explicar termos financeiros e estados principais em linguagem simples.
FR54: O sistema pode indicar quando dados estao incompletos para uma leitura confiavel.
FR55: O sistema pode apresentar mensagens de erro acionaveis.
FR56: O sistema pode orientar o usuario sobre o que fazer com dinheiro restante em versoes futuras.
FR57: O sistema pode apresentar conteudo educativo publico em versoes futuras.
FR58: Visitantes podem acessar paginas publicas sobre o produto.
FR59: Visitantes podem entender a proposta de valor antes de criar conta.
FR60: O sistema pode expor metadados publicos adequados para buscadores e compartilhamento social.
FR61: O sistema pode publicar conteudo educativo indexavel sobre financas pessoais.
FR62: Visitantes podem acessar FAQ, guias ou paginas informativas em versoes futuras.
FR63: Dados financeiros autenticados nao podem aparecer em paginas publicas.
FR64: O sistema pode suportar checklist de QA para fluxos financeiros criticos.
FR65: O sistema pode ser validado quanto a cadastro, atualizacao, exclusao, recorrencias, workspace e balanco.
FR66: Usuarios podem perceber quando uma acao falhou e o que fazer em seguida.
FR67: O sistema pode manter dados consistentes apos recarregamento.
FR68: O sistema pode evitar que dados apagados continuem influenciando calculos.
FR69: O sistema pode ser revisado em diferentes tamanhos de tela e navegadores.
FR70: Usuarios novos podem receber orientacao inicial sobre quais dados cadastrar primeiro.
FR71: Usuarios novos podem entender a diferenca entre receita, despesa, recorrencia, parcela, orcamento e saldo.
FR72: Usuarios podem visualizar um primeiro balanco util apos cadastrar dados financeiros minimos.
FR73: O sistema pode indicar quais dados ainda faltam para melhorar a confiabilidade da leitura mensal.
FR74: Usuarios podem ver quais lancamentos compoem um total financeiro exibido.
FR75: Usuarios podem identificar quando um valor inclui lancamentos recorrentes, parcelados, pendentes ou concluidos.
FR76: O sistema pode alertar quando uma visualizacao financeira estiver incompleta ou desatualizada.
FR77: O sistema pode mostrar o efeito esperado de uma alteracao antes de confirmar acoes criticas.
FR78: Usuarios podem receber orientacao sobre como resolver falhas em acoes financeiras.
FR79: O sistema pode diferenciar falha de conexao, falha de permissao, falha de validacao e falha inesperada.
FR80: Administradores ou usuarios autorizados podem revisar acoes criticas recentes quando necessario.
FR81: O sistema pode impedir operacoes destrutivas sem confirmacao explicita.
FR82: O sistema pode preservar rastreabilidade suficiente para investigar inconsistencias de dados.
FR83: Usuarios podem identificar claramente se estao no contexto pessoal, familiar, de equipe ou empresa.
FR84: O sistema pode alertar quando uma acao sera aplicada a um workspace compartilhado.
FR85: Usuarios podem compreender seu nivel de permissao dentro de um workspace.
FR86: O sistema pode bloquear acoes incompativeis com a permissao do usuario.
FR87: Visitantes podem acessar uma pagina publica otimizada para entender o problema que o Deu Bom resolve.
FR88: Visitantes podem iniciar cadastro ou login a partir das paginas publicas.
FR89: O sistema pode apresentar conteudo publico sem exigir autenticacao.
FR90: O sistema pode manter separacao entre conteudo educativo publico e dados financeiros privados.
FR91: O sistema pode oferecer chamadas claras para conversao em paginas publicas.
FR92: O sistema pode ser validado por checklist de QA antes de liberar mudancas em fluxos financeiros.
FR93: O sistema pode ser validado em cenarios de recorrencia, parcela, exclusao, atualizacao, reload e workspace.
FR94: O sistema pode ser validado em navegadores e tamanhos de tela prioritarios.
FR95: O sistema pode registrar ou documentar resultados de validacoes criticas.
FR96: Usuarios podem distinguir receitas/despesas planejadas, pendentes e efetivamente concluidas quando esses estados forem usados nos calculos.
FR97: O sistema pode indicar quando uma recomendacao financeira e educativa e nao substitui aconselhamento profissional.
FR98: Usuarios podem compreender o impacto de importacoes, limpezas ou exclusoes em massa antes da confirmacao.

### NonFunctional Requirements

NFR1: O app deve abrir e permitir interacao inicial sem sensacao de lentidao em conexoes comuns de mobile e desktop.
NFR2: Trocas de mes, filtros e navegacao entre abas principais nao devem causar travamentos perceptiveis.
NFR3: Cadastro, atualizacao e exclusao de transacoes devem fornecer feedback visual imediato e concluir em poucos segundos em condicoes normais.
NFR4: Dashboard, Transactions, Budgets, Analytics, Settings e Festometro devem permanecer utilizaveis com volume crescente de transacoes.
NFR5: O build de producao deve ser monitorado para evitar crescimento excessivo de bundle e degradacao da experiencia inicial.
NFR6: O PWA nao deve apresentar conteudo antigo de forma confusa apos atualizacao de versao.
NFR7: Dados financeiros devem ficar acessiveis apenas a usuarios autenticados e autorizados.
NFR8: Dados de workspace devem ser isolados por contexto e permissao.
NFR9: Rotas financeiras devem permanecer protegidas contra acesso nao autenticado.
NFR10: Paginas publicas e metadados indexaveis nao devem expor dados financeiros privados.
NFR11: Operacoes destrutivas devem exigir confirmacao explicita.
NFR12: Recomendacoes financeiras futuras devem usar linguagem educativa e nao prometer retorno, investimento ou aconselhamento profissional.
NFR13: Dados importados devem ser validados antes de alterar registros persistidos.
NFR14: Apos criar, editar ou excluir dados financeiros, o estado exibido deve refletir o estado persistido.
NFR15: Dados excluidos nao devem continuar influenciando balancos, saldos ou relatorios.
NFR16: Recorrencias e parcelas devem preservar datas, valores, escopo e relacionamento entre itens da serie.
NFR17: Reload do app nao deve restaurar dados ja excluidos ou desfazer alteracoes concluidas.
NFR18: Falhas de conexao, permissao, validacao e erro inesperado devem produzir mensagens distinguiveis e acionaveis.
NFR19: Fluxos criticos devem ser cobertos por checklist de QA antes de mudancas relevantes serem liberadas.
NFR20: O sistema deve manter rastreabilidade suficiente para investigar inconsistencias em dados criticos.
NFR21: O produto deve mirar WCAG como referencia formal de acessibilidade, com evolucao progressiva.
NFR22: Textos, icones, botoes e estados devem manter contraste adequado.
NFR23: Formularios financeiros devem ter labels compreensiveis.
NFR24: Estados de erro e sucesso devem ser comunicados por texto, nao apenas por cor.
NFR25: Fluxos principais devem ser utilizaveis por teclado em nivel funcional.
NFR26: Botoes e areas de toque devem ter tamanho adequado para uso em mobile.
NFR27: Animacoes nao devem prejudicar leitura, foco ou conclusao de tarefas.
NFR28: A arquitetura deve suportar crescimento gradual de usuarios, workspaces e volume de transacoes sem exigir reescrita imediata.
NFR29: Listagens e calculos devem considerar aumento progressivo de dados financeiros por usuario.
NFR30: A estrategia publica de SEO deve ser separada do app autenticado para permitir crescimento de aquisicao sem comprometer dados privados.
NFR31: Funcionalidades premium ou futuras devem ser planejadas sem quebrar o nucleo gratuito/confiavel do app.
NFR32: Paginas publicas devem ter title, description e metadados sociais adequados.
NFR33: Conteudo publico deve usar linguagem proxima do publico-alvo e termos pesquisaveis.
NFR34: A experiencia publica deve comunicar rapidamente o problema resolvido e direcionar visitantes para cadastro ou login.
NFR35: SEO publico deve ser medido separadamente da experiencia autenticada.
NFR36: Supabase deve permanecer fonte persistente confiavel para dados financeiros e workspace.
NFR37: Integracoes futuras nao devem alterar dados financeiros sem validacao explicita.
NFR38: Importacao/exportacao deve preservar consistencia de categorias, transacoes, recorrencias e workspace.
NFR39: Operacoes em contexto compartilhado devem respeitar o workspace ativo.
NFR40: Qualquer cache, PWA ou estado local deve ser invalidado ou atualizado quando puder deixar dados financeiros defasados.

### Additional Requirements

- Documento de arquitetura formal nao foi encontrado em `_bmad-output/planning-artifacts`; epicos devem tratar arquitetura como pendencia ou usar contexto existente do projeto.
- Manter o app como web app/PWA autenticado com React, Vite, TypeScript, Supabase, Zustand, React Query, Tailwind e componentes reutilizaveis.
- Proteger rotas financeiras e separar paginas publicas indexaveis do app autenticado.
- Supabase deve seguir como fonte persistente de autenticacao, dados financeiros e workspace.
- `financeStore` deve seguir concentrando operacoes principais de transacoes, categorias, budgets e settings.
- Mutacoes financeiras criticas devem revalidar o estado persistido apos criar, editar, excluir, importar, limpar, pagar ou receber.
- Integracoes futuras de calendario, relatorio, pagamento, investimento ou email nao podem alterar dados financeiros sem validacao explicita.
- Lint, build e QA devem ser ajustados para validar arquivos relevantes do app e fluxos criticos.
- SEO publico deve ser planejado sem expor dados financeiros autenticados.

### UX Design Requirements

UX-DR1: Corrigir ou prevenir mojibake em textos visiveis nas rotas Inicio, Financas, Metas, Dashboard/Relatorios, Festometro e Config.
UX-DR2: Garantir que cada tela principal tenha papel claro: Inicio orienta, Financas opera, Dashboard analisa, Metas direciona, Festometro planeja eventos, Config gerencia conta/workspace.
UX-DR3: Reorganizar Inicio como guia diario do mes, com resumo, proximas acoes e poucos indicadores.
UX-DR4: Reorganizar Financas como central operacional em kanban, com cards compactos, status claro e acoes rapidas.
UX-DR5: Reorganizar Festometro para exibir eventos em cards e revelar detalhes apenas ao abrir um evento.
UX-DR6: Implementar ou consolidar `FinancialTransactionCard` com descricao, valor, categoria, vencimento, status, recorrencia/parcela, acoes rapidas e estados de erro/salvando.
UX-DR7: Implementar ou consolidar `FinanceKanbanBoard` com drag desktop e alternativa por menu/acao no mobile.
UX-DR8: Implementar `RecurrenceScopeModal` para escolher somente este, este e proximos ou todos em edicao, exclusao, pagamento/recebimento e movimentacao de series.
UX-DR9: Implementar `ProgressiveTransactionForm` com campos essenciais primeiro e recorrencia/parcela/vencimento como opcoes progressivas.
UX-DR10: Implementar `MonthNavigator` com mes atual, anterior, proximo e retorno para mes atual sem perder contexto financeiro.
UX-DR11: Implementar ou consolidar `EventCard` para Festometro com nome, data, tipo, total estimado, participantes, status e acoes.
UX-DR12: Implementar `CollapsibleDetailSection` para macro primeiro e micro ao clicar, com `aria-expanded`.
UX-DR13: Criar filtros compactos e recolhiveis, principalmente no mobile, com indicacao de filtro ativo e limpar filtros.
UX-DR14: Usar bottom sheets no mobile para formularios longos, criacao/edicao e acoes que nao exigem modal critico.
UX-DR15: Reservar modais para confirmacoes, escopo de recorrencia/parcela, exclusao, convite, erro critico e criacao/edicao de evento quando necessario.
UX-DR16: Padronizar botoes primarios, secundarios, destrutivos e icon buttons sem mudanca de tamanho em hover ou clique.
UX-DR17: Padronizar feedbacks de sucesso, erro, alerta, informacao, salvando, salvo e erro ao salvar.
UX-DR18: Garantir que formularios tenham labels explicitos, validacao proxima ao campo e mensagens de erro em linguagem simples.
UX-DR19: Substituir sliders para numeros importantes por seletores ou inputs editaveis.
UX-DR20: Fazer vencimento opcional com explicacao clara e tratamento seguro para dias 29, 30 e 31 em meses curtos.
UX-DR21: Mostrar numeros financeiros com contexto de origem, periodo, status, escopo, filtro ativo ou sincronizacao.
UX-DR22: Garantir que recorrencias e parcelas mostrem impacto no mes atual e nos proximos antes de acoes criticas.
UX-DR23: Evitar cards grandes demais no mobile e priorizar conteudo principal antes de controles secundarios.
UX-DR24: Manter base visual escura calma com grafite, superficies discretas, verde financeiro sem excesso, vermelho apenas para risco/destruicao e contraste forte.
UX-DR25: Usar tipografia sans-serif limpa, valores financeiros com peso moderado e textos auxiliares curtos.
UX-DR26: Aplicar espacamento base de 8px, bordas discretas e cards com raio preferencial ate 8px.
UX-DR27: Garantir que elementos nao oscilem, crescam ou mudem de tamanho de forma inesperada ao hover, clique ou salvamento.
UX-DR28: Garantir funcionamento sem overflow horizontal em 360px, 390px, 768px, 1024px e desktop amplo.
UX-DR29: Definir breakpoints mobile-first: 320-479, 480-767, 768-1023, 1024-1279 e 1280+.
UX-DR30: Mirar WCAG 2.2 AA com contraste adequado, foco visivel, navegacao por teclado, labels, areas de toque confortaveis e estados nao dependentes apenas de cor.
UX-DR31: Implementar acessibilidade de modais com foco preso, fechamento claro e nomes acessiveis.
UX-DR32: Implementar `aria-live` discreto para feedbacks de salvamento quando aplicavel.
UX-DR33: Validar UX por checklist manual ou Playwright nos fluxos Inicio, Financas, Festometro, Metas, Dashboard e Config.

### FR Coverage Map

FR1: Epic 1 - Criacao de conta e login.
FR2: Epic 1 - Acesso autenticado as areas financeiras.
FR3: Epic 1 - Recuperacao ou redefinicao de acesso.
FR4: Epic 1 - Edicao de perfil basico.
FR5: Epic 1 - Bloqueio de acesso nao autenticado.
FR6: Epic 2 - Cadastro de receitas.
FR7: Epic 2 - Cadastro de despesas.
FR8: Epic 2 - Atualizacao de receitas.
FR9: Epic 2 - Atualizacao de despesas.
FR10: Epic 2 - Exclusao de receitas.
FR11: Epic 2 - Exclusao de despesas.
FR12: Epic 2 - Classificacao por categoria.
FR13: Epic 2 - Campos essenciais de lancamento financeiro.
FR14: Epic 2 - Feedback de sucesso ou erro.
FR15: Epic 3 - Criacao de recorrencias.
FR16: Epic 3 - Criacao de parcelas.
FR17: Epic 3 - Visualizacao de recorrencias e parcelas nos meses corretos.
FR18: Epic 3 - Edicao de uma ocorrencia.
FR19: Epic 3 - Edicao de ocorrencias futuras.
FR20: Epic 3 - Edicao de serie inteira.
FR21: Epic 3 - Exclusao de uma ocorrencia.
FR22: Epic 3 - Exclusao de ocorrencias futuras.
FR23: Epic 3 - Exclusao de serie inteira.
FR24: Epic 3 - Explicacao de impacto antes da confirmacao.
FR25: Epic 4 - Balanco mensal.
FR26: Epic 4 - Identificacao de mes positivo ou negativo.
FR27: Epic 4 - Valores pendentes e concluidos.
FR28: Epic 4 - Navegacao entre meses.
FR29: Epic 4 - Lancamentos recentes.
FR30: Epic 4 - Composicao dos totais.
FR31: Epic 4 - Agrupamentos por categoria.
FR32: Epic 4 - Estados vazios orientativos.
FR33: Epic 5 - Criacao de orcamentos.
FR34: Epic 5 - Atualizacao de orcamentos.
FR35: Epic 5 - Remocao de orcamentos.
FR36: Epic 5 - Comparacao de gastos com limites.
FR37: Epic 5 - Sinais de limite.
FR38: Epic 5 - Metas financeiras simples.
FR39: Epic 6 - Criacao ou acesso a workspace.
FR40: Epic 6 - Alternancia de contexto.
FR41: Epic 6 - Convite para workspace.
FR42: Epic 6 - Aceite de convite.
FR43: Epic 6 - Workspace ativo visivel.
FR44: Epic 6 - Separacao de dados por usuario e workspace.
FR45: Epic 6 - Permissoes de leitura, edicao e administracao.
FR46: Epic 6 - Gerenciamento basico de workspace.
FR47: Epic 7 - Exportacao de dados.
FR48: Epic 7 - Importacao de dados.
FR49: Epic 7 - Validacao de importacao.
FR50: Epic 7 - Limpeza/remocao com confirmacao.
FR51: Epic 7 - Consistencia apos operacoes de dados.
FR52: Epic 4 - Orientacao de primeiro passo.
FR53: Epic 4 - Explicacao de termos financeiros.
FR54: Epic 4 - Indicacao de dados incompletos.
FR55: Epic 2 - Mensagens de erro acionaveis.
FR56: Epic 5 - Orientacao futura sobre dinheiro restante.
FR57: Epic 8 - Conteudo educativo publico futuro.
FR58: Epic 8 - Paginas publicas do produto.
FR59: Epic 8 - Proposta de valor antes da conta.
FR60: Epic 8 - Metadados publicos.
FR61: Epic 8 - Conteudo educativo indexavel.
FR62: Epic 8 - FAQ, guias ou paginas futuras.
FR63: Epic 8 - Protecao de dados financeiros fora do publico.
FR64: Epic 8 - Checklist de QA.
FR65: Epic 8 - Validacao de fluxos financeiros.
FR66: Epic 2 - Percepcao de falha e proximo passo.
FR67: Epic 3 - Consistencia apos reload.
FR68: Epic 3 - Dados apagados fora dos calculos.
FR69: Epic 8 - Revisao em telas e navegadores.
FR70: Epic 4 - Orientacao inicial de dados.
FR71: Epic 4 - Diferenciacao de conceitos financeiros.
FR72: Epic 4 - Primeiro balanco util.
FR73: Epic 4 - Dados faltantes para leitura confiavel.
FR74: Epic 4 - Lancamentos que compoem total.
FR75: Epic 4 - Identificacao de recorrentes, parcelados, pendentes e concluidos.
FR76: Epic 4 - Alerta de visualizacao incompleta ou desatualizada.
FR77: Epic 3 - Efeito esperado antes de acoes criticas.
FR78: Epic 2 - Orientacao para resolver falhas.
FR79: Epic 2 - Diferenciacao de tipos de falha.
FR80: Epic 7 - Revisao de acoes criticas recentes.
FR81: Epic 2 - Confirmacao explicita para destruicao.
FR82: Epic 7 - Rastreabilidade para inconsistencias.
FR83: Epic 6 - Identificacao de contexto pessoal/familiar/equipe/empresa.
FR84: Epic 6 - Alerta de acao em workspace compartilhado.
FR85: Epic 6 - Nivel de permissao compreensivel.
FR86: Epic 6 - Bloqueio por permissao.
FR87: Epic 8 - Pagina publica otimizada para proposta.
FR88: Epic 8 - Cadastro/login a partir de paginas publicas.
FR89: Epic 8 - Conteudo publico sem autenticacao.
FR90: Epic 8 - Separacao publico/privado.
FR91: Epic 8 - Chamadas claras para conversao.
FR92: Epic 8 - Checklist antes de mudancas.
FR93: Epic 8 - Validacao de recorrencia, parcela, exclusao, atualizacao, reload e workspace.
FR94: Epic 8 - Validacao em navegadores e telas.
FR95: Epic 8 - Registro de validacoes criticas.
FR96: Epic 3 - Distincao de estados planejado, pendente e concluido.
FR97: Epic 5 - Aviso educativo em recomendacoes financeiras.
FR98: Epic 7 - Impacto de importacoes, limpezas ou exclusoes em massa.

## Epic List

### Epic 1: Acesso Seguro e Contexto do Usuario

Usuarios conseguem entrar, recuperar acesso, proteger dados financeiros e entender o proprio perfil/contexto inicial.

**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Operacao Financeira Essencial

Usuarios conseguem cadastrar, editar, excluir, categorizar e acompanhar receitas/despesas com feedback claro.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR55, FR66, FR78, FR79, FR81

### Epic 3: Recorrencias, Parcelas e Escopo Seguro

Usuarios conseguem criar, visualizar, editar e excluir recorrencias/parcelas sem perder confianca nos meses futuros.

**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR67, FR68, FR77, FR96

### Epic 4: Leitura do Mes, Saldos e Explicabilidade

Usuarios entendem saldo, pendencias, concluidos, composicao dos totais e impacto do mes atual.

**FRs covered:** FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR52, FR53, FR54, FR70, FR71, FR72, FR73, FR74, FR75, FR76

### Epic 5: Orcamentos, Metas e Proximas Decisoes

Usuarios conseguem acompanhar limites, metas e receber orientacao simples sobre dinheiro restante.

**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38, FR56, FR97

### Epic 6: Workspace Compartilhado e Permissoes

Usuarios conseguem usar contexto pessoal, familia, equipe ou empresa com convites, permissoes e separacao de dados.

**FRs covered:** FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR46, FR83, FR84, FR85, FR86

### Epic 7: Dados, Importacao, Exportacao e Auditoria

Usuarios conseguem importar, exportar, limpar dados e preservar consistencia/rastreabilidade em acoes criticas.

**FRs covered:** FR47, FR48, FR49, FR50, FR51, FR80, FR82, FR98

### Epic 8: Aquisicao, SEO, Qualidade e Validacao Multiplataforma

Visitantes entendem o produto publicamente, usuarios acessam conteudo seguro, e o app e validado em telas/navegadores.

**FRs covered:** FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR69, FR87, FR88, FR89, FR90, FR91, FR92, FR93, FR94, FR95

### Epic 9: Festometro como Planejamento de Eventos

Usuarios conseguem planejar eventos em cards, abrir detalhes sob demanda, organizar participantes, itens e convites sem transformar a tela em formulario inchado.

**FRs covered:** UX-DR5, UX-DR11, UX-DR12, UX-DR15, UX-DR17, UX-DR23, UX-DR28, UX-DR30, UX-DR31, UX-DR32, UX-DR33

## Story Requirement Coverage

- Story 1.1: FR1
- Story 1.2: FR2, FR5
- Story 1.3: FR3
- Story 1.4: FR4
- Story 1.5: FR2, FR5
- Story 2.1: FR6, FR12, FR13, FR14
- Story 2.2: FR7, FR12, FR13, FR14
- Story 2.3: FR8, FR9, FR14
- Story 2.4: FR10, FR11, FR81
- Story 2.5: FR12
- Story 2.6: FR13, FR14
- Story 2.7: FR55, FR66, FR78, FR79
- Story 2.8: FR14, FR66
- Story 3.1: FR15, FR17
- Story 3.2: FR16, FR17
- Story 3.3: FR17, FR67, FR68
- Story 3.4: FR18, FR77
- Story 3.5: FR19, FR77
- Story 3.6: FR20, FR77
- Story 3.7: FR21, FR22, FR23, FR24, FR68, FR81
- Story 3.8: FR24, FR77
- Story 3.9: FR96
- Story 4.1: FR25, FR26
- Story 4.2: FR27, FR52, FR72
- Story 4.3: FR28
- Story 4.4: FR30, FR74, FR75
- Story 4.5: FR27, FR29, FR96
- Story 4.6: FR32, FR54, FR70, FR73
- Story 4.7: FR53, FR71
- Story 4.8: FR76
- Story 4.9: FR31
- Story 5.1: FR33
- Story 5.2: FR34, FR35
- Story 5.3: FR36, FR37
- Story 5.4: FR38
- Story 5.5: FR56, FR97
- Story 5.6: FR38, FR56
- Story 6.1: FR39, FR43
- Story 6.2: FR40, FR44, FR83, FR84
- Story 6.3: FR41, FR45
- Story 6.4: FR42
- Story 6.5: FR45, FR85, FR86
- Story 6.6: FR46
- Story 7.1: FR47
- Story 7.2: FR48, FR49
- Story 7.3: FR49, FR51
- Story 7.4: FR50, FR51, FR81
- Story 7.5: FR80, FR82
- Story 7.6: FR98
- Story 8.1: FR58, FR59, FR87, FR88, FR91
- Story 8.2: FR60, FR63, FR90
- Story 8.3: FR57, FR61, FR62, FR97
- Story 8.4: FR63, FR88, FR89, FR90
- Story 8.5: FR64, FR65, FR92, FR93, FR95
- Story 8.6: FR69, FR94
- Story 8.7: NFR21, NFR22, NFR23, NFR24, NFR25, NFR26, NFR27
- Story 8.8: FR95
- Story 9.1: UX-DR5, UX-DR11
- Story 9.2: UX-DR15, UX-DR17, UX-DR23
- Story 9.3: UX-DR12, UX-DR30, UX-DR31
- Story 9.4: UX-DR17, UX-DR32
- Story 9.5: UX-DR28, UX-DR33

## UX Design Requirement Coverage

- UX-DR1: Story 8.6, Story 8.8
- UX-DR2: Story 4.1, Story 4.2, Story 8.6
- UX-DR3: Story 4.1, Story 4.2, Story 4.6
- UX-DR4: Story 2.6, Story 4.5
- UX-DR5: Story 9.1
- UX-DR6: Story 2.6
- UX-DR7: Story 2.6, Story 3.9
- UX-DR8: Story 3.7, Story 3.8
- UX-DR9: Story 2.1, Story 2.2, Story 3.1, Story 3.2
- UX-DR10: Story 4.3
- UX-DR11: Story 9.1
- UX-DR12: Story 9.3
- UX-DR13: Story 4.4, Story 8.6
- UX-DR14: Story 2.1, Story 2.2, Story 8.6
- UX-DR15: Story 3.7, Story 3.8, Story 9.2
- UX-DR16: Story 2.6, Story 8.6
- UX-DR17: Story 2.8, Story 9.2, Story 9.4
- UX-DR18: Story 2.1, Story 2.2, Story 4.7
- UX-DR19: Story 3.2
- UX-DR20: Story 3.1
- UX-DR21: Story 4.1, Story 4.4
- UX-DR22: Story 3.8
- UX-DR23: Story 2.6, Story 9.2
- UX-DR24: Story 8.6, Story 8.7
- UX-DR25: Story 8.6, Story 8.7
- UX-DR26: Story 8.6, Story 8.7
- UX-DR27: Story 2.8, Story 8.6
- UX-DR28: Story 8.6, Story 9.5
- UX-DR29: Story 8.6
- UX-DR30: Story 8.7, Story 9.3
- UX-DR31: Story 3.7, Story 9.3
- UX-DR32: Story 2.8, Story 9.4
- UX-DR33: Story 8.5, Story 8.8, Story 9.5

## Epic 1: Acesso Seguro e Contexto do Usuario

Usuarios conseguem entrar, recuperar acesso, proteger dados financeiros e entender o proprio perfil/contexto inicial.

### Story 1.1: Criar Conta com Acesso Inicial Seguro

As a novo usuario,
I want criar uma conta e acessar o app,
So that eu possa comecar a organizar minhas financas em um ambiente protegido.

**Acceptance Criteria:**

**Given** que estou na tela publica de cadastro
**When** informo dados validos e confirmo o cadastro
**Then** minha conta e criada e sou direcionado para a area autenticada
**And** vejo uma confirmacao clara de sucesso.

**Given** que tento cadastrar com dados invalidos
**When** envio o formulario
**Then** vejo mensagens de erro proximas aos campos incorretos
**And** nenhum dado financeiro e criado.

### Story 1.2: Login em Area Financeira Protegida

As a usuario cadastrado,
I want entrar no app com minhas credenciais,
So that apenas eu ou pessoas autorizadas acessem meus dados financeiros.

**Acceptance Criteria:**

**Given** que tenho uma conta valida
**When** informo credenciais corretas
**Then** acesso a area autenticada do app
**And** minhas telas financeiras ficam disponiveis.

**Given** que nao estou autenticado
**When** tento acessar uma rota financeira protegida
**Then** sou redirecionado para login
**And** nenhum dado financeiro privado e exibido.

### Story 1.3: Recuperar ou Redefinir Acesso

As a usuario que esqueceu o acesso,
I want recuperar ou redefinir minha senha,
So that eu nao perca acesso a minha organizacao financeira.

**Acceptance Criteria:**

**Given** que estou na tela de login
**When** solicito recuperacao de acesso com email valido
**Then** recebo feedback de que as instrucoes foram enviadas
**And** a mensagem nao revela se o email existe ou nao por seguranca.

**Given** que recebo o link de recuperacao
**When** defino uma nova senha valida
**Then** consigo acessar novamente o app
**And** vejo confirmacao clara de atualizacao.

### Story 1.4: Editar Perfil Basico

As a usuario autenticado,
I want editar minhas informacoes basicas de perfil,
So that minha conta reflita meus dados atuais.

**Acceptance Criteria:**

**Given** que estou autenticado
**When** altero informacoes basicas permitidas do perfil
**Then** os dados sao salvos
**And** vejo feedback claro de sucesso.

**Given** que ocorre falha ao salvar
**When** tento atualizar meu perfil
**Then** vejo mensagem acionavel
**And** os dados anteriores permanecem preservados.

### Story 1.5: Bloquear Acesso Nao Autenticado

As a usuario do app,
I want que dados financeiros fiquem protegidos por autenticacao,
So that minhas informacoes nao sejam expostas indevidamente.

**Acceptance Criteria:**

**Given** que nao estou autenticado
**When** tento acessar Inicio, Financas, Metas, Dashboard, Festometro ou Config
**Then** sou impedido de ver dados privados
**And** sou levado ao fluxo de login.

**Given** que minha sessao expira
**When** tento executar uma acao financeira
**Then** a acao e bloqueada
**And** recebo orientacao para entrar novamente.

## Epic 2: Operacao Financeira Essencial

Usuarios conseguem cadastrar, editar, excluir, categorizar e acompanhar receitas/despesas com feedback claro.

### Story 2.1: Cadastrar Receita com Campos Essenciais

As a usuario autenticado,
I want cadastrar uma receita com dados essenciais,
So that eu possa registrar dinheiro que entra no mes.

**Acceptance Criteria:**

**Given** que estou na tela Financas ou Inicio
**When** escolho adicionar receita e preencho descricao, valor, data, categoria e status
**Then** a receita e salva e exibida no local esperado
**And** o saldo do mes e atualizado com feedback claro.

**Given** que deixo campos obrigatorios invalidos
**When** tento salvar
**Then** vejo mensagens proximas aos campos
**And** a receita nao e criada.

### Story 2.2: Cadastrar Despesa com Campos Essenciais

As a usuario autenticado,
I want cadastrar uma despesa com dados essenciais,
So that eu possa registrar dinheiro que sai do mes.

**Acceptance Criteria:**

**Given** que estou na tela Financas ou Inicio
**When** escolho adicionar despesa e preencho descricao, valor, data, categoria e status
**Then** a despesa e salva e exibida no kanban financeiro
**And** o saldo e as pendencias sao atualizados.

**Given** que ocorre falha ao salvar
**When** tento criar a despesa
**Then** vejo uma mensagem acionavel
**And** nenhum dado parcial fica contabilizado.

### Story 2.3: Editar Receita ou Despesa Unica

As a usuario autenticado,
I want editar uma movimentacao unica,
So that eu possa corrigir valores, datas, categorias ou descricoes sem recriar o item.

**Acceptance Criteria:**

**Given** que abro uma receita ou despesa unica
**When** altero campos permitidos e salvo
**Then** o item e atualizado
**And** os totais refletem o novo valor persistido.

**Given** que a atualizacao falha
**When** tento salvar alteracoes
**Then** vejo mensagem de erro clara
**And** os dados anteriores permanecem preservados.

### Story 2.4: Excluir Receita ou Despesa Unica com Confirmacao

As a usuario autenticado,
I want excluir uma movimentacao unica com confirmacao,
So that eu evite apagar dados financeiros por engano.

**Acceptance Criteria:**

**Given** que solicito excluir uma movimentacao unica
**When** confirmo a exclusao
**Then** o item e removido
**And** deixa de influenciar saldos, pendencias e relatorios.

**Given** que cancelo a exclusao
**When** fecho a confirmacao
**Then** o item permanece inalterado.

### Story 2.5: Categorizar Movimentacoes Financeiras

As a usuario autenticado,
I want classificar receitas e despesas por categoria,
So that eu entenda melhor a origem e o destino do dinheiro.

**Acceptance Criteria:**

**Given** que cadastro ou edito uma movimentacao
**When** seleciono uma categoria
**Then** a categoria fica salva junto ao item
**And** aparece no card, detalhe e agrupamentos financeiros.

**Given** que nao escolho categoria quando ela for opcional
**When** salvo o item
**Then** o sistema trata a movimentacao sem quebrar calculos ou filtros.

### Story 2.6: Exibir Card Financeiro com Acoes Rapidas

As a usuario autenticado,
I want ver cada movimentacao em um card compacto com acoes rapidas,
So that eu possa operar o financeiro sem abrir fluxos pesados.

**Acceptance Criteria:**

**Given** que existem receitas ou despesas no mes
**When** visualizo o kanban/lista
**Then** cada card mostra descricao, valor, categoria, vencimento/data, status e sinais de erro/salvamento quando aplicavel.

**Given** que estou no mobile
**When** preciso operar o card
**Then** tenho acoes acessiveis para editar, excluir, mover ou marcar status sem depender de drag.

### Story 2.7: Diferenciar Falhas Financeiras com Mensagens Acionaveis

As a usuario autenticado,
I want entender por que uma acao financeira falhou,
So that eu saiba o que fazer sem desconfiar dos dados.

**Acceptance Criteria:**

**Given** que uma operacao falha por conexao, permissao, validacao ou erro inesperado
**When** o erro e exibido
**Then** a mensagem diferencia o tipo de falha em linguagem simples
**And** indica a proxima acao possivel.

**Given** que a falha acontece durante criacao, edicao ou exclusao
**When** o sistema mostra erro
**Then** os dados persistidos permanecem consistentes
**And** a interface nao contabiliza uma acao que nao foi salva.

### Story 2.8: Padronizar Feedback de Salvamento e Conclusao

As a usuario autenticado,
I want receber feedback claro ao salvar, editar ou excluir movimentacoes,
So that eu saiba que a acao foi concluida corretamente.

**Acceptance Criteria:**

**Given** que executo uma acao financeira critica
**When** a acao esta em andamento
**Then** vejo estado discreto de salvando quando aplicavel.

**Given** que a acao conclui com sucesso
**When** o estado persistido e refletido na interface
**Then** vejo confirmacao clara
**And** saldos e cards nao oscilam de forma inesperada.

## Epic 3: Recorrencias, Parcelas e Escopo Seguro

Usuarios conseguem criar, visualizar, editar e excluir recorrencias/parcelas sem perder confianca nos meses futuros.

### Story 3.1: Criar Lancamento Recorrente

As a usuario autenticado,
I want criar uma receita ou despesa recorrente,
So that salarios, contas fixas e assinaturas aparecam nos meses corretos.

**Acceptance Criteria:**

**Given** que estou criando uma receita ou despesa
**When** marco o item como recorrente e defino frequencia/vencimento quando aplicavel
**Then** o sistema salva a serie recorrente
**And** o lancamento aparece no mes atual e nos meses futuros corretos.

**Given** que o vencimento e opcional
**When** deixo o vencimento vazio
**Then** o sistema usa a data da transacao como referencia
**And** explica esse comportamento de forma clara.

### Story 3.2: Criar Lancamento Parcelado

As a usuario autenticado,
I want criar uma despesa ou receita parcelada,
So that compras e dividas em parcelas sejam distribuidas corretamente.

**Acceptance Criteria:**

**Given** que estou criando uma movimentacao
**When** seleciono parcelado e defino o numero de parcelas por seletor ou input editavel
**Then** o sistema cria as parcelas nos meses correspondentes
**And** cada parcela exibe sua posicao, como 1/10, 2/10.

**Given** que informo numero invalido de parcelas
**When** tento salvar
**Then** vejo erro proximo ao campo
**And** nenhuma parcela e criada.

### Story 3.3: Navegar Meses com Recorrencias e Parcelas Visiveis

As a usuario autenticado,
I want navegar entre meses e ver recorrencias/parcelas corretamente,
So that eu possa confiar no saldo atual e futuro.

**Acceptance Criteria:**

**Given** que tenho lancamentos recorrentes ou parcelados
**When** avanco ou volto o mes
**Then** os itens esperados aparecem no periodo correto
**And** saldos e pendencias consideram apenas os dados daquele mes.

**Given** que recarrego o app
**When** volto ao mes com recorrencias ou parcelas
**Then** os dados persistidos continuam corretos
**And** itens excluidos nao reaparecem.

### Story 3.4: Editar Apenas uma Ocorrencia da Serie

As a usuario autenticado,
I want editar somente uma ocorrencia recorrente ou parcelada,
So that eu possa corrigir um mes especifico sem alterar a serie inteira.

**Acceptance Criteria:**

**Given** que abro um item recorrente ou parcelado
**When** escolho editar somente este item
**Then** apenas a ocorrencia selecionada e alterada
**And** ocorrencias futuras e anteriores permanecem iguais.

**Given** que a alteracao impacta valores do mes
**When** salvo a edicao
**Then** o saldo do mes e recalculado
**And** o sistema confirma o escopo aplicado.

### Story 3.5: Editar Esta e as Proximas Ocorrencias

As a usuario autenticado,
I want editar esta ocorrencia e as proximas,
So that mudancas de valor ou data passem a valer daqui para frente.

**Acceptance Criteria:**

**Given** que abro uma serie recorrente ou parcelada
**When** escolho o escopo "este e proximos"
**Then** a ocorrencia atual e as futuras sao atualizadas
**And** ocorrencias anteriores permanecem preservadas.

**Given** que navego para meses futuros
**When** visualizo a serie
**Then** os novos valores/datas aparecem corretamente.

### Story 3.6: Editar Toda a Serie

As a usuario autenticado,
I want editar uma serie inteira,
So that eu possa corrigir uma regra recorrente ou parcelada em todos os meses.

**Acceptance Criteria:**

**Given** que abro um item recorrente ou parcelado
**When** escolho editar todos
**Then** todas as ocorrencias da serie sao atualizadas conforme a nova regra
**And** o sistema informa que a alteracao afetou a serie inteira.

**Given** que a atualizacao falha
**When** tento salvar a edicao de serie
**Then** nenhuma alteracao parcial fica aplicada sem confirmacao
**And** recebo mensagem acionavel.

### Story 3.7: Excluir Recorrencia ou Parcela com Escopo

As a usuario autenticado,
I want excluir uma ocorrencia, proximas ocorrencias ou uma serie inteira,
So that eu controle o impacto da exclusao sem apagar dados por engano.

**Acceptance Criteria:**

**Given** que solicito excluir item recorrente ou parcelado
**When** o modal de escopo aparece
**Then** posso escolher somente este, este e proximos ou todos
**And** cada opcao explica o impacto antes da confirmacao.

**Given** que confirmo a exclusao com escopo escolhido
**When** a operacao conclui
**Then** os itens afetados sao removidos
**And** deixam de influenciar saldos, pendencias e relatorios.

### Story 3.8: Mostrar Impacto Antes de Acoes Criticas

As a usuario autenticado,
I want ver o efeito esperado antes de alterar ou excluir series,
So that eu tenha seguranca antes de confirmar.

**Acceptance Criteria:**

**Given** que uma acao pode afetar multiplos meses
**When** o sistema pede confirmacao
**Then** vejo o item, o tipo da acao e o escopo possivel
**And** entendo se a acao afeta apenas este mes, meses futuros ou toda a serie.

**Given** que cancelo a confirmacao
**When** fecho o modal
**Then** nenhuma alteracao e aplicada.

### Story 3.9: Distinguir Planejado, Pendente e Concluido em Series

As a usuario autenticado,
I want diferenciar itens planejados, pendentes e concluidos dentro de recorrencias/parcelas,
So that eu entenda o que ja aconteceu e o que ainda precisa de acao.

**Acceptance Criteria:**

**Given** que uma serie possui ocorrencias em diferentes estados
**When** visualizo cards ou totais
**Then** consigo distinguir planejado, pendente e concluido
**And** os calculos usam os estados conforme a regra financeira definida.

**Given** que altero o status de uma ocorrencia
**When** salvo a mudanca
**Then** o status fica persistido
**And** os totais do mes refletem o novo estado.

## Epic 4: Leitura do Mes, Saldos e Explicabilidade

Usuarios entendem saldo, pendencias, concluidos, composicao dos totais e impacto do mes atual.

### Story 4.1: Exibir Resumo Mensal com Saldo Claro

As a usuario autenticado,
I want ver um resumo mensal com receitas, despesas e saldo,
So that eu entenda rapidamente como esta meu mes.

**Acceptance Criteria:**

**Given** que tenho movimentacoes no mes
**When** acesso a tela Inicio
**Then** vejo receitas, despesas, saldo e indicacao positiva/negativa
**And** os numeros mostram o periodo considerado.

**Given** que o mes esta negativo
**When** visualizo o resumo
**Then** o estado e comunicado por texto e cor
**And** nao depende apenas da cor para ser entendido.

### Story 4.2: Mostrar Proximas Acoes do Mes

As a usuario autenticado,
I want ver o que merece atencao agora,
So that eu saiba o proximo passo financeiro sem procurar demais.

**Acceptance Criteria:**

**Given** que existem pendencias no mes
**When** acesso a tela Inicio
**Then** vejo uma lista curta de proximas acoes
**And** posso abrir a movimentacao relacionada.

**Given** que nao ha pendencias relevantes
**When** acesso a tela Inicio
**Then** vejo mensagem tranquila indicando que o mes esta organizado
**And** recebo uma acao util opcional, como adicionar movimentacao.

### Story 4.3: Navegar Entre Meses sem Perder Contexto

As a usuario autenticado,
I want trocar entre meses financeiros,
So that eu revise passado, presente e futuro sem confusao.

**Acceptance Criteria:**

**Given** que estou em Inicio ou Financas
**When** avanco ou volto o mes
**Then** os cards e totais passam a refletir o mes selecionado
**And** o app indica claramente qual mes esta ativo.

**Given** que estou em mes diferente do atual
**When** clico em voltar para mes atual
**Then** o app retorna ao mes corrente
**And** os dados sao revalidados se necessario.

### Story 4.4: Explicar Composicao dos Totais

As a usuario autenticado,
I want ver quais lancamentos compoem um total financeiro,
So that eu confie nos numeros apresentados.

**Acceptance Criteria:**

**Given** que vejo um total de receita, despesa, pendencia ou saldo
**When** abro o detalhe do total
**Then** vejo os lancamentos considerados
**And** cada lancamento mostra valor, status e mes/periodo.

**Given** que ha filtros ativos
**When** visualizo um total
**Then** o sistema indica que o numero esta filtrado
**And** oferece opcao de limpar filtros.

### Story 4.5: Mostrar Pendentes, Concluidos e Recentes

As a usuario autenticado,
I want diferenciar pendentes, concluidos e lancamentos recentes,
So that eu entenda o que ja aconteceu e o que ainda precisa de acao.

**Acceptance Criteria:**

**Given** que existem movimentacoes no mes
**When** visualizo Inicio ou Financas
**Then** consigo distinguir pendentes e concluidos
**And** vejo lancamentos recentes quando aplicavel.

**Given** que altero status de um item
**When** o status e salvo
**Then** ele muda de grupo corretamente
**And** os totais sao atualizados.

### Story 4.6: Exibir Estados Vazios Orientativos

As a usuario novo ou sem dados no mes,
I want ver orientacao clara quando nao ha dados,
So that eu saiba o que cadastrar primeiro.

**Acceptance Criteria:**

**Given** que nao tenho movimentacoes no mes
**When** acesso Inicio ou Financas
**Then** vejo estado vazio com explicacao curta
**And** tenho acao direta para adicionar receita ou despesa.

**Given** que dados sao insuficientes para leitura confiavel
**When** o app exibe o resumo
**Then** vejo indicacao do que falta cadastrar
**And** a mensagem nao parece erro tecnico.

### Story 4.7: Explicar Termos Financeiros Essenciais

As a usuario iniciante,
I want entender termos como receita, despesa, saldo, parcela e recorrencia,
So that eu use o app sem conhecimento financeiro avancado.

**Acceptance Criteria:**

**Given** que um termo pode gerar duvida
**When** ele aparece em formulario, card ou resumo
**Then** ha microcopy ou tooltip discreto explicando o termo
**And** a explicacao e curta e em linguagem simples.

**Given** que estou no mobile
**When** preciso acessar uma explicacao
**Then** ela aparece sem ocupar a tela inteira
**And** pode ser fechada facilmente.

### Story 4.8: Alertar Visualizacao Incompleta ou Desatualizada

As a usuario autenticado,
I want saber quando uma leitura financeira pode estar incompleta ou desatualizada,
So that eu nao tome decisoes com base em dados ruins.

**Acceptance Criteria:**

**Given** que o app detecta dados incompletos, falha de sincronizacao ou cache desatualizado
**When** exibe saldos ou resumos
**Then** mostra aviso discreto e acionavel
**And** oferece atualizacao ou orientacao de correcao.

**Given** que os dados sao revalidados com sucesso
**When** a tela atualiza
**Then** o aviso desaparece
**And** os numeros refletem o estado persistido.

### Story 4.9: Agrupar Gastos por Categoria com Clareza

As a usuario autenticado,
I want ver agrupamentos de gastos por categoria,
So that eu entenda para onde meu dinheiro esta indo.

**Acceptance Criteria:**

**Given** que tenho despesas categorizadas
**When** visualizo agrupamentos ou resumo por categoria
**Then** vejo categorias com valores correspondentes
**And** posso abrir detalhes dos lancamentos do grupo.

**Given** que ha categoria sem nome ou sem classificacao
**When** o agrupamento aparece
**Then** o sistema exibe uma categoria neutra compreensivel
**And** nao quebra o calculo.

## Epic 5: Orcamentos, Metas e Proximas Decisoes

Usuarios conseguem acompanhar limites, metas e receber orientacao simples sobre dinheiro restante.

### Story 5.1: Criar Orcamento por Categoria

As a usuario autenticado,
I want criar um orcamento por categoria,
So that eu defina limites claros para meus gastos.

**Acceptance Criteria:**

**Given** que estou na area de orcamentos ou metas
**When** seleciono categoria, valor limite e periodo
**Then** o orcamento e salvo
**And** aparece associado a categoria escolhida.

**Given** que informo valor invalido
**When** tento salvar
**Then** vejo erro proximo ao campo
**And** nenhum orcamento invalido e criado.

### Story 5.2: Editar ou Remover Orcamento

As a usuario autenticado,
I want editar ou remover um orcamento existente,
So that meus limites acompanhem minha realidade financeira.

**Acceptance Criteria:**

**Given** que tenho um orcamento salvo
**When** altero valor, categoria ou periodo
**Then** o orcamento e atualizado
**And** comparativos passam a usar o novo limite.

**Given** que solicito remover um orcamento
**When** confirmo a remocao
**Then** o orcamento e removido
**And** nao aparece mais nos comparativos.

### Story 5.3: Comparar Gastos com Limites

As a usuario autenticado,
I want comparar gastos realizados com limites definidos,
So that eu saiba quando estou dentro ou fora do planejado.

**Acceptance Criteria:**

**Given** que tenho orcamentos e despesas categorizadas
**When** visualizo a tela de orcamentos/metas
**Then** vejo gasto atual, limite e diferenca por categoria
**And** o periodo considerado fica claro.

**Given** que os gastos se aproximam do limite
**When** visualizo a categoria
**Then** vejo sinal de atencao discreto
**And** a mensagem explica o risco sem exagero.

### Story 5.4: Exibir Metas Financeiras Simples

As a usuario autenticado,
I want acompanhar metas financeiras simples,
So that eu tenha direcao para guardar ou separar dinheiro.

**Acceptance Criteria:**

**Given** que crio uma meta com nome, valor alvo e prazo opcional
**When** salvo a meta
**Then** ela aparece na tela de Metas
**And** mostra progresso atual de forma clara.

**Given** que atualizo o progresso da meta
**When** salvo a alteracao
**Then** o percentual ou valor atingido e atualizado
**And** o feedback confirma a mudanca.

### Story 5.5: Orientar sobre Dinheiro Restante

As a usuario autenticado,
I want receber orientacao simples sobre o dinheiro restante,
So that eu saiba se devo gastar, guardar ou segurar.

**Acceptance Criteria:**

**Given** que o app possui dados suficientes do mes
**When** calcula saldo restante apos pendencias
**Then** mostra uma orientacao educativa e cautelosa
**And** deixa claro que nao substitui aconselhamento profissional.

**Given** que os dados sao insuficientes
**When** a orientacao seria pouco confiavel
**Then** o app informa quais dados faltam
**And** evita recomendacao conclusiva.

### Story 5.6: Conectar Metas ao Resumo do Mes

As a usuario autenticado,
I want ver metas relevantes no contexto do mes,
So that eu conecte saldo disponivel com objetivos reais.

**Acceptance Criteria:**

**Given** que tenho metas ativas
**When** acesso Inicio ou Metas
**Then** vejo uma referencia discreta a meta prioritaria
**And** posso abrir detalhes sem sair perdido do contexto mensal.

**Given** que nao tenho metas
**When** acesso a area
**Then** vejo estado vazio com convite para criar uma meta simples.

## Epic 6: Workspace Compartilhado e Permissoes

Usuarios conseguem usar contexto pessoal, familia, equipe ou empresa com convites, permissoes e separacao de dados.

### Story 6.1: Criar ou Acessar Workspace

As a usuario autenticado,
I want criar ou acessar um workspace financeiro,
So that eu organize financas individuais, familiares, de equipe ou empresa.

**Acceptance Criteria:**

**Given** que estou autenticado
**When** crio um workspace com nome valido
**Then** o workspace e criado e fica ativo
**And** a interface mostra claramente o contexto atual.

**Given** que ja participo de workspaces
**When** acesso configuracoes
**Then** consigo ver os workspaces disponiveis
**And** escolher qual esta ativo.

### Story 6.2: Alternar Contexto sem Misturar Dados

As a usuario autenticado,
I want alternar entre contexto pessoal e compartilhado,
So that eu nao misture dados financeiros diferentes.

**Acceptance Criteria:**

**Given** que tenho mais de um contexto
**When** alterno o workspace ativo
**Then** dados financeiros exibidos passam a pertencer ao contexto selecionado
**And** o app indica visualmente onde estou.

**Given** que uma acao sera aplicada em workspace compartilhado
**When** executo a acao
**Then** o sistema sinaliza o contexto compartilhado quando houver risco de confusao.

### Story 6.3: Convidar Pessoa para Workspace

As a proprietario ou administrador,
I want convidar outra pessoa para um workspace,
So that ela possa participar da gestao financeira compartilhada.

**Acceptance Criteria:**

**Given** que tenho permissao para convidar
**When** informo email e nivel de acesso
**Then** o convite e criado ou enviado conforme integracao disponivel
**And** recebo feedback claro.

**Given** que o email e invalido ou o envio falha
**When** tento enviar convite
**Then** vejo mensagem acionavel
**And** o convite nao fica em estado enganoso.

### Story 6.4: Aceitar Convite de Workspace

As a usuario convidado,
I want aceitar um convite de workspace,
So that eu acesse o contexto financeiro compartilhado correto.

**Acceptance Criteria:**

**Given** que recebi convite valido
**When** aceito o convite autenticado
**Then** passo a participar do workspace
**And** meu nivel de permissao fica visivel.

**Given** que o convite esta expirado ou invalido
**When** tento aceitar
**Then** vejo explicacao clara
**And** nao ganho acesso indevido.

### Story 6.5: Exibir e Aplicar Permissoes

As a membro de workspace,
I want entender meu nivel de permissao,
So that eu saiba o que posso visualizar, editar ou administrar.

**Acceptance Criteria:**

**Given** que estou em workspace compartilhado
**When** acesso configuracoes ou tento uma acao restrita
**Then** vejo meu nivel de permissao
**And** acoes incompativeis ficam bloqueadas ou explicadas.

**Given** que nao tenho permissao para editar
**When** tento alterar dado financeiro
**Then** a acao e impedida
**And** recebo mensagem simples sobre o motivo.

### Story 6.6: Gerenciar Informacoes Basicas do Workspace

As a administrador de workspace,
I want gerenciar informacoes basicas do workspace,
So that o espaco fique claro para todos os membros.

**Acceptance Criteria:**

**Given** que tenho permissao administrativa
**When** altero nome ou configuracoes basicas do workspace
**Then** as alteracoes sao salvas
**And** aparecem para os membros autorizados.

**Given** que ocorre falha ao salvar
**When** tento atualizar o workspace
**Then** vejo erro acionavel
**And** os dados anteriores permanecem preservados.

## Epic 7: Dados, Importacao, Exportacao e Auditoria

Usuarios conseguem importar, exportar, limpar dados e preservar consistencia/rastreabilidade em acoes criticas.

### Story 7.1: Exportar Dados Financeiros

As a usuario autenticado,
I want exportar meus dados financeiros,
So that eu tenha controle e portabilidade das minhas informacoes.

**Acceptance Criteria:**

**Given** que tenho permissao no contexto atual
**When** solicito exportacao
**Then** o sistema gera arquivo com dados financeiros do contexto correto
**And** nao inclui dados de outro workspace.

**Given** que nao ha dados para exportar
**When** solicito exportacao
**Then** vejo estado informativo
**And** nenhuma exportacao vazia confusa e apresentada.

### Story 7.2: Importar Dados com Validacao Previa

As a usuario autenticado,
I want importar dados financeiros com validacao,
So that eu evite quebrar meus registros existentes.

**Acceptance Criteria:**

**Given** que seleciono arquivo para importacao
**When** o sistema analisa o conteudo
**Then** vejo preview de registros validos, invalidos e conflitos
**And** nada e persistido antes da confirmacao.

**Given** que ha erros no arquivo
**When** a validacao termina
**Then** vejo quais linhas precisam correcao
**And** posso cancelar sem alterar dados atuais.

### Story 7.3: Confirmar Importacao e Preservar Calculos

As a usuario autenticado,
I want confirmar importacao apenas apos revisar impacto,
So that os calculos continuem consistentes.

**Acceptance Criteria:**

**Given** que a validacao de importacao foi aprovada
**When** confirmo a importacao
**Then** os dados sao persistidos no workspace ativo
**And** saldos, categorias e recorrencias sao revalidados.

**Given** que a importacao falha durante persistencia
**When** o erro ocorre
**Then** vejo mensagem acionavel
**And** o sistema evita estado parcial enganoso.

### Story 7.4: Limpar ou Remover Dados com Confirmacao Forte

As a usuario autorizado,
I want limpar ou remover dados de um contexto com confirmacao explicita,
So that eu nao apague informacoes importantes por engano.

**Acceptance Criteria:**

**Given** que solicito limpeza ou remocao em massa
**When** o modal aparece
**Then** vejo o contexto afetado e o impacto esperado
**And** preciso confirmar explicitamente.

**Given** que confirmo a remocao
**When** a operacao conclui
**Then** os dados afetados somem dos calculos
**And** o app revalida os totais.

### Story 7.5: Rastrear Acoes Criticas Recentes

As a usuario autorizado,
I want revisar acoes criticas recentes,
So that eu consiga investigar inconsistencias de dados.

**Acceptance Criteria:**

**Given** que ocorreram acoes criticas como importacao, exclusao ou edicao ampla
**When** acesso area de diagnostico ou historico
**Then** vejo registros suficientes para entender o que mudou
**And** o registro respeita permissao e privacidade.

**Given** que nao ha acoes recentes
**When** acesso a area
**Then** vejo estado vazio claro
**And** nenhuma informacao sensivel desnecessaria e exibida.

### Story 7.6: Explicar Impacto de Operacoes em Massa

As a usuario autorizado,
I want compreender impacto de importacoes, limpezas ou exclusoes em massa,
So that eu confirme apenas acoes que realmente desejo executar.

**Acceptance Criteria:**

**Given** que uma operacao em massa afetara dados financeiros
**When** o sistema pede confirmacao
**Then** vejo quantidade de registros, periodo/contexto e tipo de impacto
**And** posso cancelar sem alteracao.

**Given** que confirmo a operacao
**When** ela termina
**Then** recebo feedback de resultado
**And** inconsistencias sao sinalizadas se existirem.

## Epic 8: Aquisicao, SEO, Qualidade e Validacao Multiplataforma

Visitantes entendem o produto publicamente, usuarios acessam conteudo seguro, e o app e validado em telas/navegadores.

### Story 8.1: Criar Pagina Publica de Proposta de Valor

As a visitante,
I want acessar uma pagina publica clara sobre o Deu Bom,
So that eu entenda o problema que o produto resolve antes de criar conta.

**Acceptance Criteria:**

**Given** que acesso a pagina publica
**When** a pagina carrega
**Then** entendo a proposta de valor em linguagem simples
**And** tenho chamada clara para cadastro ou login.

**Given** que a pagina e indexavel
**When** motores de busca leem a pagina
**Then** dados financeiros privados nao aparecem em conteudo ou metadados.

### Story 8.2: Configurar SEO Publico Basico

As a visitante vindo de busca,
I want encontrar paginas publicas bem descritas,
So that eu reconheca rapidamente que o app resolve minha necessidade.

**Acceptance Criteria:**

**Given** que uma pagina publica existe
**When** ela e renderizada
**Then** possui title, description e metadados sociais adequados
**And** usa linguagem proxima do publico-alvo.

**Given** que o app autenticado contem dados privados
**When** metadados publicos sao gerados
**Then** nenhuma informacao financeira autenticada e exposta.

### Story 8.3: Publicar Conteudo Educativo e FAQ

As a visitante ou usuario,
I want acessar conteudo educativo e FAQ,
So that eu aprenda conceitos simples antes ou durante o uso do app.

**Acceptance Criteria:**

**Given** que existe conteudo educativo publico
**When** acesso guias, FAQ ou paginas informativas
**Then** consigo ler sem autenticacao
**And** encontro chamada para criar conta quando fizer sentido.

**Given** que o conteudo menciona recomendacoes financeiras
**When** leio a orientacao
**Then** ela usa linguagem educativa
**And** nao promete retorno ou aconselhamento profissional.

### Story 8.4: Separar Experiencia Publica e App Autenticado

As a usuario ou visitante,
I want que paginas publicas e area privada fiquem separadas,
So that dados financeiros nao sejam expostos indevidamente.

**Acceptance Criteria:**

**Given** que estou em pagina publica
**When** navego pelo conteudo
**Then** nao vejo dados financeiros autenticados
**And** chamadas para login/cadastro levam ao fluxo correto.

**Given** que tento acessar area privada sem sessao
**When** a rota e protegida
**Then** sou redirecionado para autenticacao.

### Story 8.5: Criar Checklist de QA para Fluxos Criticos

As a responsavel pelo produto,
I want validar fluxos financeiros antes de liberar mudancas,
So that regressões em dados criticos sejam capturadas.

**Acceptance Criteria:**

**Given** que uma mudanca afeta financas
**When** a checklist e executada
**Then** cobre cadastro, edicao, exclusao, recorrencia, parcela, reload, workspace e balanco
**And** resultados ficam documentados.

**Given** que um item da checklist falha
**When** a validacao termina
**Then** o problema fica registrado
**And** a liberacao e bloqueada ou marcada como risco.

### Story 8.6: Validar Responsividade e Navegadores Prioritarios

As a usuario em diferentes dispositivos,
I want usar o app sem quebra visual,
So that eu consiga operar minhas financas em mobile, tablet e desktop.

**Acceptance Criteria:**

**Given** que o app e testado em 360px, 390px, 768px, 1024px e desktop amplo
**When** as telas principais sao abertas
**Then** nao ha overflow horizontal incoerente
**And** acoes essenciais continuam acessiveis.

**Given** que o app e testado em Chrome, Edge, Firefox e Safari quando possivel
**When** fluxos principais sao executados
**Then** cadastro, edicao, exclusao, navegacao de mes e kanban funcionam.

### Story 8.7: Validar Acessibilidade WCAG 2.2 AA Progressiva

As a usuario com necessidades de acessibilidade,
I want interagir com o app por teclado, leitor de tela e contraste adequado,
So that eu consiga administrar minhas financas com autonomia.

**Acceptance Criteria:**

**Given** que navego por teclado
**When** passo por menus, formularios, modais e cards
**Then** o foco e visivel e a ordem e compreensivel.

**Given** que uma informacao usa cor
**When** o estado e exibido
**Then** tambem ha texto ou outro sinal nao dependente apenas de cor.

### Story 8.8: Registrar Validacoes Criticas

As a responsavel pelo produto,
I want registrar resultados de validacoes criticas,
So that eu tenha historico de qualidade por release.

**Acceptance Criteria:**

**Given** que uma validacao manual ou automatizada e executada
**When** ela termina
**Then** o resultado e registrado com data, escopo e status
**And** riscos conhecidos ficam visiveis para a proxima rodada.

**Given** que nao foi possivel executar algum teste
**When** o registro e salvo
**Then** a lacuna fica documentada
**And** nao e tratada como aprovada silenciosamente.

## Epic 9: Festometro como Planejamento de Eventos

Usuarios conseguem planejar eventos em cards, abrir detalhes sob demanda, organizar participantes, itens e convites sem transformar a tela em formulario inchado.

### Story 9.1: Exibir Eventos em Cards Compactos

As a usuario autenticado,
I want ver meus eventos em cards compactos,
So that eu acompanhe o Festometro sem encarar um formulario aberto e pesado.

**Acceptance Criteria:**

**Given** que existem eventos cadastrados
**When** acesso o Festometro
**Then** vejo cards com nome, data, tipo, total estimado, participantes e status
**And** detalhes avancados ficam ocultos ate eu abrir o evento.

**Given** que nao existem eventos
**When** acesso o Festometro
**Then** vejo estado vazio com chamada para criar evento
**And** a tela permanece simples no mobile.

### Story 9.2: Criar ou Editar Evento por Fluxo Focado

As a usuario autenticado,
I want criar ou editar evento em um fluxo focado,
So that tipo, participantes, itens e configuracoes nao poluam a tela principal.

**Acceptance Criteria:**

**Given** que clico em criar evento
**When** o modal ou bottom sheet abre
**Then** preencho dados essenciais primeiro
**And** configuracoes avancadas aparecem recolhidas.

**Given** que salvo o evento
**When** a operacao conclui
**Then** o card do evento aparece ou atualiza
**And** recebo feedback claro de sucesso ou erro.

### Story 9.3: Organizar Detalhes do Evento em Blocos Recolhiveis

As a usuario autenticado,
I want abrir participantes, itens e rateio apenas quando precisar,
So that eu veja primeiro o resumo macro do evento.

**Acceptance Criteria:**

**Given** que abro um evento
**When** visualizo seus detalhes
**Then** vejo resumo financeiro primeiro
**And** participantes, itens e compras aparecem em secoes recolhiveis com `aria-expanded`.

**Given** que estou no mobile
**When** expando ou recolho uma secao
**Then** o layout nao gera overflow horizontal
**And** o foco e fechamento permanecem claros.

### Story 9.4: Enviar Convite de Participante Quando Houver Email

As a anfitriao do evento,
I want enviar convite ao participante quando houver email,
So that eu possa organizar participacao sem tornar email obrigatorio.

**Acceptance Criteria:**

**Given** que um participante tem email cadastrado
**When** clico em enviar convite
**Then** o sistema tenta enviar o convite usando remetente do anfitriao ou criador do evento quando suportado
**And** informa sucesso ou falha de forma clara.

**Given** que o participante nao tem email
**When** visualizo suas acoes
**Then** o envio de convite nao e obrigatorio
**And** o participante continua valido no evento.

### Story 9.5: Validar Festometro em Mobile e QA

As a usuario em celular,
I want usar o Festometro sem tela inchada ou saltos visuais,
So that eu consiga planejar eventos com conforto.

**Acceptance Criteria:**

**Given** que acesso Festometro em 360px e 390px
**When** listo eventos, crio evento e abro detalhes
**Then** nao ha overflow horizontal incoerente
**And** acoes principais permanecem acessiveis.

**Given** que uma mudanca no Festometro e validada
**When** a checklist de QA e executada
**Then** cobre criar evento, editar evento, participantes, itens, convites e detalhes recolhiveis
**And** registra resultado ou lacuna de teste.
