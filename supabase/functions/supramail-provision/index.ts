import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPRAMAIL_BASE_URL = "https://painel.supramail.com.br:5052/_REST/resellersAPI";

type DnsRecord = {
  type?: string;
  name?: string;
  content?: string;
  ttl?: string | number;
  prio?: string | number;
};

type DnsUpdate = DnsRecord & {
  newName?: string;
  newType?: string;
  newContent?: string;
  newTtl?: string | number;
  newPrio?: string | number;
};

type AccountRequest = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  group?: string;
};

type ProvisionRequest = {
  action?:
    | "createClient"
    | "createDomain"
    | "updateDomainPlan"
    | "addDnsRecords"
    | "updateDnsRecord"
    | "addSecureZone"
    | "createSiteCertificate"
    | "createPanelUser"
    | "updatePanelUser"
    | "createAccounts"
    | "setDkimConfig"
    | "getDkimConfig"
    | "enableDomain"
    | "provisionClient";
  token?: string;
  panelBaseUrl?: string;
  panelSessionCookie?: string;
  apiId?: string;
  clientName?: string;
  domain?: string;
  plan?: string;
  contract?: string;
  accountsLimit?: string | number;
  login?: string;
  password?: string;
  panelUserType?: string;
  dnsRecords?: DnsRecord[];
  dnsUpdate?: DnsUpdate;
  accounts?: AccountRequest[];
};

type StepResult = {
  step: string;
  ok: boolean;
  status: number;
  responseText: string;
};

const postForm = async (endpoint: string, payload: Record<string, string>) => {
  const response = await fetch(`${SUPRAMAIL_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload),
  });
  const responseText = await response.text();

  return {
    ok: response.ok && !/<Error\b/i.test(responseText),
    status: response.status,
    responseText,
  };
};

const normalizePanelBaseUrl = (value?: string) => {
  const fallback = "http://painel.techinnovation.com.br";
  if (!value?.trim()) return fallback;
  return value.trim().replace(/\/+$/, "");
};

const panelRequest = async (
  baseUrl: string | undefined,
  sessionCookie: string | undefined,
  path: string,
  options?: { method?: "GET" | "POST"; body?: Record<string, string> },
) => {
  assertRequired(sessionCookie, "panelSessionCookie");

  const response = await fetch(`${normalizePanelBaseUrl(baseUrl)}${path}`, {
    method: options?.method || "GET",
    headers: {
      Accept: "*/*",
      "Content-Type": "text/plain; charset=UTF-8",
      Cookie: sessionCookie!.trim(),
      Referer: `${normalizePanelBaseUrl(baseUrl)}/`,
      Origin: normalizePanelBaseUrl(baseUrl),
    },
    body: options?.body ? new URLSearchParams(options.body).toString() : undefined,
  });
  const responseText = await response.text();

  return {
    ok: response.ok && !/<Error\b/i.test(responseText),
    status: response.status,
    responseText,
  };
};

const assertRequired = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Campo obrigatorio ausente: ${field}`);
  }
};

const createClient = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.apiId, "apiId");
  assertRequired(body.clientName, "clientName");

  const result = await postForm("createClient", {
    token: body.token!.trim(),
    APIid: body.apiId!.trim(),
    clientName: body.clientName!.trim(),
  });

  return [{ step: "createClient", ...result }];
};

const addDnsRecords = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.domain, "domain");

  if (!Array.isArray(body.dnsRecords) || body.dnsRecords.length === 0) {
    throw new Error("Informe ao menos um registro DNS.");
  }

  const results: StepResult[] = [];

  for (const record of body.dnsRecords) {
    assertRequired(record.type, "dns.type");
    assertRequired(record.content, "dns.content");

    const result = await postForm("addDNSRegistry", {
      token: body.token!.trim(),
      domain: body.domain!.trim(),
      type: record.type!.trim(),
      content: record.content!.trim(),
      name: record.name?.trim() || "",
      ttl: String(record.ttl || 7200),
      prio: String(record.prio ?? 0),
    });

    results.push({
      step: `addDNSRegistry:${record.type}:${record.name || "root"}`,
      ...result,
    });
  }

  return results;
};

const updateDnsRecord = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.domain, "domain");

  const record = body.dnsUpdate;
  if (!record) {
    throw new Error("Informe os dados do DNS que sera atualizado.");
  }

  assertRequired(record.type, "dns.type");
  assertRequired(record.content, "dns.content");
  assertRequired(record.newType, "dns.newType");
  assertRequired(record.newContent, "dns.newContent");

  const result = await postForm("updateDNSRegistry", {
    token: body.token!.trim(),
    domain: body.domain!.trim(),
    type: record.type!.trim(),
    content: record.content!.trim(),
    name: record.name?.trim() || "",
    newName: record.newName?.trim() || "",
    newType: record.newType!.trim(),
    newContent: record.newContent!.trim(),
    newTtl: String(record.newTtl || 7200),
    newPrio: String(record.newPrio ?? 0),
  });

  return [{ step: `updateDNSRegistry:${record.name || "root"}`, ...result }];
};

const createDomain = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.apiId, "apiId");
  assertRequired(body.domain, "domain");
  assertRequired(body.plan, "plan");
  assertRequired(body.contract, "contract");

  const result = await postForm("createDomain", {
    token: body.token!.trim(),
    APIid: body.apiId!.trim(),
    domain: body.domain!.trim(),
    plan: body.plan!.trim(),
    contract: body.contract!.trim(),
    accounts: String(body.accountsLimit || 10),
  });

  return [{ step: "createDomain", ...result }];
};

const updateDomainPlan = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.domain, "domain");
  assertRequired(body.plan, "plan");
  assertRequired(body.contract, "contract");

  const result = await postForm("updateDomainPlan", {
    token: body.token!.trim(),
    domain: body.domain!.trim(),
    plan: body.plan!.trim(),
    contract: body.contract!.trim(),
    accounts: String(body.accountsLimit || 10),
  });

  return [{ step: "updateDomainPlan", ...result }];
};

const addSecureZone = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.apiId, "apiId");
  assertRequired(body.domain, "domain");

  const result = await postForm("addToSecureZone", {
    token: body.token!.trim(),
    APIid: body.apiId!.trim(),
    address: body.domain!.trim(),
  });

  return [{ step: "addToSecureZone", ...result }];
};

const createSiteCertificate = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.domain, "domain");

  const result = await postForm("createSiteCertificate", {
    token: body.token!.trim(),
    domain: body.domain!.trim(),
  });

  return [{ step: "createSiteCertificate", ...result }];
};

const createPanelUser = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.login, "login");
  assertRequired(body.password, "password");

  const result = await postForm("createPanelUser", {
    token: body.token!.trim(),
    login: body.login!.trim(),
    password: body.password!.trim(),
    type: body.panelUserType?.trim() || "admin",
  });

  return [{ step: "createPanelUser", ...result }];
};

const updatePanelUser = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.login, "login");
  assertRequired(body.password, "password");

  const result = await postForm("updatePanelUser", {
    token: body.token!.trim(),
    login: body.login!.trim(),
    type: body.panelUserType?.trim() || "technical",
    password: body.password!.trim(),
  });

  return [{ step: "updatePanelUser", ...result }];
};

const createAccounts = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.token, "token");
  assertRequired(body.domain, "domain");

  if (!Array.isArray(body.accounts) || body.accounts.length === 0) {
    throw new Error("Informe ao menos uma conta de email.");
  }

  const results: StepResult[] = [];

  for (const account of body.accounts) {
    assertRequired(account.email, "account.email");
    assertRequired(account.password, "account.password");

    const result = await postForm("createAccount", {
      token: body.token!.trim(),
      domain: body.domain!.trim(),
      group: account.group?.trim() || "Padrao",
      email: account.email!.trim(),
      password: account.password!.trim(),
      isVirtual: "false",
      isGoogle: "false",
      isAuthUserOnly: "false",
      firstName: account.firstName?.trim() || "",
      lastName: account.lastName?.trim() || "",
      telephone: "",
      department: "",
      registration: "",
      isChangePassFirstLogin: "false",
    });

    results.push({ step: `createAccount:${account.email}`, ...result });
  }

  return results;
};

const setDkimConfig = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.domain, "domain");

  const result = await panelRequest(body.panelBaseUrl, body.panelSessionCookie, "/_REST/dkim/setConfig", {
    method: "POST",
    body: {
      domain: body.domain!.trim(),
      enabled: "true",
    },
  });

  return [{ step: "setDkimConfig", ...result }];
};

const getDkimConfig = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.domain, "domain");

  const result = await panelRequest(
    body.panelBaseUrl,
    body.panelSessionCookie,
    `/_REST/dkim/getConfig?domain=${encodeURIComponent(body.domain!.trim())}`,
  );

  return [{ step: "getDkimConfig", ...result }];
};

const enableDomain = async (body: ProvisionRequest): Promise<StepResult[]> => {
  assertRequired(body.domain, "domain");

  const result = await panelRequest(body.panelBaseUrl, body.panelSessionCookie, "/_REST/users/enableDomain", {
    method: "POST",
    body: {
      domain: body.domain!.trim(),
    },
  });

  return [{ step: "enableDomain", ...result }];
};

const assertStepOk = (result: StepResult) => {
  if (!result.ok) {
    throw new Error(`${result.step} falhou: ${result.responseText || `HTTP ${result.status}`}`);
  }
};

const provisionClient = async (body: ProvisionRequest): Promise<StepResult[]> => {
  const results: StepResult[] = [];

  const run = async (step: () => Promise<StepResult[]>) => {
    const stepResults = await step();
    results.push(...stepResults);
    for (const result of stepResults) {
      assertStepOk(result);
    }
  };

  await run(() => createClient(body));
  await run(() => createDomain(body));
  await run(() => updateDomainPlan(body));

  if (Array.isArray(body.dnsRecords) && body.dnsRecords.length > 0) {
    await run(() => addDnsRecords(body));
  }

  await run(() => addSecureZone(body));

  if (body.panelSessionCookie?.trim()) {
    await run(() => enableDomain(body));
    await run(() => setDkimConfig(body));
  }

  if (Array.isArray(body.accounts) && body.accounts.length > 0) {
    await run(() => createAccounts(body));
  }

  return results;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as ProvisionRequest;
    let results: StepResult[];

    if (body.action === "createClient") {
      results = await createClient(body);
    } else if (body.action === "createDomain") {
      results = await createDomain(body);
    } else if (body.action === "updateDomainPlan") {
      results = await updateDomainPlan(body);
    } else if (body.action === "addDnsRecords") {
      results = await addDnsRecords(body);
    } else if (body.action === "updateDnsRecord") {
      results = await updateDnsRecord(body);
    } else if (body.action === "addSecureZone") {
      results = await addSecureZone(body);
    } else if (body.action === "createSiteCertificate") {
      results = await createSiteCertificate(body);
    } else if (body.action === "createPanelUser") {
      results = await createPanelUser(body);
    } else if (body.action === "updatePanelUser") {
      results = await updatePanelUser(body);
    } else if (body.action === "createAccounts") {
      results = await createAccounts(body);
    } else if (body.action === "setDkimConfig") {
      results = await setDkimConfig(body);
    } else if (body.action === "getDkimConfig") {
      results = await getDkimConfig(body);
    } else if (body.action === "enableDomain") {
      results = await enableDomain(body);
    } else if (body.action === "provisionClient") {
      results = await provisionClient(body);
    } else {
      return new Response(JSON.stringify({ error: "Acao invalida." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: results.every((item) => item.ok), results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
