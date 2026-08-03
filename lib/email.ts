const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "NEAD";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Envia um email via API do Brevo. Nunca lança erro: se as credenciais não
 * estiverem configuradas ou o envio falhar, apenas registra um aviso no log,
 * para não quebrar o fluxo (ex: atualização de status) que disparou o email.
 *
 * Usa a API HTTP (em vez de SMTP) porque provedores de email pessoais via
 * SMTP (ex: Gmail) costumam aceitar e descartar silenciosamente mensagens
 * enviadas a partir de IPs de datacenter (serverless), sem erro nem bounce.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!BREVO_API_KEY || !EMAIL_FROM) {
    console.warn(
      `[email] BREVO_API_KEY/EMAIL_FROM não configurados — email para "${to}" não foi enviado.`
    );
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[email] Falha ao enviar email para "${to}": ${response.status} ${body}`);
    }
  } catch (error) {
    console.error(`[email] Falha ao enviar email para "${to}":`, error);
  }
}

const STATUS_LABELS: Record<string, string> = {
  aberto: "Aberto",
  atribuido: "Atribuído",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
  cancelado: "Cancelado",
};

export function formatStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EnviarEmailMudancaStatusInput = {
  to: string;
  nomeSolicitante: string;
  chamadoId: number;
  titulo: string;
  deStatus: string;
  paraStatus: string;
};

/** Notifica o solicitante por email quando o status de um chamado dele muda. */
export async function enviarEmailMudancaStatus({
  to,
  nomeSolicitante,
  chamadoId,
  titulo,
  deStatus,
  paraStatus,
}: EnviarEmailMudancaStatusInput): Promise<void> {
  const link = `${APP_URL}/chamados/${chamadoId}`;
  const subject = `Chamado #${chamadoId} atualizado: ${formatStatusLabel(paraStatus)}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <h2 style="color:#111827; margin-bottom: 8px;">Atualização do seu chamado</h2>
      <p>Olá, ${escapeHtml(nomeSolicitante)},</p>
      <p>O status do chamado <strong>#${chamadoId} - ${escapeHtml(titulo)}</strong> foi atualizado:</p>
      <p style="font-size:16px; margin: 16px 0;">
        <span style="color:#6b7280;">${formatStatusLabel(deStatus)}</span>
        <span style="margin: 0 8px;">&rarr;</span>
        <strong style="color:#111827;">${formatStatusLabel(paraStatus)}</strong>
      </p>
      <p>
        <a href="${link}" style="display:inline-block; margin-top:8px; padding:10px 16px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:6px;">
          Ver chamado
        </a>
      </p>
      <p style="font-size:12px; color:#9ca3af; margin-top:32px;">
        Este é um email automático do NEAD. Não responda a esta mensagem.
      </p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
