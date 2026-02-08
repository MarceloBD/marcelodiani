import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { buildSystemPrompt } from "@/lib/chat/cvContext";
import { createChatTools } from "@/lib/chat/tools";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitize } from "@/lib/sanitize";
import { logger, toError } from "@/lib/logger";
import { serviceBreakers } from "@/lib/circuit-breaker";

const MAX_MESSAGE_LENGTH = 1_000;
const MAX_CONVERSATION_MESSAGES = 20;
const MAX_AI_TOKENS = 1_024;
const MAX_TOOL_STEPS = 3;

const CHAT_MINUTE_LIMIT = {
  maxRequests: 15,
  windowMs: 60_000,
};

const CHAT_HOURLY_LIMIT = {
  maxRequests: 50,
  windowMs: 3_600_000,
};

const CHAT_DAILY_LIMIT = {
  maxRequests: 20,
  windowMs: 86_400_000,
};

const CHAT_MONTHLY_LIMIT = {
  maxRequests: 100,
  windowMs: 2_592_000_000,
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);

  try {

    // Rate limit: per minute
    const minuteLimit = checkRateLimit(`chat:${clientIp}`, CHAT_MINUTE_LIMIT);
    if (!minuteLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please wait a moment." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit: per hour
    const hourlyLimit = checkRateLimit(
      `chat-hour:${clientIp}`,
      CHAT_HOURLY_LIMIT
    );
    if (!hourlyLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Hourly message limit reached. Please try again later.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit: per day
    const dailyLimit = checkRateLimit(
      `chat-day:${clientIp}`,
      CHAT_DAILY_LIMIT
    );
    if (!dailyLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Daily message limit reached. Please come back tomorrow.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit: per month
    const monthlyLimit = checkRateLimit(
      `chat-month:${clientIp}`,
      CHAT_MONTHLY_LIMIT
    );
    if (!monthlyLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Monthly message limit reached. Please try again next month.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { messages, locale = "en" } = body as {
      messages: UIMessage[];
      locale: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate the last user message length
    const lastMessage = messages[messages.length - 1];
    const lastMessageText = lastMessage.parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("") ?? "";

    if (lastMessageText.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize text parts in the last message
    if (lastMessage.parts) {
      for (const part of lastMessage.parts) {
        if (part.type === "text") {
          (part as { type: "text"; text: string }).text = sanitize(part.text);
        }
      }
    }

    // Limit conversation history to prevent token abuse
    const trimmedMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

    // Circuit breaker: fail fast if OpenAI has been unresponsive
    if (!serviceBreakers.openai.isAvailable()) {
      return new Response(
        JSON.stringify({ error: "AI service is temporarily unavailable. Please try again later." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(locale);
    const tools = createChatTools(clientIp);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: await convertToModelMessages(trimmedMessages),
      tools,
      stopWhen: stepCountIs(MAX_TOOL_STEPS),
      maxOutputTokens: MAX_AI_TOKENS,
    });

    serviceBreakers.openai.onSuccess();
    return result.toUIMessageStreamResponse();
  } catch (caughtError) {
    serviceBreakers.openai.onFailure();
    logger.error("chat-api", "Unexpected error in chat API", {
      error: toError(caughtError),
      clientIp,
    });
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
