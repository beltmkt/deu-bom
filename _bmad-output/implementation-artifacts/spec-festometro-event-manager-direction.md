---
title: 'Festometro como gerenciador completo de eventos'
type: 'product-direction'
created: '2026-04-28'
status: 'implemented'
context:
  - docs/bmad/roadmap.md
  - docs/bmad/current-state.md
  - src/pages/Leisure.tsx
---

## Intent

Transformar o Festometro em um diferencial claro do Deu Bom: um gerenciador completo de eventos que ajuda o usuario a organizar valores entre participantes, calcular o que deve ser comprado e acompanhar quantidades, pagamentos e pendencias sem perder simplicidade.

## Product Direction

- Modo principal: gerenciador completo de eventos.
- Promessa da aba: "planeje o evento, saiba o que comprar e veja quanto cada pessoa paga".
- Tom visual: mais divertido que o restante do app, mas ainda limpo, confiavel e escaneavel.
- Fluxo inicial deve ser rapido: tipo de evento, pessoas, duracao e calcular.
- Nome, data, agenda, percentual infantil e criacao de despesa devem aparecer como etapa posterior ou configuracao avancada.

## Priorities

1. Simplificar a entrada do calculo.
2. Reorganizar resultado como momento principal da experiencia:
   - total estimado
   - valor por adulto
   - valor por crianca, quando aplicavel
   - lista de compras
   - divisao entre participantes
3. Transformar "Eventos" em area de acompanhamento:
   - participantes
   - status pago/pendente
   - itens do evento
   - progresso financeiro do evento
4. Perguntar antes de criar despesa no financeiro ao salvar evento.
5. Mover percentual infantil para configuracao avancada.
6. Expandir tipos de evento de forma minimalista.
7. Incluir lista de compras no roadmap como plus evolutivo.

## Event Type Expansion

Adicionar opcoes organizadas sem excesso visual. Sugestao inicial:

- Churrasco
- Pizza
- Festa geral
- Aniversario
- Happy hour
- Almoco/jantar
- Viagem ou passeio
- Confraternizacao de empresa
- Cha de bebe/casamento
- Evento personalizado

## Advanced Settings

- Percentual infantil.
- Adicionar ao Google Agenda.
- Nome e horario do evento, quando nao forem essenciais para calcular.
- Criar despesa no financeiro.

## Decisions

- Lista de compras com status comprado/pendente fica como nova feature futura.
- Ao salvar evento, o app deve mostrar pergunta e toggle para criar ou nao uma despesa no financeiro.
- Sugestao de consumo deve ser segregada por modo: economico, padrao e generoso.

## Implemented Slice

- Entrada do calculo reorganizada para priorizar tipo de evento, pessoas, duracao e perfil de consumo.
- Opcoes avancadas recolhidas para nome, data, horario, agenda e percentual infantil.
- Tipos de evento expandidos de forma compacta.
- Calculo considera perfil economico/padrao/generoso.
- Confirmacao de salvar evento permite escolher se cria despesa no financeiro.
