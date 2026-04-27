---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - _bmad-output/project-context.md
  - docs/bmad/current-state.md
  - docs/bmad/README.md
  - docs/bmad/roadmap.md
  - docs/bmad/work-log.md
  - _bmad-output/implementation-artifacts/spec-fix-encoding-texts.md
  - _bmad-output/implementation-artifacts/review-prompt-fix-encoding-texts.md
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 7
classification:
  projectType: web_app
  domain: personal_finance
  complexity: medium
  projectContext: brownfield
workflowType: 'prd'
status: complete
completedAt: '2026-04-27'
---

# Product Requirements Document - Deu Bom Finanças sem erro

**Author:** Alisson
**Date:** 2026-04-27

## Executive Summary

O Deu Bom - Finanças Sem Erro é um web app/PWA de finanças pessoais para pessoas que querem administrar melhor a própria grana sem enfrentar telas poluídas, excesso de dados ou fluxos difíceis de entender. O produto resolve uma combinação de problemas recorrentes: falta de controle financeiro mensal, ansiedade causada por desorganização, dificuldade em lidar com contas recorrentes e falta de clareza sobre o que fazer com o dinheiro restante.

A visão do produto é oferecer uma experiência simples, inteligível e agradável aos olhos, que ajude o usuário a entender o mês financeiro, registrar e revisar movimentações, acompanhar orçamentos, controlar recorrências e tomar decisões melhores sobre gastar, guardar ou investir. O app deve atuar como um guia prático: mostrar o que importa, reduzir ruído e direcionar a pessoa para o próximo passo financeiro correto.

### What Makes This Special

O diferencial do Deu Bom é combinar controle financeiro operacional com orientação simples. O produto não deve competir por volume de gráficos, métricas ou complexidade; deve vencer por clareza, calma e utilidade imediata. Cada tela deve responder a uma pergunta prática do usuário: “como está meu mês?”, “o que entrou e saiu?”, “o que está comprometido?”, “quanto ainda posso usar?” e “qual o próximo cuidado com minha grana?”.

O insight central é que o usuário não precisa apenas registrar transações. Ele precisa reduzir erros, entender recorrências, ganhar confiança no mês atual e saber como agir com o saldo disponível. A experiência deve evitar excesso de cores, excesso de dados e excesso de escolhas, priorizando leitura rápida, linguagem direta e fluxos intuitivos.

## Project Classification

- **Project Type:** Web app/PWA
- **Domain:** Finanças pessoais
- **Complexity:** Média
- **Project Context:** Brownfield

O projeto já possui uma base funcional com autenticação, workspace compartilhado, dashboard, transações, orçamentos, analytics, configurações, Festômetro, Supabase, store financeiro centralizado e componentes visuais reutilizáveis. O PRD deve orientar a evolução dessa base existente, priorizando confiabilidade dos fluxos financeiros, clareza de UX, consistência visual, normalização de copy e preparação para testes dos comportamentos críticos.

As seções seguintes traduzem essa visão em critérios de sucesso, jornadas, requisitos de domínio, escopo faseado e contratos funcionais/não funcionais para orientar UX, arquitetura, épicos e implementação.

## Success Criteria

### User Success

O usuário tem sucesso quando consegue cadastrar suas receitas e despesas, revisar o balanço do mês e entender com confiança se está positivo ou negativo. O momento de valor principal acontece após inserir os dados financeiros essenciais e visualizar saldos, compromissos e resultado mensal sem dúvidas sobre os cálculos apresentados.

A experiência deve reduzir ansiedade financeira por meio de telas simples, dados organizados e linguagem clara. O usuário não deve precisar interpretar fórmulas, procurar valores escondidos ou desconfiar de números gerados pelo app.

Critérios essenciais de sucesso do usuário:
- Cadastrar receitas e despesas sem fricção.
- Atualizar receitas e despesas existentes com segurança.
- Excluir receitas e despesas sem deixar resíduos nos cálculos.
- Visualizar balanço mensal positivo ou negativo com clareza.
- Entender quais valores foram considerados no resultado.
- Confiar que recorrências aparecem nos meses corretos.
- Receber feedback claro quando uma ação é concluída ou falha.

### Business Success

O produto está funcionando quando demonstra crescimento, recorrência de uso e disposição real de continuidade. Os principais sinais de negócio são: número de usuários ativos, fidelização, uso recorrente, feedback positivo, indicações espontâneas e usuários dispostos a pagar para continuar usando ou para acessar funcionalidades adicionais.

Métricas recomendadas para acompanhar:
- Usuários ativos semanais e mensais.
- Percentual de usuários que retornam após cadastrar os primeiros dados.
- Frequência média de uso por usuário.
- Quantidade de feedbacks recebidos e classificados por tema.
- Indicações orgânicas ou convites para workspace.
- Sinais de monetização: intenção de pagamento, pedidos por plano premium ou aceitação de funcionalidades pagas.

### Technical Success

A base técnica tem sucesso quando operações financeiras críticas são confiáveis, persistentes e auditáveis pelo comportamento do app. A aplicação não pode permitir perda indevida de dados, cálculos infiéis ou inconsistência entre interface, store e Supabase.

Falhas inaceitáveis:
- Usuário não conseguir adicionar, atualizar ou remover dados sem motivo claro.
- Dados serem apagados sem permissão explícita.
- Dados apagados continuarem contabilizando no balanço.
- Transações recorrentes não aparecerem nos próximos meses nas datas corretas.
- Dados financeiros voltarem após exclusão ou atualização.
- Workspace misturar dados entre usuários ou contextos.
- Lentidão recorrente e excessiva em fluxos principais.
- Má organização de UX/UI em qualquer aba a ponto de gerar dúvida ou erro de uso.

### Measurable Outcomes

Resultados mensuráveis para validar a próxima fase:
- Usuário consegue cadastrar, editar e excluir receita/despesa em fluxo completo sem erro.
- Após reload, dados criados, editados e removidos permanecem corretos.
- Balanço mensal reflete corretamente receitas, despesas, status e recorrências.
- Exclusões e edições de recorrências respeitam o escopo escolhido.
- Usuário entende o saldo do mês sem precisar de explicação externa.
- Build de produção continua passando.
- Lint passa considerando apenas arquivos relevantes do app.
- Checklist de QA cobre fluxos críticos de dados e principais telas.

## User Journeys

### Jornada 1: Começar do zero com clareza

Marina tem 28 anos, trabalha, recebe salário mensal e sente que sua grana “some” antes do fim do mês. Ela já tentou planilhas e apps cheios de gráficos, mas sempre abandona porque não sabe onde colocar cada informação nem entende se os números estão certos.

Ao abrir o Deu Bom, Marina precisa entender rapidamente por onde começar. O app deve guiá-la para cadastrar suas receitas principais, despesas fixas e despesas variáveis sem exigir conhecimento financeiro avançado. Depois dos primeiros lançamentos, ela vê o balanço mensal e identifica se está positiva ou negativa.

O momento de valor acontece quando Marina percebe: “agora eu sei para onde minha grana está indo”. Ela não precisa configurar dezenas de coisas antes de enxergar resultado. A primeira experiência precisa reduzir dúvida, não criar mais uma tarefa.

Requisitos revelados:
- Onboarding simples para primeira configuração financeira.
- Cadastro claro de receita e despesa.
- Categorias compreensíveis.
- Balanço mensal visível logo após os primeiros dados.
- Linguagem direta para explicar saldo, entradas, saídas e resultado.

### Jornada 2: Controlar recorrências e parcelas sem erro

Rafael tem 35 anos, usa cartão, paga assinaturas, tem contas fixas e algumas compras parceladas. O problema dele não é só registrar gastos; é lembrar o que volta todo mês e entender o impacto disso no saldo futuro.

No Deu Bom, Rafael cadastra uma despesa recorrente ou parcelada e espera que ela apareça nos meses certos, nas datas certas e com os valores corretos. Quando precisa editar ou excluir, ele precisa escolher com segurança se a mudança vale apenas para uma ocorrência, para as próximas ou para toda a série.

O momento crítico acontece quando Rafael troca de mês e vê que as recorrências estão lá corretamente. Isso cria confiança. Se o app errar recorrência, o produto perde credibilidade.

Requisitos revelados:
- Criação confiável de recorrências e parcelas.
- Visualização por mês considerando lançamentos futuros.
- Edição com escopo claro: item único, futuros ou série inteira.
- Exclusão com confirmação e explicação do impacto.
- Cálculos que removem corretamente dados apagados.

### Jornada 3: Usar em família, equipe ou empresa

Carla e Bruno administram gastos da casa juntos. Em outro contexto, uma pequena equipe ou empresa quer registrar despesas compartilhadas. O ponto comum é que mais de uma pessoa precisa consultar ou atualizar dados sem misturar responsabilidades.

No Deu Bom, o workspace permite que pessoas certas acessem o conjunto financeiro correto. Cada usuário precisa entender em qual workspace está, quais dados pertencem àquele contexto e quais ações pode executar. O app deve evitar confusão entre finanças pessoais, familiares, de equipe ou empresa.

O momento de valor acontece quando o grupo confia que todos estão vendo a mesma realidade financeira. O risco principal é misturar dados, permitir ação errada ou não deixar claro quem alterou o quê.

Requisitos revelados:
- Workspace visível e compreensível.
- Separação confiável entre dados pessoais e compartilhados.
- Convite e entrada em workspace sem fricção.
- Permissões claras para leitura, edição e administração.
- Feedback visual quando o usuário está em ambiente compartilhado.

### Jornada 4: Revisar o mês e decidir o que fazer com o dinheiro restante

Lucas já cadastrou receitas e despesas. Agora ele quer saber se pode gastar, guardar ou investir. Ele não quer analisar uma planilha; quer uma leitura clara do mês e uma orientação simples.

No Deu Bom, Lucas visualiza saldo, entradas, saídas, pendências e orçamento. O app deve mostrar o balanço sem excesso de gráficos e indicar se o mês está confortável, apertado ou negativo. A evolução futura deve ajudar Lucas a decidir o que fazer com a grana restante.

O momento de valor acontece quando Lucas entende o próximo passo: segurar gasto, separar reserva, guardar uma parte ou planejar melhor o próximo mês.

Requisitos revelados:
- Dashboard mensal com leitura objetiva.
- Destaque para saldo positivo/negativo.
- Indicação de valores comprometidos e disponíveis.
- Visão de despesas por categoria sem excesso visual.
- Base futura para recomendações simples sobre saldo restante.

### Jornada 5: Erro, dúvida ou dado inconsistente

Ana apagou uma recorrência e depois percebeu que o balanço ainda parece considerar aquele valor. Em outro momento, ela edita uma despesa e o dado volta após recarregar. Ela começa a desconfiar do app.

Nessa jornada, o Deu Bom precisa proteger a confiança. A aplicação deve explicar o que será alterado antes de ações destrutivas, mostrar feedback claro após operações e garantir que dados removidos não continuem nos cálculos. Quando algo falhar, a mensagem precisa orientar a ação seguinte em vez de apenas dizer “erro”.

O momento de recuperação acontece quando Ana consegue entender o problema, corrigir a ação e voltar a confiar nos números.

Requisitos revelados:
- Confirmações claras para exclusão e alteração de recorrência.
- Feedback de sucesso e erro em todas as mutações críticas.
- Persistência correta após reload.
- Cálculos atualizados após edição/exclusão.
- Estados vazios e mensagens de erro compreensíveis.
- QA dedicado para recorrências, workspace, cálculo e persistência.

### Journey Requirements Summary

As jornadas revelam cinco áreas essenciais de capacidade:

1. **Entrada guiada de dados financeiros:** o usuário precisa saber exatamente como começar e onde cadastrar receitas, despesas, recorrências e parcelas.

2. **Confiança nos cálculos:** balanço, saldo, valores positivos/negativos e recorrências precisam refletir os dados reais sem resíduos de itens apagados.

3. **Gestão segura de recorrências:** criar, editar e excluir séries exige escopo explícito e feedback claro.

4. **Workspace confiável:** uso individual, familiar, equipe e empresa exige separação de contexto, permissões e clareza visual.

5. **UX orientativa:** cada tela deve reduzir dúvida, mostrar o próximo passo e evitar excesso de dados, cores e decisões.

## Domain-Specific Requirements

### Compliance & Regulatory

O produto deve ser tratado como app de finanças pessoais, não como instituição financeira, meio de pagamento, consultoria de investimento regulada ou custodiante de valores. O app não deve prometer retorno financeiro, executar movimentações bancárias, realizar investimentos em nome do usuário ou apresentar recomendações como aconselhamento financeiro profissional.

Requisitos:
- Comunicar recomendações futuras como orientação educativa, não como promessa de rendimento.
- Evitar linguagem que caracterize consultoria financeira personalizada regulada.
- Proteger dados pessoais e financeiros do usuário.
- Manter separação clara entre dados individuais e dados de workspace compartilhado.
- Permitir que o usuário entenda e controle seus próprios dados.

### Technical Constraints

Dados financeiros exigem alta confiança operacional. O sistema deve priorizar consistência, persistência e previsibilidade acima de efeitos visuais ou automações complexas.

Requisitos:
- Toda mutação crítica deve ter feedback claro de sucesso ou erro.
- Após criar, editar ou excluir dados financeiros, o app deve refletir o estado persistido.
- Cálculos financeiros devem ser derivados de dados confiáveis e atualizados.
- Exclusões devem remover o impacto do dado excluído nos balanços.
- Recorrências devem preservar datas, escopo e relacionamento entre itens da série.
- Workspaces devem filtrar dados pelo contexto correto.
- Rotas autenticadas devem continuar protegidas.
- Operações sensíveis devem evitar estados otimistas que possam contradizer o backend.

### Integration Requirements

O app usa Supabase como camada principal de autenticação, persistência e workspace. Integrações futuras devem respeitar a fonte de verdade do domínio financeiro.

Requisitos:
- Supabase deve permanecer como fonte persistente para dados financeiros e de workspace.
- A `financeStore` deve continuar concentrando operações principais de transações, categorias, budgets e settings.
- Importação/exportação deve validar dados antes de alterar registros existentes.
- Integrações futuras de calendário, relatório, pagamento ou investimento não devem alterar cálculos financeiros sem validação explícita.
- Qualquer integração que envolva dados financeiros deve respeitar o workspace ativo.

### Risk Mitigations

Riscos principais:
- Usuário perder confiança por cálculo incorreto.
- Recorrência aparecer em data errada ou não aparecer.
- Dado apagado continuar contabilizando.
- Dado excluído ou atualizado voltar após reload.
- Workspace misturar informações de usuários ou contextos.
- Recomendação futura ser entendida como promessa financeira.
- Interface gerar erro de interpretação por excesso visual ou copy ambígua.

Mitigações:
- Criar QA focado em CRUD financeiro, recorrências, workspace e balanço.
- Validar dados após mutações críticas usando refresh/reconsulta.
- Adicionar testes para store financeira antes de expandir features inteligentes.
- Usar linguagem simples e cautelosa em orientações sobre guardar ou investir.
- Manter confirmações explícitas em ações destrutivas.
- Monitorar feedbacks ligados a cálculo, confiança e entendimento da tela.

## Web App/PWA Specific Requirements

### Project-Type Overview

O Deu Bom - Finanças Sem Erro deve continuar como um web app/PWA autenticado, com experiência mobile-first, responsiva e utilizável em múltiplos navegadores e dispositivos. O produto principal fica protegido por login, enquanto a estratégia de crescimento deve considerar uma camada pública forte para SEO, aquisição de usuários e educação financeira.

O app deve funcionar bem em mobile, desktop e tablet, cobrindo navegadores modernos de uso comum. A experiência precisa manter clareza visual, desempenho consistente e confiabilidade nos fluxos financeiros críticos.

### Technical Architecture Considerations

O app deve preservar a arquitetura atual baseada em React, Vite, TypeScript, Supabase, Zustand, React Query, Tailwind e shadcn/ui. O produto deve continuar separando rotas públicas e autenticadas, mantendo dados financeiros protegidos atrás de autenticação.

Requisitos:
- Manter o app principal como SPA/PWA autenticado.
- Proteger rotas financeiras com autenticação.
- Planejar uma camada pública indexável para SEO, aquisição e educação.
- Preservar comportamento responsivo em mobile, desktop e tablet.
- Suportar navegadores modernos relevantes.
- Revalidar dados após operações críticas.
- Adicionar lembretes/requisitos explícitos de atualização de dados quando informações puderem ficar defasadas.
- Evitar que dados financeiros protegidos sejam expostos em páginas públicas ou metadados indexáveis.

### Browser Matrix & Platform Support

O produto deve mirar suporte multiplataforma e multinavegador.

Prioridades:
- Mobile Android em Chrome.
- iPhone em Safari.
- Desktop em Chrome, Edge, Firefox e Safari.
- Tablets em orientação vertical e horizontal.
- Instalação PWA quando suportada pelo navegador.

Critérios:
- Layouts não podem quebrar em telas pequenas.
- Elementos de ação devem continuar acessíveis em mobile.
- Navegação inferior e áreas seguras devem respeitar dispositivos móveis.
- Desktop deve aproveitar largura adicional sem espalhar informação demais.
- Funcionalidades críticas não devem depender de recurso exclusivo de um navegador.

### Responsive Design

A experiência deve ser mobile-first, mas não mobile-only. O usuário precisa conseguir administrar dados financeiros com conforto no celular e revisar informações com mais amplitude em desktop.

Requisitos:
- Dashboard, Transactions, Budgets, Analytics, Settings e Festômetro devem manter hierarquia clara em todos os tamanhos.
- Cards e blocos métricos devem ser compactos, legíveis e sem excesso visual.
- Formulários devem ser fáceis de preencher no celular.
- Tabelas, listas e filtros devem se adaptar sem gerar rolagem confusa.
- Textos, botões e estados vazios não devem sobrepor ou quebrar layout.

### Performance Targets

O app deve transmitir sensação de rapidez e estabilidade, especialmente nos fluxos financeiros principais.

Metas:
- Abertura inicial rápida o suficiente para não parecer pesada.
- Dashboard sem lentidão perceptível.
- Troca de mês sem travamento.
- Cadastro, edição e exclusão de transações concluídos em poucos segundos.
- Feedback imediato de carregamento, sucesso ou erro.
- Listas de transações utilizáveis mesmo com volume crescente de dados.
- Build de produção monitorado para evitar crescimento excessivo de bundle.
- PWA não deve servir estado antigo de forma confusa após atualizações.

### SEO Strategy

Como o app autenticado não é naturalmente indexável, a estratégia de SEO deve focar em páginas públicas e conteúdo de aquisição.

Requisitos:
- Criar ou planejar uma landing page pública forte para o Deu Bom.
- Garantir title, description, Open Graph e Twitter metadata corretos.
- Produzir conteúdo público sobre controle financeiro simples, recorrências, orçamento mensal, organização de grana e redução de ansiedade financeira.
- Criar FAQ público com linguagem próxima do público-alvo.
- Usar copy clara com termos que usuários reais pesquisariam.
- Não expor dados do app autenticado em conteúdo indexável.
- Considerar estrutura futura para blog, guias ou páginas educativas.

### Accessibility Level

A meta de acessibilidade deve mirar WCAG como referência formal, com implementação progressiva.

Requisitos:
- Contraste adequado entre texto, fundo, ícones e estados.
- Navegação por teclado nos fluxos principais.
- Labels compreensíveis em formulários.
- Estados de erro e sucesso legíveis por texto, não apenas cor.
- Hierarquia semântica consistente em páginas.
- Botões e áreas clicáveis com tamanho adequado para toque.
- Compatibilidade razoável com leitores de tela nos fluxos principais.
- Animações não devem prejudicar leitura ou uso.

### Implementation Considerations

Antes de novas features grandes, o projeto deve estabilizar qualidade de web app: lint focado no app, build confiável, QA de fluxos críticos e revisão visual/responsiva.

Considerações:
- Ajustar lint para ignorar artefatos de agentes e validar corretamente o app.
- Criar checklist de QA para mobile, desktop e navegadores principais.
- Validar PWA após mudanças que afetem cache ou atualização.
- Revisar SEO público separadamente do app autenticado.
- Garantir que alterações visuais respeitem simplicidade, legibilidade e ausência de excesso.

## Product Scope & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** MVP de confiabilidade e clareza operacional. A próxima fase deve provar que o usuário consegue cadastrar, atualizar, excluir, revisar e confiar nos dados financeiros essenciais sem dúvida sobre cálculos, recorrências ou persistência.

**Resource Requirements:** O MVP exige capacidade de produto/UX, frontend React, integração Supabase, revisão de dados financeiros e QA. Mesmo que uma pessoa execute grande parte do trabalho, as competências necessárias são: engenharia frontend, modelagem de fluxo financeiro, teste funcional, revisão visual responsiva e validação de acessibilidade básica rumo a WCAG.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Começar do zero cadastrando receitas e despesas.
- Visualizar balanço mensal positivo ou negativo.
- Criar, editar e excluir transações com segurança.
- Controlar recorrências e parcelas sem erro de data, escopo ou cálculo.
- Usar workspace individual ou compartilhado sem mistura de dados.
- Entender feedbacks de sucesso, erro, vazio e carregamento.

**Must-Have Capabilities:**
- CRUD confiável de receitas e despesas.
- Persistência correta após reload.
- Cálculo correto de saldo, receitas, despesas, pendências e balanço mensal.
- Recorrências e parcelas apresentadas nos meses corretos.
- Edição e exclusão com escopo claro: item único, futuros ou série inteira.
- Feedback claro para mutações críticas.
- UX/UI organizada em Dashboard, Transactions, Budgets, Analytics, Settings e Festômetro.
- Lint ajustado para validar somente arquivos relevantes do app.
- Build de produção passando.
- Checklist de QA para fluxos financeiros críticos.
- Compatibilidade responsiva em mobile, desktop e tablet.
- Base de acessibilidade alinhada progressivamente a WCAG.

### Post-MVP Features

**Phase 2 (Post-MVP):**
- Melhorias de importação/exportação com validação mais robusta.
- Recomendações simples sobre dinheiro restante.
- Orientações educativas sobre guardar, separar ou investir.
- Dashboard mais orientativo sem excesso de dados.
- Relatórios de tendência financeira.
- Permissões de workspace mais explícitas.
- Coleta estruturada de feedback.
- Página pública inicial com SEO forte.

**Phase 3 (Expansion):**
- Conteúdo público contínuo: blog, guias, FAQ e educação financeira.
- Recursos premium ou planos pagos.
- Recomendações financeiras mais avançadas, sempre com linguagem educativa e cautelosa.
- Automações inteligentes para categorização, alertas ou previsão.
- Métricas de engajamento, retenção e intenção de pagamento.
- Expansão de uso para família, equipes e pequenas empresas com controles mais refinados.

### Risk Mitigation Strategy

**Technical Risks:** O maior risco técnico é inconsistência em dados financeiros. Mitigação: revalidar dados após mutações críticas, testar store financeira, revisar recorrências, validar workspace e impedir que dados apagados continuem nos cálculos.

**Market Risks:** O maior risco de mercado é o usuário não perceber valor rápido ou abandonar por complexidade. Mitigação: onboarding simples, primeira experiência focada em cadastrar dados essenciais e dashboard que mostre valor logo após os primeiros lançamentos.

**Resource Risks:** O maior risco de recurso é tentar fazer SEO, monetização, recomendações e QA profundo ao mesmo tempo. Mitigação: priorizar MVP confiável primeiro; depois crescer em camadas. Se o escopo precisar encolher, manter apenas CRUD financeiro, balanço mensal, recorrências, persistência, feedback e QA mínimo.

## Functional Requirements

### Gestão de Conta e Acesso

- FR1: Usuários podem criar conta e acessar o app com autenticação.
- FR2: Usuários autenticados podem acessar áreas financeiras protegidas.
- FR3: Usuários podem recuperar ou redefinir acesso quando necessário.
- FR4: Usuários podem editar informações básicas do próprio perfil.
- FR5: O sistema pode impedir acesso não autenticado a dados financeiros.

### Entrada e Manutenção de Dados Financeiros

- FR6: Usuários podem cadastrar receitas.
- FR7: Usuários podem cadastrar despesas.
- FR8: Usuários podem atualizar receitas existentes.
- FR9: Usuários podem atualizar despesas existentes.
- FR10: Usuários podem excluir receitas existentes.
- FR11: Usuários podem excluir despesas existentes.
- FR12: Usuários podem classificar receitas e despesas por categoria.
- FR13: Usuários podem definir data, valor, descrição, status e observações em lançamentos financeiros.
- FR14: Usuários podem visualizar feedback de sucesso ou erro após ações financeiras críticas.

### Recorrências, Parcelas e Séries

- FR15: Usuários podem criar lançamentos recorrentes.
- FR16: Usuários podem criar lançamentos parcelados.
- FR17: Usuários podem visualizar recorrências e parcelas nos meses correspondentes.
- FR18: Usuários podem editar uma única ocorrência de uma série.
- FR19: Usuários podem editar ocorrências futuras de uma série.
- FR20: Usuários podem editar uma série inteira.
- FR21: Usuários podem excluir uma única ocorrência de uma série.
- FR22: Usuários podem excluir ocorrências futuras de uma série.
- FR23: Usuários podem excluir uma série inteira.
- FR24: O sistema pode explicar o impacto de alterações ou exclusões em séries antes da confirmação.

### Balanço, Dashboard e Leitura Financeira

- FR25: Usuários podem visualizar o balanço mensal com receitas, despesas e saldo.
- FR26: Usuários podem identificar se o mês está positivo ou negativo.
- FR27: Usuários podem visualizar valores pendentes e concluídos.
- FR28: Usuários podem navegar entre meses financeiros.
- FR29: Usuários podem visualizar lançamentos recentes.
- FR30: Usuários podem entender quais dados compõem os totais exibidos.
- FR31: Usuários podem visualizar categorias ou agrupamentos que expliquem a composição dos gastos.
- FR32: O sistema pode apresentar estados vazios orientativos quando não houver dados suficientes.

### Orçamentos e Planejamento

- FR33: Usuários podem criar orçamentos por categoria.
- FR34: Usuários podem atualizar orçamentos existentes.
- FR35: Usuários podem remover orçamentos existentes.
- FR36: Usuários podem comparar gastos realizados com limites definidos.
- FR37: Usuários podem visualizar sinais de estouro ou proximidade do limite de orçamento.
- FR38: Usuários podem acompanhar metas ou objetivos financeiros simples quando disponíveis.

### Workspace e Uso Compartilhado

- FR39: Usuários podem criar ou acessar um workspace financeiro.
- FR40: Usuários podem alternar entre contexto pessoal e contexto compartilhado quando aplicável.
- FR41: Usuários podem convidar outras pessoas para um workspace.
- FR42: Usuários convidados podem aceitar convite para participar de um workspace.
- FR43: Usuários podem visualizar qual workspace está ativo.
- FR44: O sistema pode separar dados financeiros por usuário e workspace.
- FR45: O sistema pode aplicar permissões diferentes para leitura, edição e administração.
- FR46: Administradores de workspace podem gerenciar informações básicas do workspace.

### Importação, Exportação e Controle de Dados

- FR47: Usuários podem exportar dados financeiros.
- FR48: Usuários podem importar dados financeiros.
- FR49: O sistema pode validar dados importados antes de alterar registros existentes.
- FR50: Usuários podem limpar ou remover dados de um contexto com confirmação explícita.
- FR51: O sistema pode preservar consistência dos cálculos após importação, exclusão ou limpeza de dados.

### Orientação, Copy e Experiência Guiada

- FR52: O sistema pode orientar usuários sobre o primeiro passo para começar do zero.
- FR53: O sistema pode explicar termos financeiros e estados principais em linguagem simples.
- FR54: O sistema pode indicar quando dados estão incompletos para uma leitura confiável.
- FR55: O sistema pode apresentar mensagens de erro acionáveis.
- FR56: O sistema pode orientar o usuário sobre o que fazer com dinheiro restante em versões futuras.
- FR57: O sistema pode apresentar conteúdo educativo público em versões futuras.

### SEO, Aquisição e Conteúdo Público

- FR58: Visitantes podem acessar páginas públicas sobre o produto.
- FR59: Visitantes podem entender a proposta de valor antes de criar conta.
- FR60: O sistema pode expor metadados públicos adequados para buscadores e compartilhamento social.
- FR61: O sistema pode publicar conteúdo educativo indexável sobre finanças pessoais.
- FR62: Visitantes podem acessar FAQ, guias ou páginas informativas em versões futuras.
- FR63: Dados financeiros autenticados não podem aparecer em páginas públicas.

### QA, Suporte e Confiabilidade Operacional

- FR64: O sistema pode suportar checklist de QA para fluxos financeiros críticos.
- FR65: O sistema pode ser validado quanto a cadastro, atualização, exclusão, recorrências, workspace e balanço.
- FR66: Usuários podem perceber quando uma ação falhou e o que fazer em seguida.
- FR67: O sistema pode manter dados consistentes após recarregamento.
- FR68: O sistema pode evitar que dados apagados continuem influenciando cálculos.
- FR69: O sistema pode ser revisado em diferentes tamanhos de tela e navegadores.

### Primeira Experiência e Ativação

- FR70: Usuários novos podem receber orientação inicial sobre quais dados cadastrar primeiro.
- FR71: Usuários novos podem entender a diferença entre receita, despesa, recorrência, parcela, orçamento e saldo.
- FR72: Usuários podem visualizar um primeiro balanço útil após cadastrar dados financeiros mínimos.
- FR73: O sistema pode indicar quais dados ainda faltam para melhorar a confiabilidade da leitura mensal.

### Explicabilidade e Confiança nos Números

- FR74: Usuários podem ver quais lançamentos compõem um total financeiro exibido.
- FR75: Usuários podem identificar quando um valor inclui lançamentos recorrentes, parcelados, pendentes ou concluídos.
- FR76: O sistema pode alertar quando uma visualização financeira estiver incompleta ou desatualizada.
- FR77: O sistema pode mostrar o efeito esperado de uma alteração antes de confirmar ações críticas.
- FR96: Usuários podem distinguir receitas/despesas planejadas, pendentes e efetivamente concluídas quando esses estados forem usados nos cálculos.
- FR97: O sistema pode indicar quando uma recomendação financeira é educativa e não substitui aconselhamento profissional.
- FR98: Usuários podem compreender o impacto de importações, limpezas ou exclusões em massa antes da confirmação.

### Auditoria, Recuperação e Diagnóstico

- FR78: Usuários podem receber orientação sobre como resolver falhas em ações financeiras.
- FR79: O sistema pode diferenciar falha de conexão, falha de permissão, falha de validação e falha inesperada.
- FR80: Administradores ou usuários autorizados podem revisar ações críticas recentes quando necessário.
- FR81: O sistema pode impedir operações destrutivas sem confirmação explícita.
- FR82: O sistema pode preservar rastreabilidade suficiente para investigar inconsistências de dados.

### Workspace e Contexto Ativo

- FR83: Usuários podem identificar claramente se estão no contexto pessoal, familiar, de equipe ou empresa.
- FR84: O sistema pode alertar quando uma ação será aplicada a um workspace compartilhado.
- FR85: Usuários podem compreender seu nível de permissão dentro de um workspace.
- FR86: O sistema pode bloquear ações incompatíveis com a permissão do usuário.

### SEO, Conversão e Aquisição

- FR87: Visitantes podem acessar uma página pública otimizada para entender o problema que o Deu Bom resolve.
- FR88: Visitantes podem iniciar cadastro ou login a partir das páginas públicas.
- FR89: O sistema pode apresentar conteúdo público sem exigir autenticação.
- FR90: O sistema pode manter separação entre conteúdo educativo público e dados financeiros privados.
- FR91: O sistema pode oferecer chamadas claras para conversão em páginas públicas.

### Qualidade, QA e Validação

- FR92: O sistema pode ser validado por checklist de QA antes de liberar mudanças em fluxos financeiros.
- FR93: O sistema pode ser validado em cenários de recorrência, parcela, exclusão, atualização, reload e workspace.
- FR94: O sistema pode ser validado em navegadores e tamanhos de tela prioritários.
- FR95: O sistema pode registrar ou documentar resultados de validações críticas.

## Non-Functional Requirements

### Performance

- NFR1: O app deve abrir e permitir interação inicial sem sensação de lentidão em conexões comuns de mobile e desktop.
- NFR2: Trocas de mês, filtros e navegação entre abas principais não devem causar travamentos perceptíveis.
- NFR3: Cadastro, atualização e exclusão de transações devem fornecer feedback visual imediato e concluir em poucos segundos em condições normais.
- NFR4: Dashboard, Transactions, Budgets, Analytics, Settings e Festômetro devem permanecer utilizáveis com volume crescente de transações.
- NFR5: O build de produção deve ser monitorado para evitar crescimento excessivo de bundle e degradação da experiência inicial.
- NFR6: O PWA não deve apresentar conteúdo antigo de forma confusa após atualização de versão.

### Security & Privacy

- NFR7: Dados financeiros devem ficar acessíveis apenas a usuários autenticados e autorizados.
- NFR8: Dados de workspace devem ser isolados por contexto e permissão.
- NFR9: Rotas financeiras devem permanecer protegidas contra acesso não autenticado.
- NFR10: Páginas públicas e metadados indexáveis não devem expor dados financeiros privados.
- NFR11: Operações destrutivas devem exigir confirmação explícita.
- NFR12: Recomendações financeiras futuras devem usar linguagem educativa e não prometer retorno, investimento ou aconselhamento profissional.
- NFR13: Dados importados devem ser validados antes de alterar registros persistidos.

### Reliability & Data Integrity

- NFR14: Após criar, editar ou excluir dados financeiros, o estado exibido deve refletir o estado persistido.
- NFR15: Dados excluídos não devem continuar influenciando balanços, saldos ou relatórios.
- NFR16: Recorrências e parcelas devem preservar datas, valores, escopo e relacionamento entre itens da série.
- NFR17: Reload do app não deve restaurar dados já excluídos ou desfazer alterações concluídas.
- NFR18: Falhas de conexão, permissão, validação e erro inesperado devem produzir mensagens distinguíveis e acionáveis.
- NFR19: Fluxos críticos devem ser cobertos por checklist de QA antes de mudanças relevantes serem liberadas.
- NFR20: O sistema deve manter rastreabilidade suficiente para investigar inconsistências em dados críticos.

### Accessibility

- NFR21: O produto deve mirar WCAG como referência formal de acessibilidade, com evolução progressiva.
- NFR22: Textos, ícones, botões e estados devem manter contraste adequado.
- NFR23: Formulários financeiros devem ter labels compreensíveis.
- NFR24: Estados de erro e sucesso devem ser comunicados por texto, não apenas por cor.
- NFR25: Fluxos principais devem ser utilizáveis por teclado em nível funcional.
- NFR26: Botões e áreas de toque devem ter tamanho adequado para uso em mobile.
- NFR27: Animações não devem prejudicar leitura, foco ou conclusão de tarefas.

### Scalability

- NFR28: A arquitetura deve suportar crescimento gradual de usuários, workspaces e volume de transações sem exigir reescrita imediata.
- NFR29: Listagens e cálculos devem considerar aumento progressivo de dados financeiros por usuário.
- NFR30: A estratégia pública de SEO deve ser separada do app autenticado para permitir crescimento de aquisição sem comprometer dados privados.
- NFR31: Funcionalidades premium ou futuras devem ser planejadas sem quebrar o núcleo gratuito/confiável do app.

### SEO & Public Acquisition

- NFR32: Páginas públicas devem ter title, description e metadados sociais adequados.
- NFR33: Conteúdo público deve usar linguagem próxima do público-alvo e termos pesquisáveis.
- NFR34: A experiência pública deve comunicar rapidamente o problema resolvido e direcionar visitantes para cadastro ou login.
- NFR35: SEO público deve ser medido separadamente da experiência autenticada.

### Integration & Data Operations

- NFR36: Supabase deve permanecer fonte persistente confiável para dados financeiros e workspace.
- NFR37: Integrações futuras não devem alterar dados financeiros sem validação explícita.
- NFR38: Importação/exportação deve preservar consistência de categorias, transações, recorrências e workspace.
- NFR39: Operações em contexto compartilhado devem respeitar o workspace ativo.
- NFR40: Qualquer cache, PWA ou estado local deve ser invalidado ou atualizado quando puder deixar dados financeiros defasados.
