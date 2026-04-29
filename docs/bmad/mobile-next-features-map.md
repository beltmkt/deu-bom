# Mapa Mobile: Lista de Compras, Promocoes e Voz

Este mapa registra o necessario para as proximas frentes mobile sem acoplar tudo em uma unica entrega.

## 1. Lista de Compras

Objetivo: criar uma aba mobile para anotar o que sera comprado no mercado, com quantidade, valor previsto, valor real e status.

Entrada de navegacao:
- `src/components/BottomNav.tsx`: adicionar item mobile `Lista` ou `Compras`, usando icone `ShoppingCart` ou `ListChecks`.
- `src/App.tsx`: criar rota autenticada `/shopping-list`.
- `src/pages/ShoppingList.tsx`: nova tela mobile-first.

Modelo de dados recomendado:
- `shopping_lists`: `id`, `user_id`, `workspace_id`, `name`, `status`, `store_name`, `planned_date`, `created_at`, `updated_at`.
- `shopping_list_items`: `id`, `list_id`, `name`, `quantity`, `unit`, `estimated_unit_price`, `actual_unit_price`, `checked`, `category`, `created_at`, `updated_at`.
- RLS seguindo o mesmo padrao de `transactions`, `budgets`, `events` e `purchase_goals`: membros visualizam, editores criam/editam/apagam.

Camada de app:
- `src/types/shopping.ts`: tipos `ShoppingList` e `ShoppingListItem`.
- `src/stores/shoppingStore.ts` ou extensao controlada do `financeStore` se a lista for integrada ao resumo financeiro.
- `src/components/ShoppingItemForm.tsx`: bottom sheet para adicionar/editar item.
- `src/components/ShoppingListItemCard.tsx`: item com checkbox, quantidade, preco estimado e preco real.

Integracao financeira:
- Opcao ao finalizar compra: "Criar despesa em Financas".
- Categoria sugerida: `Alimentacao` ou `Compras`, reaproveitando categorias existentes.
- Data no formato `yyyy-MM-dd`.

## 2. Promocoes e melhores mercados por localizacao

Objetivo: indicar oportunidades perto do usuario sem prometer preco em tempo real quando nao houver fonte confiavel.

Permissoes e privacidade:
- Usar Geolocation API apenas por acao explicita do usuario.
- Guardar preferencia de local aproximado, nao coordenada precisa, salvo decisao clara posterior.
- Exibir estado quando localizacao estiver bloqueada.

Fontes possiveis:
- MVP: cadastro manual de mercado e preco pelo usuario, gerando historico local.
- V2: integracao com APIs de mapas para mercados proximos.
- V3: parceiros, encartes ou scraping autorizado. Evitar scraping sem permissao porque quebra facil e pode violar termos.

Modelo adicional:
- `stores`: `id`, `name`, `address`, `lat`, `lng`, `source`, `created_at`.
- `store_prices`: `id`, `store_id`, `item_name`, `price`, `observed_at`, `source`, `confidence`.
- `shopping_deals`: view ou funcao que compara itens da lista contra historico de precos.

Experiencia mobile:
- Na Lista de Compras, mostrar "Melhor mercado estimado" quando houver dados suficientes.
- Mostrar economia estimada por item e total.
- Sinalizar baixa confianca quando o preco for antigo ou informado por usuario.

## 3. Comando de voz

Objetivo: permitir adicionar, atualizar e apagar dados por voz nos pontos onde o app ja permite CRUD.

Superficie inicial:
- Botao de microfone flutuante nas telas `Financas` e `Lista de Compras`.
- Futuro: reutilizar no `Festometro`, `Metas` quando voltar, e `Config` apenas para comandos seguros.

Arquitetura recomendada:
- `src/hooks/useVoiceCommand.ts`: captura, permissao, estados `idle/listening/processing/error`.
- `src/services/voiceCommandParser.ts`: transforma texto em intencao estruturada.
- `src/services/voiceCommandExecutor.ts`: executa intencoes chamando stores existentes.
- `src/components/VoiceCommandButton.tsx`: componente compartilhado.
- `src/components/VoiceCommandConfirmSheet.tsx`: confirmacao antes de apagar ou alterar valores.

Intencoes minimas:
- `add_transaction`: "adicionar despesa de 45 reais no mercado hoje".
- `update_transaction`: "marcar aluguel como pago" ou "alterar mercado para 120 reais".
- `delete_transaction`: "apagar despesa mercado".
- `add_shopping_item`: "adicionar arroz dois pacotes na lista".
- `update_shopping_item`: "trocar arroz para 25 reais".
- `delete_shopping_item`: "remover arroz da lista".
- `check_shopping_item`: "marcar leite como comprado".

Regras de seguranca:
- Nunca apagar sem confirmacao visual.
- Quando houver mais de um item parecido, pedir escolha.
- Para transacoes recorrentes, respeitar escopo `single`, `future` ou `all`.
- Toasts em portugues para sucesso, erro e comando ambiguo.

Dependencias tecnicas:
- Web Speech API pode cobrir MVP em navegadores compativeis.
- Para maior confiabilidade, considerar backend/Edge Function com STT/LLM posteriormente.
- Parser deve retornar JSON validado com Zod antes de executar qualquer mutacao.
