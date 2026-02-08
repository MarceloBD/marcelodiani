/**
 * Generates a deterministic monthly discount percentage (5-20%)
 * that changes every month and never repeats the same value consecutively.
 *
 * Uses a simple hash based on year and month to produce a consistent
 * value throughout the entire month.
 */

const MINIMUM_DISCOUNT = 5;
const MAXIMUM_DISCOUNT = 20;
const DISCOUNT_RANGE = MAXIMUM_DISCOUNT - MINIMUM_DISCOUNT + 1; // 16 possible values (5..20)

function hashMonthSeed(year: number, month: number): number {
  // Simple deterministic hash from year+month
  const seed = year * 100 + month;
  let hash = seed;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
  hash = (hash >> 16) ^ hash;
  return Math.abs(hash);
}

function getDiscountForMonth(year: number, month: number): number {
  const hash = hashMonthSeed(year, month);
  return MINIMUM_DISCOUNT + (hash % DISCOUNT_RANGE);
}

export function getMonthlyDiscount(now: Date = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const currentDiscount = getDiscountForMonth(year, month);

  // Check if the previous month had the same discount
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const previousDiscount = getDiscountForMonth(previousYear, previousMonth);

  // If same as previous, shift by 1 (wrapping within range)
  if (currentDiscount === previousDiscount) {
    const shifted = currentDiscount + 1;
    return shifted > MAXIMUM_DISCOUNT ? MINIMUM_DISCOUNT : shifted;
  }

  return currentDiscount;
}

export function getEndOfMonth(now: Date = new Date()): Date {
  const year = now.getFullYear();
  const month = now.getMonth();
  // Last day of current month, 23:59:59.999
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

export function getTimeRemaining(now: Date = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
} {
  const endOfMonth = getEndOfMonth(now);
  const totalMilliseconds = Math.max(0, endOfMonth.getTime() - now.getTime());

  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalMilliseconds };
}
