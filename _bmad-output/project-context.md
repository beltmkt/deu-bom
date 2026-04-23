---
project_name: 'Deu Bom Financas sem erro'
user_name: 'Alisson'
date: '2026-04-22'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 22
optimized_for_llm: true
---

# Project Context for AI Agents

_Este arquivo concentra regras criticas e padroes do projeto para manter implementacoes consistentes, enxutas e seguras._

---

## Technology Stack & Versions

- Vite `5.4.19` com React `18.3.1`, TypeScript `5.8.3` e plugin `@vitejs/plugin-react-swc` `3.11.0`
- Tailwind CSS `3.4.17` com `tailwindcss-animate`, tokens em `src/index.css` e componentes `shadcn/ui`
- Estado cliente com Zustand `5.0.9`
- Cache e camada assincroma de dados com React Query `5.83.0`
- Backend e autenticacao com Supabase JS `2.89.0`
- Formularios e validacao com React Hook Form `7.61.1`, Zod `3.25.76` e `@hookform/resolvers`
- PWA com `vite-plugin-pwa` `1.2.0` e `workbox-window` `7.4.0`
- Animacoes com Framer Motion `12.23.26`
- Charts com Recharts `2.15.4`

## Critical Implementation Rules

### Language-Specific Rules

- Use alias `@/` para imports internos; evite cadeias longas de imports relativos.
- O `tsconfig.json` e permissivo (`allowJs: true`, `noImplicitAny: false`, `strictNullChecks: false`), mas codigo novo deve continuar tipado de forma explicita quando o custo for baixo.
- Preserve o padrao dominante de funcoes e componentes em arrow functions.
- Prefira `type` para unions e aliases simples e `interface` para objetos de dominio compartilhados.
- Mantenha datas de negocio no formato ISO `yyyy-MM-dd`; o projeto usa `date-fns` com `parseISO`, `format`, `startOfMonth` e afins.
- Nao introduza `any`, `@ts-ignore` ou coercao silenciosa sem necessidade real; quando houver incerteza em dados externos, valide primeiro com Zod.

### Framework-Specific Rules

- O app e montado por providers em cascata: `QueryClientProvider` -> `ThemeProvider` -> `TooltipProvider` -> `AuthProvider` -> `WorkspaceProvider`; novas features globais devem respeitar essa hierarquia.
- Rotas autenticadas devem continuar encapsuladas por `ProtectedRoute`; excecoes atuais sao apenas `/auth`, `/accept-invite` e `/reset-password`.
- Use componentes funcionais e hooks locais; mantenha logica compartilhada fora das paginas em `hooks/`, `stores/`, `utils/` ou `services/`.
- `src/components/ui/` contem primitives do shadcn; prefira compor esses componentes em wrappers locais em vez de duplicar UI base.
- Para feedback assincromo use os toasts existentes (`sonner` ou toaster atual) e exponha estados de carregamento visiveis.
- Preserve a proposta mobile-first: safe area inferior, botao flutuante, navegacao inferior e densidade visual enxuta fazem parte da UX principal.

### Data, State & Supabase Rules

- A `financeStore` e a fonte de verdade do dominio financeiro; escrita em transacoes, categorias, budgets e configuracoes deve passar pelos metodos do store.
- Apos mutacoes no Supabase, revalide com `refreshData()` ou siga o mesmo padrao ja adotado no store.
- Series recorrentes dependem de `groupId` e `parentTransactionId`; alteracoes em lote devem preservar o escopo `single`, `future` ou `all`.
- Em updates e deletes de series, mantenha as validacoes de quantidade/ids afetados para evitar operacoes parciais silenciosas.
- Sempre considere o contexto de workspace: se houver `current_workspace_id`, filtre por ele; sem workspace, use registros do usuario com `workspace_id` nulo.
- `src/integrations/supabase/client.ts` e `src/integrations/supabase/types.ts` sao gerados/derivados da integracao; nao edite manualmente sem necessidade clara.

### UI & Styling Rules

- Use tokens semanticos do tema (`primary`, `income`, `expense`, `pending`, `muted`, `card`, `border`) em vez de cores hardcoded, exceto em cores dinamicas de categoria.
- Preserve o estilo visual recente: cards arredondados, contraste suave, pouca poluicao, texto curto e foco em leitura rapida.
- Reaproveite utilitarios existentes como `cn()` e componentes de superficie antes de criar novas variantes de layout.
- Em telas novas, mantenha responsividade primeiro para mobile e depois expanda para desktop; nao trate desktop como layout principal.
- Animacao deve reforcar hierarquia e contexto; use Framer Motion com moderacao, sem transformar interacoes simples em efeitos excessivos.

### Testing Rules

- O projeto nao possui runner de testes configurado hoje; nao introduza framework de teste sem demanda explicita.
- Para mudancas de codigo, a validacao minima esperada e `npm run lint` e `npm run build` quando o escopo justificar.
- Se adicionar logica reutilizavel com risco real, prefira manter a funcao pura em `utils/` ou `services/` para facilitar validacao posterior.
- Em fluxos sensiveis, valide manualmente loading, toast de erro, toast de sucesso e impacto em mobile e desktop.

### Code Quality & Style Rules

- Nomeie paginas e componentes em `PascalCase`, hooks em `camelCase` com prefixo `use`, utils e services em `camelCase`.
- Evite duplicar regras de agrupamento, resumo ou filtro de transacoes; reutilize `src/utils/transactionInsights.ts` e utilitarios proximos.
- Mensagens para usuario devem continuar em portugues do app; ao tocar texto existente, evite piorar inconsistencias de encoding ja conhecidas.
- Mantenha comentarios raros e so quando explicarem uma decisao nao obvia; o codigo atual prefere legibilidade estrutural a comentarios abundantes.
- Nao espalhe acesso direto ao Supabase por componentes de UI quando a logica pertencer claramente ao store, hook ou service.

### Development Workflow Rules

- Consulte `docs/bmad/current-state.md` antes de iniciar uma frente relevante para alinhar com o estado real do produto.
- Atualize `docs/bmad/work-log.md` e, se necessario, `docs/bmad/current-state.md` ao concluir uma frente significativa.
- Mudancas devem ser cirurgicas: preserve a linguagem visual nova e nao reverta ajustes do usuario fora do escopo.
- Se uma alteracao impactar PWA, autenticacao, workspace compartilhado ou recorrencia financeira, faca validacao adicional porque essas areas cruzam varias telas.

### Critical Don't-Miss Rules

- Nao reintroduza mutacoes locais otimistas que ignorem o refresh do store; isso ja causou risco de transacoes "voltarem" apos sincronizacao.
- Nao trate transacoes recorrentes como registros independentes quando a acao do usuario claramente pede operacao em serie.
- Nao quebre a separacao entre telas autenticadas e publicas ao adicionar rotas novas.
- Nao duplique estado financeiro em componentes quando o store ja fornece selectors e metodos especializados.
- Nao troque tokens tematicos por valores visuais arbitrarios; isso quebra a coerencia entre dashboard, transactions e telas secundarias.
- Nao assuma UTF-8 limpo em todo o projeto; revise textos visiveis apos editar arquivos que ja mostraram sinais de encoding inconsistente.

---

## Usage Guidelines

**For AI Agents:**

- Leia este arquivo antes de alterar qualquer parte estrutural do app.
- Prefira a opcao mais restritiva quando houver duvida sobre escopo de mutacao em dados financeiros.
- Reuse store, hooks, utils e componentes existentes antes de criar novas camadas.
- Atualize este arquivo quando surgir uma regra de projeto que outros agentes realmente precisam lembrar.

**For Humans:**

- Mantenha este contexto enxuto e focado no que um agente pode perder.
- Atualize versoes e regras sempre que stack, fluxo financeiro ou convencoes mudarem.
- Remova itens que virarem obvios e acrescente apenas restricoes com valor pratico.

Last Updated: 2026-04-22
