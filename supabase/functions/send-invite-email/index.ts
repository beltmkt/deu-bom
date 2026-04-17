import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  // Send mode
  email?: string;
  workspaceName?: string;
  inviterName?: string;
  token?: string;
  role?: string;
  appUrl?: string;

  // Status mode
  emailId?: string;
}

const DEFAULT_APP_URL = "https://deu-bom-financas-sem-erro.vercel.app";

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
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as InviteEmailRequest;
    const { email, workspaceName, inviterName, token, role, emailId, appUrl } = body;

    // Status-only mode: check delivery state for a previously sent email
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
    
    const roleLabel = role === 'editor' ? 'Editor' : 'Visualizador';

    const emailResponse = await resend.emails.send({
      from: "Finanças <noreply@labeltservicosdigitais.com.br>",
      to: [email],
      subject: `Você foi convidado para ${workspaceName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Você foi convidado!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Olá! 👋
              </p>
              <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                <strong>${inviterName}</strong> convidou você para participar do espaço <strong>${workspaceName}</strong> como <strong>${roleLabel}</strong>.
              </p>
              <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Clique no botão abaixo para aceitar o convite e começar a gerenciar suas finanças em equipe.
              </p>
              <a href="${acceptUrl}" style="display: block; width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-align: center; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-sizing: border-box;">
                Aceitar Convite
              </a>
              <p style="color: #a1a1aa; font-size: 12px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
                Este convite expira em 7 dias. Se você não reconhece este convite, pode ignorar este email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Try to fetch delivery status from Resend (accepted vs delivered/bounced/etc.)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let lastEvent: string | null = null;

    try {
      const emailId = (emailResponse as any)?.data?.id as string | undefined;
      if (resendApiKey && emailId) {
        const statusRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
          },
        });

        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          lastEvent = (statusJson as any)?.last_event ?? null;
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
  } catch (error: any) {
    console.error("Error sending invite email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
