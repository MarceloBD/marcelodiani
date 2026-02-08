import { tool } from "ai";
import { z } from "zod";
import { executeInSandbox } from "./sandbox";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkDailyBudget, incrementDailyBudget } from "./budgetTracker";

const SANDBOX_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60_000, // 5 per minute
};

const SANDBOX_HOURLY_LIMIT = {
  maxRequests: 15,
  windowMs: 3_600_000, // 15 per hour
};

export function createChatTools(clientIp: string) {
  return {
    generateVisualization: tool({
      description:
        "Generate a data visualization chart using Python with matplotlib. " +
        "Use this when the user asks for a chart, graph, plot, or any visual data representation. " +
        "Always use plt.style.use('dark_background') and #3b82f6 as primary color.",
      inputSchema: z.object({
        pythonCode: z
          .string()
          .describe(
            "Complete Python code using matplotlib to generate the chart. " +
            "Must include imports, data, and plt.show() at the end."
          ),
        title: z.string().describe("Short title for the chart"),
        description: z
          .string()
          .describe("Brief description of what the chart shows"),
      }),
      execute: async ({ pythonCode, title, description }) => {
        // Rate limit sandbox executions per IP
        const minuteLimit = checkRateLimit(
          `sandbox:${clientIp}`,
          SANDBOX_RATE_LIMIT
        );
        if (!minuteLimit.allowed) {
          return {
            success: false,
            title,
            description,
            error: "Too many chart requests. Please wait a minute before trying again.",
          };
        }

        const hourlyLimit = checkRateLimit(
          `sandbox-hour:${clientIp}`,
          SANDBOX_HOURLY_LIMIT
        );
        if (!hourlyLimit.allowed) {
          return {
            success: false,
            title,
            description,
            error: "Hourly chart limit reached. Please try again later.",
          };
        }

        // Check global daily budget
        if (!checkDailyBudget()) {
          return {
            success: false,
            title,
            description,
            error: "The chart service has been busy today. Please try again tomorrow.",
          };
        }

        incrementDailyBudget();

        const result = await executeInSandbox(pythonCode);

        return {
          success: result.success,
          title,
          description,
          imageBase64: result.imageBase64,
          logs: result.logs,
          error: result.error,
        };
      },
    }),
  };
}
