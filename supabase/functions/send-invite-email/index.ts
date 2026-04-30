import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email?: string;
  workspaceName?: string;
  inviterName?: string;
  token?: string;
  role?: string;
  appUrl?: string;
  emailId?: string;
}

interface ResendEmailResponse {
  data?: {
    id?: string;
  } | null;
}

interface ResendEmailStatusResponse {
  last_event?: string | null;
}

const DEFAULT_APP_URL = "https://deu-bom-financas-sem-erro.vercel.app";
const DEFAULT_FROM_EMAIL = "convites@labeltservicosdigitais.com.br";
const DEFAULT_REPLY_TO = "contato@labeltservicosdigitais.com.br";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeAppUrl = (value?: string | null) => {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const resolveAppUrl = (appUrl?: string) => {
  const candidates = [
    appUrl,
    Deno.env.get("APP_URL"),
    Deno.env.get("SITE_URL"),
    Deno.env.get("PUBLIC_APP_URL"),
    DEFAULT_APP_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeAppUrl(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return DEFAULT_APP_URL;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send invite email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as InviteEmailRequest;
    const { email, workspaceName, inviterName, token, role, emailId, appUrl } = body;

    if (emailId && !email) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const statusRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${resendApiKey}` },
      });

      const statusText = await statusRes.text();
      return new Response(statusText, {
        status: statusRes.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!email || !workspaceName || !inviterName || !token || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending invite to ${email} for workspace ${workspaceName}`);

    const acceptUrl = `${resolveAppUrl(appUrl)}/accept-invite?token=${token}`;
    const roleLabel = role === "editor" ? "Editor" : "Visualizador";
    const fromEmail = Deno.env.get("INVITE_FROM_EMAIL") || DEFAULT_FROM_EMAIL;
    const replyTo = Deno.env.get("INVITE_REPLY_TO") || DEFAULT_REPLY_TO;
    const safeWorkspaceName = escapeHtml(workspaceName);
    const safeInviterName = escapeHtml(inviterName);
    const safeRoleLabel = escapeHtml(roleLabel);
    const safeAcceptUrl = escapeHtml(acceptUrl);
    const text = [
      `${inviterName} convidou voce para participar do espaco ${workspaceName} como ${roleLabel}.`,
      "",
      "Para aceitar o convite, acesse:",
      acceptUrl,
      "",
      "Este convite expira em 7 dias. Se voce nao reconhece este convite, ignore este email.",
      "",
      "Deu Bom Financas",
    ].join("\n");

    const emailResponse = await resend.emails.send({
      from: `Deu Bom Financas <${fromEmail}>`,
      to: [email],
      reply_to: replyTo,
      subject: `Convite para ${workspaceName}`,
      text,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f7f7f8; color: #27272a; margin: 0; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 28px;">
            <h1 style="font-size: 22px; line-height: 1.3; margin: 0 0 16px;">Convite para colaborar</h1>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              <strong>${safeInviterName}</strong> convidou voce para participar do espaco <strong>${safeWorkspaceName}</strong> como <strong>${safeRoleLabel}</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Use o botao abaixo para entrar no Deu Bom Financas e aceitar o convite.
            </p>
            <p style="margin: 0 0 24px;">
              <a href="${safeAcceptUrl}" style="display: inline-block; padding: 12px 18px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Aceitar convite
              </a>
            </p>
            <p style="font-size: 13px; line-height: 1.6; color: #71717a; margin: 0 0 12px;">
              Se o botao nao abrir, copie e cole este link no navegador:
            </p>
            <p style="font-size: 13px; line-height: 1.6; word-break: break-all; margin: 0 0 20px;">
              <a href="${safeAcceptUrl}" style="color: #4f46e5;">${safeAcceptUrl}</a>
            </p>
            <p style="font-size: 12px; line-height: 1.6; color: #71717a; margin: 0;">
              Este convite expira em 7 dias. Se voce nao reconhece este convite, ignore este email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let lastEvent: string | null = null;

    try {
      const sentEmailId = (emailResponse as ResendEmailResponse)?.data?.id;
      if (resendApiKey && sentEmailId) {
        const statusRes = await fetch(`https://api.resend.com/emails/${sentEmailId}`, {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
          },
        });

        if (statusRes.ok) {
          const statusJson = (await statusRes.json()) as ResendEmailStatusResponse;
          lastEvent = statusJson.last_event ?? null;
          console.log("Resend last_event:", lastEvent);
        } else {
          console.log("Resend status fetch failed:", await statusRes.text());
        }
      }
    } catch (e) {
      console.log("Resend status fetch error:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: emailResponse,
        delivery: { last_event: lastEvent },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error sending invite email:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
