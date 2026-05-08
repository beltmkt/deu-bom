# Automacao Supramail - Recorte BMAD

## Objetivo

Criar uma primeira plataforma manual para preparar o provisionamento de clientes na API Revenda Supramail, deixando o fluxo pronto para review dos devs antes da integracao automatica com o CRM.

## Fluxo operacional

1. Coletar token manualmente na tela.
2. Criar cliente com nome da empresa e dominio normalizado sem `www`.
3. Criar plano padrao `10 GB + 3 meses`, contrato unico e limite padrao de 10 contas.
4. Preparar DNS com:
   - `A`, host vazio, valor `13.36.107.196`.
   - `CNAME`, host `www`, valor `crm-prod-1078073624.eu-west-3.elb.amazonaws.com`.
   - `CNAME` gerado pela ferramenta, com host e apontamento enviados ao payload de provisionamento.
5. Gerar e-mails em massa a partir de nome e sobrenome, no formato `nome_sobrenome@dominio`.
6. Usar senha padrao `c2s@2026`.
7. Habilitar dominio e ativar DKIM via endpoints de sessao web do painel.

## API confirmada no trecho recebido

Base URL: `https://painel.supramail.com.br:5052/_REST/resellersAPI`

Todas as chamadas usam `POST` com `Content-Type: application/x-www-form-urlencoded`.

Endpoints implementados na primeira automacao real:

```bash
curl --location 'https://painel.supramail.com.br:5052/_REST/resellersAPI/createClient' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'token=SEU_TOKEN' \
--data-urlencode 'APIid=teste' \
--data-urlencode 'clientName=Teste'
```

```bash
curl --location 'https://painel.supramail.com.br:5052/_REST/resellersAPI/createDomain' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'token=SEU_TOKEN' \
--data-urlencode 'APIid=teste' \
--data-urlencode 'domain=teste.com' \
--data-urlencode 'plan=COLAB25G' \
--data-urlencode 'contract=contrato' \
--data-urlencode 'accounts=10'
```

```bash
curl --location 'https://painel.supramail.com.br:5052/_REST/resellersAPI/addDNSRegistry' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'token=SEU_TOKEN' \
--data-urlencode 'domain=teste.com' \
--data-urlencode 'type=CNAME' \
--data-urlencode 'content=crm-prod-1078073624.eu-west-3.elb.amazonaws.com' \
--data-urlencode 'name=www' \
--data-urlencode 'ttl=7200' \
--data-urlencode 'prio=0'
```

Endpoint confirmado para certificado:

```bash
curl --location 'https://painel.supramail.com.br:5052/_REST/resellersAPI/createSiteCertificate' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'token=SEU_TOKEN' \
--data-urlencode 'domain=teste.com'
```

Tambem aparecem endpoints de senha, filtros, auditoria, blacklist, whitelist e consulta de conta, mas eles nao cobrem o fluxo principal de provisionamento.

## Lacunas para review tecnico

Com a documentacao adicional, ja temos endpoint para criar cliente, criar conta individual, inserir DNS, criar usuario de painel, AWL, Secure Zone e certificado.
Tambem foi adicionado `updatePanelUser` para ajustar tipo e senha de usuario do painel apos a criacao.
Para DNS, a automacao ja cobre `addDNSRegistry` e `updateDNSRegistry`, permitindo adicionar e corrigir registros `A`, `CNAME` e `TXT`.
DKIM foi identificado fora da API Revenda, via sessao web do painel:

```bash
curl 'http://painel.techinnovation.com.br/_REST/dkim/setConfig' \
--header 'Content-Type: text/plain; charset=UTF-8' \
--data-raw 'domain=alisson-api.com&enabled=true'
```

Consulta:

```bash
curl 'http://painel.techinnovation.com.br/_REST/dkim/getConfig?domain=alisson-api.com'
```

Teste realizado: `setConfig` retornou `<OK/>` e `getConfig` retornou `<root enabled="true"/>`.

Habilitacao/ativacao de dominio tambem foi identificada via sessao web:

```bash
curl 'http://painel.techinnovation.com.br/_REST/users/enableDomain' \
--header 'Content-Type: text/plain; charset=UTF-8' \
--data-raw 'domain=alisson-api.com'
```

Teste realizado: `enableDomain` para `alisson-api.com` retornou `<OK/>`.

Teste realizado em desenvolvimento:

- `createClient` com `APIid=alisson_api` retornou `<OK/>`.
- Entrada de dominio `alisson_@api.com` foi saneada para `alisson-api.com`.
- `addToSecureZone` para `alisson-api.com` retornou `<OK/>`.
- `addDNSRegistry` para `alisson-api.com` retornou `<Error code="357193">Erro: dominio inexistente.</Error>`.
- `updateDomainPlan` para `alisson-api.com` com plano `COLAB25G` tambem retornou `<Error code="357193">Erro: dominio inexistente.</Error>`.
- `createDomain` para `alisson-api.com` com `APIid=alisson_api`, plano `COLAB25G`, contrato `C2S-20260507235457-DOM` e 10 contas retornou `<OK/>`.
- Depois de `createDomain`, `updateDomainPlan` para o mesmo dominio retornou `<OK/>`.
- Depois de `createDomain`, DNS `A` raiz para `13.36.107.196` retornou `<OK/>`.
- Depois de `createDomain`, DNS `CNAME www` para `crm-prod-1078073624.eu-west-3.elb.amazonaws.com` retornou `<OK/>`.

Conclusao: o fluxo correto e criar cliente, criar dominio, atualizar plano se necessario, adicionar DNS, Secure Zone, certificado, usuario do painel e contas.

Ainda falta confirmar:

- criar contas de e-mail em lote em uma unica chamada, porque o endpoint recebido cria uma conta por request.

A tela criada em `/mail-automation` monta o pacote de dados, CSV de contas, checklist de chamadas e tambem executa o provisionamento completo por uma unica acao `provisionClient`.

## UX operacional e contrato de integracao

A tela deve operar em cinco etapas:

1. Cliente.
2. Dominio e plano.
3. DNS com os dois registros padrao e o terceiro CNAME gerado pela ferramenta.
4. Seguranca: habilitar dominio, Secure Zone e DKIM.
5. Contas.

Para integracao, a ferramenta pode chamar a Edge Function `supramail-provision` com `action=provisionClient` e o payload abaixo:

```json
{
  "action": "provisionClient",
  "token": "TOKEN_API_REVENDA",
  "panelBaseUrl": "http://painel.techinnovation.com.br",
  "panelSessionCookie": "DID=...; login=...",
  "apiId": "cliente_api",
  "clientName": "Cliente API",
  "domain": "cliente.com.br",
  "plan": "COLAB25G",
  "contract": "C2S-20260508000100-ABCDE",
  "accountsLimit": 10,
  "dnsRecords": [
    { "type": "A", "name": "", "content": "13.36.107.196", "ttl": 7200, "prio": 0 },
    { "type": "CNAME", "name": "www", "content": "crm-prod-1078073624.eu-west-3.elb.amazonaws.com", "ttl": 7200, "prio": 0 },
    { "type": "CNAME", "name": "HOST_GERADO", "content": "ALVO_GERADO", "ttl": 7200, "prio": 0 }
  ],
  "accounts": [
    { "firstName": "mario", "lastName": "", "email": "mario@cliente.com.br", "password": "c2s@2026" }
  ]
}
```

O `panelSessionCookie` so e necessario enquanto DKIM e habilitacao de dominio dependerem da sessao web do painel. Se ele nao for enviado, o provisionamento completo pula essas duas etapas e segue com API Revenda.

## Criterios de aceite

- Dado um dominio com `www` ou protocolo, quando o operador digita a URL, entao a tela deve normalizar para o dominio raiz.
- Dado nome e sobrenome em linhas separadas, quando o dominio existe, entao a tela deve gerar e-mails no formato `nome_sobrenome@dominio`.
- Dado o fluxo padrao, quando o pacote for copiado, entao ele deve conter cliente, plano, contrato, tres DNS, contas e status de seguranca.
- Dado que a ferramenta gera o terceiro DNS, quando o operador clicar em provisionar tudo, entao o CNAME gerado deve ser enviado junto com os dois registros padrao.
