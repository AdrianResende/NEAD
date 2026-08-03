import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!EMAIL_USER || !EMAIL_PASSWORD) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
    });
  }

  return transporter;
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Envia um email. Nunca lança erro: se as credenciais não estiverem
 * configuradas ou o envio falhar, apenas registra um aviso no log,
 * para não quebrar o fluxo (ex: atualização de status) que disparou o email.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const client = getTransporter();

  if (!client) {
    console.warn(
      `[email] EMAIL_USER/EMAIL_PASSWORD não configurados — email para "${to}" não foi enviado.`
    );
    return;
  }

  try {
    await client.sendMail({ from: EMAIL_FROM, to, subject, html });
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
