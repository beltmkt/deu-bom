# Contrato tecnico de intents de voz

Este contrato estabiliza a comunicacao entre captura, parser, resolver, confirmacao e executor. O objetivo e permitir evolucao incremental sem acoplar cada tela a regexes proprias.

## Camadas

| Camada | Arquivo sugerido | Responsabilidade |
| --- | --- | --- |
| Captura | `src/hooks/useVoiceCommand.ts` | Web Speech API, transcript parcial/final, permissao e erros de microfone. |
| Parser | `src/services/voiceCommandParser.ts` | Converter texto em `VoiceIntent` sem tocar em estado externo. |
| Resolver | `src/services/voiceCommandResolver.ts` | Encontrar entidades candidatas no estado atual. |
| Confirmacao | `src/components/VoiceCommandConfirmSheet.tsx` | Mostrar resumo, ambiguidades, risco e escopo. |
| Executor | `src/services/voiceCommandExecutor.ts` | Chamar store, Supabase, localStorage ou navegacao. |

## Tipos base

```ts
export type VoiceDomain =
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

export type VoiceAction =
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

export type VoiceRisk = 'none' | 'low' | 'medium' | 'high';
export type VoiceScope = 'single' | 'future' | 'all';

export interface VoiceIntent {
  domain: VoiceDomain;
  action: VoiceAction;
  target?: string;
  fields: Record<string, unknown>;
  scope?: VoiceScope;
  confidence: number;
  requiresConfirmation: boolean;
  risk: VoiceRisk;
  transcript: string;
}
```

## Resultado de resolucao

```ts
export interface VoiceCandidate {
  id: string;
  label: string;
  description?: string;
  score: number;
  domain: VoiceDomain;
  data?: unknown;
}

export interface VoiceResolution {
  intent: VoiceIntent;
  candidates: VoiceCandidate[];
  selectedCandidateId?: string;
  needsChoice: boolean;
  needsMoreDetail: boolean;
  missingFields: string[];
}
```

## Regras de risco

| Risco | Quando usar | Comportamento |
| --- | --- | --- |
| `none` | Navegar, buscar, filtrar, preencher rascunho | Pode executar sem confirmacao se confianca alta. |
| `low` | Criar rascunho ou marcar item unico como comprado | Mostrar resumo curto ou aplicar se reversivel. |
| `medium` | Atualizar dados persistidos, exportar dados, convidar pessoa | Confirmacao visual obrigatoria. |
| `high` | Excluir, limpar lista, importar, limpar dados, alterar serie | Confirmacao forte obrigatoria e resumo de impacto. |

## Regras de confianca

- `confidence >= 0.85`: alta confianca.
- `0.6 <= confidence < 0.85`: revisar antes de executar.
- `< 0.6`: pedir mais detalhe.
- Destrutivo sempre confirma, mesmo com alta confianca.

## Parser

Entrada:

```ts
parseVoiceCommand(transcript, {
  preferredDomain,
  currentRoute,
  visibleContext,
});
```

Saida:

- `VoiceIntent | null`
- O parser nao deve consultar Supabase, Zustand ou localStorage.
- O parser deve normalizar acentos e sinonimos.
- O parser deve preservar `transcript` original.

## Resolver

Entrada:

```ts
resolveVoiceIntent(intent, {
  route,
  transactions,
  categories,
  shoppingItems,
  events,
  eventItems,
  participants,
  goals,
  settings,
});
```

Pontuacao:

- Match exato de nome: +50.
- Nome contem termo falado: +30.
- Entidade visivel na tela atual: +20.
- Valor mencionado bate: +15.
- Data ou mes selecionado bate: +15.
- Categoria/status mencionado bate: +10.

Resultado:

- 1 candidato forte: pode seguir para confirmacao/executor.
- 2 a 5 candidatos: `needsChoice = true`.
- Mais de 5 candidatos: `needsMoreDetail = true`.
- Campo obrigatorio ausente: preencher `missingFields`.

## Confirm sheet

Deve mostrar:

- Transcript ouvido.
- Acao interpretada.
- Entidade alvo.
- Campos que serao alterados.
- Risco.
- Candidatos quando ambiguo.
- Escopo quando recorrente: `single`, `future`, `all`.

Nao deve executar nada diretamente. Ela retorna uma decisao:

```ts
type VoiceDecision =
  | { status: 'confirm'; intent: VoiceIntent; candidateId?: string; scope?: VoiceScope }
  | { status: 'cancel' }
  | { status: 'needs-more-detail'; message: string };
```

## Executor

O executor chama a camada correta:

- `transactions`, `categories`, `budgets`, `settings`: `useFinanceStore`.
- `shopping`: estado da tela ou futuro store da lista.
- `events`, `event_items`, `event_participants`, `goals`: Supabase via servico/hook dedicado.
- `navigation`: `react-router-dom`.
- `settings/workspace/profile`: hooks existentes e Supabase RPC quando ja houver fluxo.

Regras:

- Nunca executa se `requiresConfirmation` for true sem decisao confirmada.
- Nunca altera serie financeira sem `scope`.
- Nunca ignora permissao de workspace.
- Sempre retorna sucesso/erro com mensagem para toast.

## Compatibilidade com MVP atual

Enquanto o contrato novo e implementado, `ParsedVoiceCommand` atual pode continuar existindo como adaptador. O primeiro PR deve converter os casos atuais para `VoiceIntent` sem mudar a experiencia do usuario.
