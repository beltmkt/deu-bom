# BMAD Workspace

Este diretorio concentra o mapa vivo do produto para manter continuidade entre sessoes.

## Arquivos

- `current-state.md`: o que existe hoje, o que foi ajustado e quais riscos ainda restam
- `roadmap.md`: proxima fila de evolucao, organizada por prioridade
- `work-log.md`: marco rapido do que ja foi feito e do que precisa ser retomado
- `voice-command-capability-map.md`: inventario operacional de campos, modulos, aliases e comandos de voz
- `voice-command-implementation-plan.md`: fases recomendadas para implementar voz com seguranca
- `voice-command-intent-contract.md`: contrato tecnico de `VoiceIntent`, parser, resolver, confirmacao e executor
- `voice-command-test-matrix.md`: matriz Given/When/Then para validar comandos por modulo

## Como usar

1. Atualizar `work-log.md` ao concluir uma frente relevante.
2. Revisar `roadmap.md` antes de abrir uma nova frente.
3. Manter `current-state.md` coerente com a realidade do app e da base.
4. Para comandos de voz, comecar pelo mapa operacional e depois seguir plano, contrato e matriz de testes.
