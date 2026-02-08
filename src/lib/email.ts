import { Resend } from "resend";
import { serviceBreakers } from "@/lib/circuit-breaker";
import { withRetry, retryConfigs } from "@/lib/retry";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "marcelodianib@gmail.com";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  return new Resend(apiKey);
}

interface QuoteEmailData {
  clientName: string;
  clientEmail: string;
  projectDescription: string;
  budgetRange: string;
  projectType: string;
}

interface ErrorAlertData {
  source: string;
  message: string;
  stackTrace?: string;
  metadata?: Record<string, unknown>;
}

export async function sendQuoteNotificationEmail({
  clientName,
  clientEmail,
  projectDescription,
  budgetRange,
  projectType,
}: QuoteEmailData): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  // Circuit breaker: fail fast if Resend has been unresponsive
  if (!serviceBreakers.resend.isAvailable()) return false;

  const safeName = escapeHtml(clientName);
  const safeEmail = escapeHtml(clientEmail);
  const safeBudget = escapeHtml(budgetRange || "Not specified");
  const safeProjectType = escapeHtml(projectType || "Not specified");
  const safeDescription = escapeHtml(projectDescription);

  try {
    // Retry email delivery (handles transient Resend API issues)
    await withRetry(
      () =>
        resend.emails.send({
          from: "Portfolio <onboarding@resend.dev>",
          to: OWNER_EMAIL,
          subject: `New Quote Request from ${safeName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #e4e4e7; border-radius: 12px;">
              <h1 style="color: #3b82f6; font-size: 20px; margin-bottom: 24px;">New Quote Request</h1>

              <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Client</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">${safeName}</p>
              </div>

              <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Email</p>
                <a href="mailto:${safeEmail}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">${safeEmail}</a>
              </div>

              <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Project Type</p>
                <p style="margin: 0; font-size: 14px;">${safeProjectType}</p>
              </div>

              <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Budget Range</p>
                <p style="margin: 0; font-size: 14px;">${safeBudget}</p>
              </div>

              <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Project Description</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeDescription}</p>
              </div>

              <p style="color: #71717a; font-size: 11px; margin-top: 24px; text-align: center;">
                Sent from marcelodiani.com portfolio
              </p>
            </div>
          `,
        }),
      retryConfigs.resend,
    );

    serviceBreakers.resend.onSuccess();
    return true;
  } catch {
    serviceBreakers.resend.onFailure();
    return false;
  }
}

// Note: sendErrorAlertEmail intentionally does NOT use the circuit breaker
// to avoid circular dependency (logger → email → circuit-breaker → logger).
// It already has its own error handling and email throttling in the logger.

export async function sendErrorAlertEmail({
  source,
  message,
  stackTrace,
  metadata,
}: ErrorAlertData): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const safeSource = escapeHtml(source);
  const safeMessage = escapeHtml(message);
  const safeStack = stackTrace ? escapeHtml(stackTrace) : null;
  const metadataBlock = metadata
    ? escapeHtml(JSON.stringify(metadata, null, 2))
    : null;
  const timestamp = new Date().toISOString();

  try {
    await resend.emails.send({
      from: "Portfolio Alerts <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject: `[ERROR] ${source}: ${message.slice(0, 80)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #e4e4e7; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
            <h1 style="color: #ef4444; font-size: 20px; margin: 0;">Error Alert</h1>
          </div>

          <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Source</p>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #fbbf24;">${safeSource}</p>
          </div>

          <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Message</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6;">${safeMessage}</p>
          </div>

          ${safeStack ? `
          <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Stack Trace</p>
            <pre style="margin: 0; font-size: 11px; line-height: 1.5; color: #a1a1aa; white-space: pre-wrap; word-break: break-all;">${safeStack}</pre>
          </div>
          ` : ""}

          ${metadataBlock ? `
          <div style="background: #18181b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px; color: #a1a1aa; font-size: 12px; text-transform: uppercase;">Metadata</p>
            <pre style="margin: 0; font-size: 11px; line-height: 1.5; color: #a1a1aa; white-space: pre-wrap;">${metadataBlock}</pre>
          </div>
          ` : ""}

          <p style="color: #71717a; font-size: 11px; margin-top: 24px; text-align: center;">
            ${escapeHtml(timestamp)} &middot; marcelodiani.com
          </p>
        </div>
      `,
    });

    return true;
  } catch {
    return false;
  }
}
