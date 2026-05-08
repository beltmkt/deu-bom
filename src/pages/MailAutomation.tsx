import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  Download,
  KeyRound,
  MailPlus,
  RefreshCcw,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { BottomNav } from '@/components/BottomNav';
import { PageIntro } from '@/components/PageIntro';
import { SurfaceCard } from '@/components/SurfaceCard';
import { supabase } from '@/integrations/supabase/client';

type DnsRecord = {
  type: 'A' | 'CNAME';
  host: string;
  value: string;
  source: 'padrao' | 'ferramenta';
};

type DnsRecordType = 'A' | 'CNAME' | 'TXT';

type ApiStep = {
  label: string;
  status: 'ready' | 'needs-endpoint';
  endpoint?: string;
  payload: Record<string, string | number | boolean>;
};

type ProvisionResult = {
  step: string;
  ok: boolean;
  status: number;
  responseText: string;
};

const DEFAULT_IP = '13.36.107.196';
const DEFAULT_CNAME = 'crm-prod-1078073624.eu-west-3.elb.amazonaws.com';
const DEFAULT_PASSWORD = 'c2s@2026';
const DEFAULT_PLAN = 'Plano padrao 10 GB + 3 meses';
const DEFAULT_PLAN_CODE = 'COLAB25G';
const DEFAULT_ACCOUNTS = 10;

const normalizeDomain = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .replace(/@/g, '-')
    .replace(/_/g, '-')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/\.+/g, '.')
    .replace(/^-+|-+$/g, '')
    .replace(/^\.+|\.+$/g, '');

const slugifyName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_');

const buildClientApiId = (companyName: string, domain: string) => {
  const fromDomain = domain.split('.')[0] || '';
  return slugifyName(fromDomain || companyName).replace(/_/g, '') || 'cliente';
};

const generateContractNumber = () => {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `C2S-${stamp}-${randomPart}`;
};

const parseUsers = (value: string, domain: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ');
      const emailPrefix = slugifyName([firstName, lastName].filter(Boolean).join('_'));

      return {
        name: [firstName, lastName].filter(Boolean).join(' '),
        firstName,
        lastName,
        email: domain && emailPrefix ? `${emailPrefix}@${domain}` : emailPrefix,
        password: DEFAULT_PASSWORD,
      };
    });

const inputClass =
  'w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15';

const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
    {children}
    {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
  </label>
);

const MailAutomation: React.FC = () => {
  const [token, setToken] = useState('');
  const [panelSessionCookie, setPanelSessionCookie] = useState('');
  const [panelBaseUrl, setPanelBaseUrl] = useState('http://painel.techinnovation.com.br');
  const [companyName, setCompanyName] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [clientApiId, setClientApiId] = useState('');
  const [contractNumber, setContractNumber] = useState(generateContractNumber);
  const [certificateHost, setCertificateHost] = useState('');
  const [certificateTarget, setCertificateTarget] = useState('');
  const [dnsUpdate, setDnsUpdate] = useState({
    type: 'TXT' as DnsRecordType,
    name: '',
    content: '',
    newType: 'TXT' as DnsRecordType,
    newName: '',
    newContent: '',
    newTtl: '7200',
    newPrio: '0',
  });
  const [usersText, setUsersText] = useState('Alisson Correia\nMaria Silva\nJoao Souza');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isAddingDns, setIsAddingDns] = useState(false);
  const [isRunningFullProvision, setIsRunningFullProvision] = useState(false);
  const [isRunningProvisionStep, setIsRunningProvisionStep] = useState('');
  const [provisionResults, setProvisionResults] = useState<ProvisionResult[]>([]);

  const domain = useMemo(() => normalizeDomain(domainInput), [domainInput]);
  const resolvedClientApiId = useMemo(
    () => clientApiId.trim() || buildClientApiId(companyName, domain),
    [clientApiId, companyName, domain]
  );
  const accounts = useMemo(() => parseUsers(usersText, domain), [usersText, domain]);
  const dnsRecords = useMemo<DnsRecord[]>(
    () => [
      { type: 'A', host: '', value: DEFAULT_IP, source: 'padrao' },
      { type: 'CNAME', host: 'www', value: DEFAULT_CNAME, source: 'padrao' },
      { type: 'CNAME', host: certificateHost.trim(), value: certificateTarget.trim(), source: 'ferramenta' },
    ],
    [certificateHost, certificateTarget]
  );

  const apiSteps = useMemo<ApiStep[]>(
    () => [
      {
        label: 'Criar cliente',
        status: companyName && resolvedClientApiId ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/createClient',
        payload: { token: token ? '***' : '', apiId: resolvedClientApiId, companyName, domain },
      },
      {
        label: 'Criar dominio',
        status: domain && resolvedClientApiId && contractNumber ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/createDomain',
        payload: { token: token ? '***' : '', apiId: resolvedClientApiId, domain, plan: DEFAULT_PLAN_CODE, contractNumber, accountsLimit: DEFAULT_ACCOUNTS },
      },
      {
        label: 'Criar plano',
        status: domain && contractNumber ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/updateDomainPlan',
        payload: { token: token ? '***' : '', domain, plan: DEFAULT_PLAN_CODE, contractNumber, accountsLimit: DEFAULT_ACCOUNTS },
      },
      {
        label: 'Configurar DNS',
        status: domain ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/addDNSRegistry',
        payload: { token: token ? '***' : '', domain, records: JSON.stringify(dnsRecords) },
      },
      {
        label: 'Atualizar DNS',
        status: domain ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/updateDNSRegistry',
        payload: { token: token ? '***' : '', domain, ...dnsUpdate },
      },
      {
        label: 'Criar certificado do site',
        status: domain ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/createSiteCertificate',
        payload: { token: token ? '***' : '', domain },
      },
      {
        label: 'Adicionar Secure Zone',
        status: domain && resolvedClientApiId ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/addToSecureZone',
        payload: { token: token ? '***' : '', apiId: resolvedClientApiId, domain },
      },
      {
        label: 'Criar usuario do painel',
        status: accounts[0]?.email ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/createPanelUser',
        payload: { token: token ? '***' : '', login: accounts[0]?.email || '', type: 'admin' },
      },
      {
        label: 'Atualizar usuario do painel',
        status: accounts[0]?.email ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/updatePanelUser',
        payload: { token: token ? '***' : '', login: accounts[0]?.email || '', type: 'technical' },
      },
      {
        label: 'Criar e-mails em massa',
        status: accounts.length > 0 && domain ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/resellersAPI/createAccount',
        payload: { token: token ? '***' : '', domain, defaultPassword: DEFAULT_PASSWORD, accounts: JSON.stringify(accounts) },
      },
      {
        label: 'Habilitar dominio',
        status: domain && panelSessionCookie ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/users/enableDomain',
        payload: { domain, auth: panelSessionCookie ? 'cookie da sessao' : 'pendente' },
      },
      {
        label: 'Ativar DKIM',
        status: domain && panelSessionCookie ? 'ready' : 'needs-endpoint',
        endpoint: '/_REST/dkim/setConfig',
        payload: { domain, enabled: true, auth: panelSessionCookie ? 'cookie da sessao' : 'pendente' },
      },
    ],
    [accounts, companyName, contractNumber, dnsRecords, dnsUpdate, domain, panelSessionCookie, resolvedClientApiId, token]
  );

  const provisionPackage = useMemo(
    () => ({
      client: { companyName, apiId: resolvedClientApiId, domain },
      plan: {
        code: DEFAULT_PLAN_CODE,
        name: DEFAULT_PLAN,
        contract: contractNumber,
        accountsLimit: DEFAULT_ACCOUNTS,
      },
      dns: dnsRecords.map((record) => ({
        type: record.type,
        name: record.host,
        content: record.value,
        ttl: 7200,
        prio: 0,
        source: record.source,
      })),
      accounts,
      security: {
        enableDomain: true,
        secureZone: true,
        dkim: true,
        dmarc: false,
        certificate: true,
      },
      integration: {
        fullProvisionAction: 'provisionClient',
        apiToken: token ? 'manual' : 'pendente',
        panelSessionCookie: panelSessionCookie ? 'manual' : 'pendente',
        panelBaseUrl,
      },
      apiSteps,
    }),
    [
      accounts,
      apiSteps,
      companyName,
      contractNumber,
      dnsRecords,
      domain,
      panelBaseUrl,
      panelSessionCookie,
      resolvedClientApiId,
      token,
    ]
  );

  const reviewBundle = useMemo(
    () =>
      JSON.stringify(
        provisionPackage,
        null,
        2
      ),
    [provisionPackage]
  );

  const certificateCurl = useMemo(
    () =>
      [
        "curl --location 'https://painel.supramail.com.br:5052/_REST/resellersAPI/createSiteCertificate' \\",
        "--header 'Content-Type: application/x-www-form-urlencoded' \\",
        "--data-urlencode 'token=SEU_TOKEN' \\",
        `--data-urlencode 'domain=${domain || 'cliente.com.br'}'`,
      ].join('\n'),
    [domain]
  );

  const copyReviewBundle = async () => {
    await navigator.clipboard.writeText(reviewBundle);
    toast.success('Pacote de revisao copiado.');
  };

  const callProvisionFunction = async (
    payload: Record<string, unknown>,
    successMessage: string,
  ) => {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      results: ProvisionResult[];
    }>('supramail-provision', {
      body: payload,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('A funcao nao retornou dados.');

    setProvisionResults((current) => [...data.results, ...current].slice(0, 12));

    if (!data.success) {
      throw new Error('A API retornou falha em uma ou mais etapas.');
    }

    toast.success(successMessage);
  };

  const handleCreateClient = async () => {
    if (!token.trim() || !companyName.trim() || !resolvedClientApiId.trim()) {
      toast.error('Informe token, nome da empresa e APIid.');
      return;
    }

    setIsCreatingClient(true);
    try {
      await callProvisionFunction(
        {
          action: 'createClient',
          token,
          apiId: resolvedClientApiId,
          clientName: companyName,
        },
        'Cliente criado no painel Supramail.'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel criar o cliente.');
    } finally {
      setIsCreatingClient(false);
    }
  };

  const buildReadyDnsRecords = () =>
    dnsRecords
      .filter((record) => record.value.trim())
      .map((record) => ({
        type: record.type,
        name: record.host,
        content: record.value,
        ttl: 7200,
        prio: 0,
      }));

  const handleFullProvision = async () => {
    if (!token.trim() || !companyName.trim() || !resolvedClientApiId.trim() || !domain || !contractNumber) {
      toast.error('Informe token, empresa, APIid, dominio e contrato.');
      return;
    }

    const readyDnsRecords = buildReadyDnsRecords();
    if (readyDnsRecords.length < 3) {
      toast.error('Informe os 3 DNS, incluindo o CNAME gerado pela ferramenta.');
      return;
    }

    setIsRunningFullProvision(true);
    try {
      await callProvisionFunction(
        {
          action: 'provisionClient',
          token,
          panelBaseUrl,
          panelSessionCookie,
          apiId: resolvedClientApiId,
          clientName: companyName,
          domain,
          plan: DEFAULT_PLAN_CODE,
          contract: contractNumber,
          accountsLimit: DEFAULT_ACCOUNTS,
          dnsRecords: readyDnsRecords,
          accounts,
        },
        'Provisionamento completo executado.'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel executar o provisionamento completo.');
    } finally {
      setIsRunningFullProvision(false);
    }
  };

  const handleAddDns = async () => {
    if (!token.trim() || !domain) {
      toast.error('Informe token e dominio.');
      return;
    }

    const readyRecords = buildReadyDnsRecords();

    setIsAddingDns(true);
    try {
      await callProvisionFunction(
        {
          action: 'addDnsRecords',
          token,
          domain,
          dnsRecords: readyRecords,
        },
        'Registros DNS enviados para a Supramail.'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel adicionar o DNS.');
    } finally {
      setIsAddingDns(false);
    }
  };

  const handleUpdateDns = () => {
    if (!domain) {
      toast.error('Informe o dominio.');
      return;
    }

    if (!dnsUpdate.content.trim() || !dnsUpdate.newContent.trim()) {
      toast.error('Informe o conteudo atual e o novo conteudo do DNS.');
      return;
    }

    runProvisionStep(
      'updateDnsRecord',
      {
        domain,
        dnsUpdate: {
          ...dnsUpdate,
          ttl: 7200,
          prio: 0,
        },
      },
      'Registro DNS atualizado.'
    );
  };

  const handleUpdateDomainPlan = () => {
    if (!domain || !contractNumber) {
      toast.error('Informe dominio e contrato.');
      return;
    }

    runProvisionStep(
      'updateDomainPlan',
      {
        domain,
        plan: DEFAULT_PLAN_CODE,
        contract: contractNumber,
        accountsLimit: DEFAULT_ACCOUNTS,
      },
      'Dominio e plano atualizados.'
    );
  };

  const handleCreateDomain = () => {
    if (!domain || !resolvedClientApiId || !contractNumber) {
      toast.error('Informe dominio, APIid e contrato.');
      return;
    }

    runProvisionStep(
      'createDomain',
      {
        apiId: resolvedClientApiId,
        domain,
        plan: DEFAULT_PLAN_CODE,
        contract: contractNumber,
        accountsLimit: DEFAULT_ACCOUNTS,
      },
      'Dominio criado no painel Supramail.'
    );
  };

  const runProvisionStep = async (
    action: string,
    payload: Record<string, unknown>,
    successMessage: string,
    options?: { requiresToken?: boolean },
  ) => {
    if (options?.requiresToken !== false && !token.trim()) {
      toast.error('Informe o token da API.');
      return;
    }

    setIsRunningProvisionStep(action);
    try {
      await callProvisionFunction({ action, token, ...payload }, successMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel executar a etapa.');
    } finally {
      setIsRunningProvisionStep('');
    }
  };

  const handleAddSecureZone = () => {
    if (!domain || !resolvedClientApiId) {
      toast.error('Informe dominio e APIid.');
      return;
    }

    runProvisionStep(
      'addSecureZone',
      { apiId: resolvedClientApiId, domain },
      'Dominio adicionado na Secure Zone.'
    );
  };

  const handleCreateCertificate = () => {
    if (!domain) {
      toast.error('Informe o dominio.');
      return;
    }

    runProvisionStep('createSiteCertificate', { domain }, 'Certificado solicitado.');
  };

  const handleCreatePanelUser = () => {
    const login = accounts[0]?.email;
    if (!login) {
      toast.error('Informe ao menos um usuario para usar como admin do painel.');
      return;
    }

    runProvisionStep(
      'createPanelUser',
      { login, password: DEFAULT_PASSWORD, panelUserType: 'admin' },
      'Usuario do painel criado.'
    );
  };

  const handleUpdatePanelUser = () => {
    const login = accounts[0]?.email;
    if (!login) {
      toast.error('Informe ao menos um usuario para ajustar no painel.');
      return;
    }

    runProvisionStep(
      'updatePanelUser',
      { login, password: DEFAULT_PASSWORD, panelUserType: 'technical' },
      'Usuario do painel atualizado.'
    );
  };

  const handleCreateAccounts = () => {
    if (!domain || accounts.length === 0) {
      toast.error('Informe dominio e usuarios.');
      return;
    }

    runProvisionStep(
      'createAccounts',
      { domain, accounts },
      'Contas de email enviadas para criacao.'
    );
  };

  const handleActivateDkim = () => {
    if (!domain || !panelSessionCookie.trim()) {
      toast.error('Informe o dominio e o cookie de sessao do painel.');
      return;
    }

    runProvisionStep(
      'setDkimConfig',
      { domain, panelBaseUrl, panelSessionCookie },
      'DKIM ativado no painel.',
      { requiresToken: false }
    );
  };

  const handleEnableDomain = () => {
    if (!domain || !panelSessionCookie.trim()) {
      toast.error('Informe o dominio e o cookie de sessao do painel.');
      return;
    }

    runProvisionStep(
      'enableDomain',
      { domain, panelBaseUrl, panelSessionCookie },
      'Dominio habilitado no painel.',
      { requiresToken: false }
    );
  };

  const handleCheckDkim = () => {
    if (!domain || !panelSessionCookie.trim()) {
      toast.error('Informe o dominio e o cookie de sessao do painel.');
      return;
    }

    runProvisionStep(
      'getDkimConfig',
      { domain, panelBaseUrl, panelSessionCookie },
      'Status DKIM consultado.',
      { requiresToken: false }
    );
  };

  const downloadCsv = () => {
    const headers = ['nome', 'sobrenome', 'email', 'senha'];
    const rows = accounts.map((account) => [account.firstName, account.lastName, account.email, account.password]);
    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `emails-${domain || 'cliente'}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success('CSV de e-mails gerado.');
  };

  return (
    <AppShell>
      <PageIntro
        eyebrow="Automacao Supramail"
        title="Provisionamento de cliente e dominio"
        description="Fluxo manual para preparar cliente, plano, DNS, certificado, contas de e-mail e DKIM antes da integracao final da API."
        actions={
          <>
            <button
              onClick={() => setContractNumber(generateContractNumber())}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <RefreshCcw className="h-4 w-4" />
              Novo contrato
            </button>
            <button
              onClick={copyReviewBundle}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Clipboard className="h-4 w-4" />
              Copiar pacote
            </button>
            <button
              onClick={handleFullProvision}
              disabled={isRunningFullProvision}
              className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-success-foreground disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isRunningFullProvision ? 'Provisionando...' : 'Provisionar tudo'}
            </button>
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: 'Dominio', value: domain || 'pendente' },
            { label: 'Plano', value: '10 GB + 3 meses' },
            { label: 'Contrato', value: contractNumber },
            { label: 'Contas', value: `${accounts.length}/${DEFAULT_ACCOUNTS}` },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
              <p className="mt-2 break-words text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-5">
          {[
            'Cliente',
            'Dominio e plano',
            'DNS + CNAME gerado',
            'Seguranca',
            'Contas',
          ].map((step, index) => (
            <div key={step} className="rounded-2xl border border-border/60 bg-background/50 p-3">
              <p className="text-xs font-semibold text-primary">Etapa {index + 1}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <SurfaceCard className="space-y-5">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Dados do cliente</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Token da API" hint="Usado apenas nesta tela por enquanto; nao fica salvo.">
                <input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Cole o token manualmente" className={inputClass} />
              </Field>
              <Field label="URL do painel" hint="Usada apenas para DKIM, pois esse endpoint vem da sessao web.">
                <input value={panelBaseUrl} onChange={(event) => setPanelBaseUrl(event.target.value)} className={inputClass} />
              </Field>
              <Field label="Cookie de sessao do painel" hint="Cole DID/login quando for ativar DKIM; nao fica salvo.">
                <input
                  type="password"
                  value={panelSessionCookie}
                  onChange={(event) => setPanelSessionCookie(event.target.value)}
                  placeholder="DID=...; login=..."
                  className={inputClass}
                />
              </Field>
              <Field label="Nome da empresa no sistema">
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Ex.: Cliente Teste LTDA" className={inputClass} />
              </Field>
              <Field label="APIid do cliente" hint="Sugerido automaticamente; ajuste se o painel exigir outro padrao.">
                <input value={clientApiId} onChange={(event) => setClientApiId(event.target.value)} placeholder={resolvedClientApiId} className={inputClass} />
              </Field>
              <Field label="Dominio sem www" hint="Aceita URL completa e normaliza para exemplo.com.br.">
                <input value={domainInput} onChange={(event) => setDomainInput(event.target.value)} placeholder="teste.com.br" className={inputClass} />
              </Field>
              <Field label="Numero do contrato">
                <input value={contractNumber} onChange={(event) => setContractNumber(event.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Criar cliente no webservice</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Envia APIid e nome da empresa para `createClient`.
                </p>
              </div>
              <button
                onClick={handleCreateClient}
                disabled={isCreatingClient}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isCreatingClient ? 'Criando...' : 'Criar cliente'}
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-5">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">DNS do CRM</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Host CNAME gerado pela ferramenta">
                <input value={certificateHost} onChange={(event) => setCertificateHost(event.target.value)} placeholder="_acme-challenge ou host gerado" className={inputClass} />
              </Field>
              <Field label="Apontamento CNAME gerado pela ferramenta">
                <input value={certificateTarget} onChange={(event) => setCertificateTarget(event.target.value)} placeholder="valor gerado para AWS" className={inputClass} />
              </Field>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
              <div className="grid grid-cols-[92px_1fr_1.4fr] bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>Tipo</span>
                <span>Host</span>
                <span>Valor</span>
              </div>
              {dnsRecords.map((record, index) => (
                <div key={`${record.type}-${record.host}-${index}`} className="grid grid-cols-[92px_1fr_1.4fr] gap-3 border-t border-border/60 px-4 py-3 text-sm">
                  <span className="font-semibold text-primary">{record.type}</span>
                  <span className="break-words text-muted-foreground">{record.host || 'vazio'}</span>
                  <span className="break-words text-foreground">{record.value || 'pendente'}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Adicionar DNS no webservice</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Envia os registros preenchidos para `addDNSRegistry` com TTL 7200.
                </p>
              </div>
              <button
                onClick={handleAddDns}
                disabled={isAddingDns}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isAddingDns ? 'Enviando...' : 'Adicionar DNS'}
              </button>
            </div>

            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/60 p-4">
              <div>
                <p className="font-medium text-foreground">Atualizar DNS existente</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe o registro atual e os novos dados para `updateDNSRegistry`.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Tipo atual">
                  <select
                    value={dnsUpdate.type}
                    onChange={(event) =>
                      setDnsUpdate((current) => ({ ...current, type: event.target.value as DnsRecordType }))
                    }
                    className={inputClass}
                  >
                    <option value="A">A</option>
                    <option value="CNAME">CNAME</option>
                    <option value="TXT">TXT</option>
                  </select>
                </Field>
                <Field label="Nome atual">
                  <input
                    value={dnsUpdate.name}
                    onChange={(event) => setDnsUpdate((current) => ({ ...current, name: event.target.value }))}
                    placeholder="dns, www ou vazio"
                    className={inputClass}
                  />
                </Field>
                <Field label="Conteudo atual">
                  <input
                    value={dnsUpdate.content}
                    onChange={(event) => setDnsUpdate((current) => ({ ...current, content: event.target.value }))}
                    placeholder="OK"
                    className={inputClass}
                  />
                </Field>
                <Field label="Novo tipo">
                  <select
                    value={dnsUpdate.newType}
                    onChange={(event) =>
                      setDnsUpdate((current) => ({ ...current, newType: event.target.value as DnsRecordType }))
                    }
                    className={inputClass}
                  >
                    <option value="A">A</option>
                    <option value="CNAME">CNAME</option>
                    <option value="TXT">TXT</option>
                  </select>
                </Field>
                <Field label="Novo nome">
                  <input
                    value={dnsUpdate.newName}
                    onChange={(event) => setDnsUpdate((current) => ({ ...current, newName: event.target.value }))}
                    placeholder="newDNS"
                    className={inputClass}
                  />
                </Field>
                <Field label="Novo conteudo">
                  <input
                    value={dnsUpdate.newContent}
                    onChange={(event) => setDnsUpdate((current) => ({ ...current, newContent: event.target.value }))}
                    placeholder="novo valor"
                    className={inputClass}
                  />
                </Field>
                <Field label="Novo TTL">
                  <input
                    value={dnsUpdate.newTtl}
                    onChange={(event) => setDnsUpdate((current) => ({ ...current, newTtl: event.target.value }))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Nova prioridade">
                  <input
                    value={dnsUpdate.newPrio}
                    onChange={(event) => setDnsUpdate((current) => ({ ...current, newPrio: event.target.value }))}
                    className={inputClass}
                  />
                </Field>
              </div>

              <button
                onClick={handleUpdateDns}
                disabled={isRunningProvisionStep === 'updateDnsRecord'}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isRunningProvisionStep === 'updateDnsRecord' ? 'Atualizando...' : 'Atualizar DNS'}
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MailPlus className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">E-mails em massa</h2>
              </div>
              <button onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60">
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>

            <Field label="Nomes dos usuarios" hint="Um usuario por linha. O e-mail vira nome_sobrenome@dominio.">
              <textarea value={usersText} onChange={(event) => setUsersText(event.target.value)} rows={6} className={`${inputClass} resize-none`} />
            </Field>

            <div className="grid gap-3 md:grid-cols-2">
              {accounts.map((account) => (
                <div key={account.email} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="font-medium text-foreground">{account.name || 'Sem nome'}</p>
                  <p className="mt-1 break-words text-sm text-primary">{account.email || 'dominio pendente'}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Senha padrao: {DEFAULT_PASSWORD}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Checklist da API</h2>
            </div>

            <div className="space-y-3">
              {apiSteps.map((step) => (
                <div key={step.label} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <div className="flex items-start gap-3">
                    {step.status === 'ready' ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-pending" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{step.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.status === 'ready'
                          ? `Endpoint documentado: ${step.endpoint}`
                          : 'Endpoint nao aparece no trecho fornecido; precisa confirmar na doc completa.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-4">
            <h2 className="text-lg font-semibold">Proximas acoes possiveis</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: 'Criar dominio',
                  action: 'createDomain',
                  onClick: handleCreateDomain,
                },
                {
                  label: 'Dominio/plano',
                  action: 'updateDomainPlan',
                  onClick: handleUpdateDomainPlan,
                },
                {
                  label: 'Secure Zone',
                  action: 'addSecureZone',
                  onClick: handleAddSecureZone,
                },
                {
                  label: 'Certificado',
                  action: 'createSiteCertificate',
                  onClick: handleCreateCertificate,
                },
                {
                  label: 'Usuario painel',
                  action: 'createPanelUser',
                  onClick: handleCreatePanelUser,
                },
                {
                  label: 'Ajustar painel',
                  action: 'updatePanelUser',
                  onClick: handleUpdatePanelUser,
                },
                {
                  label: 'Criar contas',
                  action: 'createAccounts',
                  onClick: handleCreateAccounts,
                },
                {
                  label: 'Habilitar dominio',
                  action: 'enableDomain',
                  onClick: handleEnableDomain,
                },
                {
                  label: 'Ativar DKIM',
                  action: 'setDkimConfig',
                  onClick: handleActivateDkim,
                },
                {
                  label: 'Ver DKIM',
                  action: 'getDkimConfig',
                  onClick: handleCheckDkim,
                },
              ].map((item) => (
                <button
                  key={item.action}
                  onClick={item.onClick}
                  disabled={isRunningProvisionStep === item.action}
                  className="rounded-2xl border border-border/70 bg-background/60 p-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 disabled:opacity-60"
                >
                  {isRunningProvisionStep === item.action ? 'Executando...' : item.label}
                </button>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-4">
            <h2 className="text-lg font-semibold">Retorno do webservice</h2>
            {provisionResults.length > 0 ? (
              <div className="space-y-3">
                {provisionResults.map((result, index) => (
                  <div key={`${result.step}-${index}`} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="break-words text-sm font-semibold text-foreground">{result.step}</p>
                      <span className={result.ok ? 'text-sm font-medium text-primary' : 'text-sm font-medium text-expense'}>
                        HTTP {result.status}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-xs text-muted-foreground">
                      {result.responseText || 'Sem corpo de resposta.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Os retornos de `createClient` e `addDNSRegistry` aparecem aqui apos a execucao.
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard className="space-y-4">
            <h2 className="text-lg font-semibold">cURL documentado</h2>
            <pre className="max-h-[240px] overflow-auto rounded-2xl border border-border/70 bg-background/80 p-4 text-xs leading-5 text-muted-foreground">{certificateCurl}</pre>
          </SurfaceCard>

          <SurfaceCard className="space-y-4">
            <h2 className="text-lg font-semibold">Pacote para review dos devs</h2>
            <pre className="max-h-[420px] overflow-auto rounded-2xl border border-border/70 bg-background/80 p-4 text-xs leading-5 text-muted-foreground">{reviewBundle}</pre>
          </SurfaceCard>
        </div>
      </div>

      <BottomNav />
    </AppShell>
  );
};

export default MailAutomation;
