import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EventInviteRequest {
  email?: string;
  participantName?: string;
  eventName?: string;
  eventDate?: string | null;
  hostName?: string;
  hostEmail?: string;
  amountDue?: number;
  appUrl?: string;
}

const DEFAULT_APP_URL = "https://deu-bom-financas-sem-erro.vercel.app";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sanitizeHeaderText = (value: string) =>
  value.replace(/[\r\n<>]/g, "").trim() || "Deu Bom";

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
    if (normalized) return normalized;
  }

  return DEFAULT_APP_URL;
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount || 0);

const formatEventDate = (date?: string | null) => {
  if (!date) return "Data a definir";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
};

const buildGoogleCalendarUrl = (eventName: string, eventDate?: string | null) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventName,
    details: "Convite enviado pelo Deu Bom - Financas Sem Erro.",
    sf: "true",
    output: "xml",
  });

  if (eventDate) {
    const dateToken = eventDate.replaceAll("-", "");
    params.set("dates", `${dateToken}/${dateToken}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      participantName,
      eventName,
      eventDate,
      hostName,
      hostEmail,
      amountDue,
      appUrl,
    } = (await req.json()) as EventInviteRequest;

    if (!email || !participantName || !eventName || !hostName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeParticipant = escapeHtml(participantName);
    const safeEvent = escapeHtml(eventName);
    const safeHost = escapeHtml(hostName);
    const safeHostEmail = hostEmail ? escapeHtml(hostEmail) : "";
    const headerHost = sanitizeHeaderText(hostName);
    const eventUrl = `${resolveAppUrl(appUrl)}/festometro`;
    const calendarUrl = buildGoogleCalendarUrl(eventName, eventDate);

    const emailResponse = await resend.emails.send({
      from: `${headerHost} via Deu Bom <noreply@labeltservicosdigitais.com.br>`,
      reply_to: hostEmail,
      to: [email],
      subject: `${safeHost} te convidou para ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 32px 16px;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7;">
            <div style="padding: 28px 28px 16px;">
              <p style="color: #71717a; font-size: 13px; margin: 0 0 8px;">Convite de evento</p>
              <h1 style="color: #18181b; margin: 0; font-size: 24px; line-height: 1.2;">${safeEvent}</h1>
            </div>
            <div style="padding: 0 28px 28px;">
              <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Oi, ${safeParticipant}. <strong>${safeHost}</strong> convidou voce para participar desse evento.
              </p>
              <div style="background: #f4f4f5; border-radius: 12px; padding: 16px; margin: 0 0 20px;">
                <p style="color: #71717a; font-size: 13px; margin: 0 0 6px;">Data</p>
                <p style="color: #18181b; font-size: 16px; font-weight: 600; margin: 0 0 12px;">${escapeHtml(formatEventDate(eventDate))}</p>
                <p style="color: #71717a; font-size: 13px; margin: 0 0 6px;">Valor previsto para voce</p>
                <p style="color: #059669; font-size: 18px; font-weight: 700; margin: 0;">${formatCurrency(amountDue)}</p>
              </div>
              <a href="${calendarUrl}" style="display: block; padding: 14px 16px; background: #10b981; color: #ffffff; text-align: center; text-decoration: none; border-radius: 12px; font-weight: 700; margin-bottom: 10px;">
                Adicionar ao Google Agenda
              </a>
              <a href="${eventUrl}" style="display: block; padding: 14px 16px; background: #18181b; color: #ffffff; text-align: center; text-decoration: none; border-radius: 12px; font-weight: 700;">
                Abrir Deu Bom
              </a>
              ${
                safeHostEmail
                  ? `<p style="color: #71717a; font-size: 12px; line-height: 1.6; margin: 18px 0 0; text-align: center;">Responda este email para falar com ${safeHost} em ${safeHostEmail}.</p>`
                  : ""
              }
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending event invite:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
