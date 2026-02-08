/**
 * Global daily budget tracker for sandbox executions.
 * Limits total E2B sandbox calls per day to cap costs.
 *
 * In-memory — resets on server restart.
 * For production with multiple instances, use Redis or a database.
 */

const MAX_DAILY_SANDBOX_EXECUTIONS = 200;

interface DailyBudget {
  date: string;
  count: number;
}

let dailyBudget: DailyBudget = {
  date: new Date().toISOString().split("T")[0],
  count: 0,
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function resetIfNewDay(): void {
  const today = getTodayDate();
  if (dailyBudget.date !== today) {
    dailyBudget = { date: today, count: 0 };
  }
}

export function checkDailyBudget(): boolean {
  resetIfNewDay();
  return dailyBudget.count < MAX_DAILY_SANDBOX_EXECUTIONS;
}

export function incrementDailyBudget(): void {
  resetIfNewDay();
  dailyBudget.count += 1;
}
