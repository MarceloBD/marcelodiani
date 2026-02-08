"use server";

import { getDatabase, ensureQuoteRequestsTable } from "@/lib/db";
import { sendQuoteNotificationEmail } from "@/lib/email";
import { sanitize } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIdentifier } from "@/lib/client-identifier";
import { logger, toError } from "@/lib/logger";

interface ActionResult {
  success: boolean;
  error?: string;
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 2000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const QUOTE_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 60_000 * 10, // 3 requests per 10 minutes
};

export async function submitQuoteRequest(formData: FormData): Promise<ActionResult> {
  const clientIp = await getClientIdentifier();
  const { allowed } = checkRateLimit(`quote:${clientIp}`, QUOTE_RATE_LIMIT);

  if (!allowed) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const sql = getDatabase();
  if (!sql) {
    return { success: false, error: "Database not configured" };
  }

  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawDescription = formData.get("description");
  const rawBudget = formData.get("budget");
  const rawProjectType = formData.get("projectType");

  if (
    typeof rawName !== "string" ||
    typeof rawEmail !== "string" ||
    typeof rawDescription !== "string"
  ) {
    return { success: false, error: "Invalid input" };
  }

  const clientName = sanitize(rawName);
  const clientEmail = sanitize(rawEmail).toLowerCase();
  const projectDescription = sanitize(rawDescription);
  const budgetRange = typeof rawBudget === "string" ? sanitize(rawBudget) : "";
  const projectType = typeof rawProjectType === "string" ? sanitize(rawProjectType) : "";

  if (!clientName || clientName.length > MAX_NAME_LENGTH) {
    return { success: false, error: "Name must be between 1 and 100 characters" };
  }

  if (!clientEmail || clientEmail.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(clientEmail)) {
    return { success: false, error: "Please provide a valid email address" };
  }

  if (!projectDescription || projectDescription.length > MAX_DESCRIPTION_LENGTH) {
    return { success: false, error: "Description must be between 1 and 2000 characters" };
  }

  try {
    await ensureQuoteRequestsTable();

    await sql`
      INSERT INTO quote_requests (client_name, client_email, project_description, budget_range, project_type)
      VALUES (${clientName}, ${clientEmail}, ${projectDescription}, ${budgetRange}, ${projectType})
    `;

    logger.info("quote-action", "Quote request submitted", {
      clientIp,
      metadata: { clientName, clientEmail, projectType },
    });

    // Send email notification (non-blocking -- don't fail the request if email fails)
    sendQuoteNotificationEmail({
      clientName,
      clientEmail,
      projectDescription,
      budgetRange,
      projectType,
    }).catch((emailError) => {
      logger.warn("quote-action", "Failed to send quote notification email", {
        error: toError(emailError),
        metadata: { clientName, clientEmail },
      });
    });

    return { success: true };
  } catch (caughtError) {
    logger.error("quote-action", "Failed to save quote request", {
      error: toError(caughtError),
      clientIp,
      metadata: { clientName, clientEmail },
    });
    return { success: false, error: "Failed to save your request. Please try again." };
  }
}
