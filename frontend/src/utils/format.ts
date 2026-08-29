/**
 * Utility functions for formatting salary/currency values consistently.
 */

import { CURRENCY_SYMBOLS, COUNTRY_NAMES } from "../types/employee";

/**
 * Format a salary string with currency symbol and thousands separators.
 * Salary comes from the API as a decimal string (e.g., "85000.00").
 */
export function formatSalary(salary: string | number, currency: string): string {
  const num = typeof salary === "string" ? parseFloat(salary) : salary;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // Use Intl for locale-aware formatting with no decimal places for cleaner display
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return `${symbol}${formatted}`;
}

/**
 * Format a salary with decimal places (for detail views).
 */
export function formatSalaryPrecise(salary: string | number, currency: string): string {
  const num = typeof salary === "string" ? parseFloat(salary) : salary;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${symbol}${formatted}`;
}

/**
 * Get display name for a country code.
 */
export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
