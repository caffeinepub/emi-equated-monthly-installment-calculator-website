/**
 * Formatting utilities for displaying numbers and currency values.
 */

/**
 * Format a number as currency with thousands separators and 2 decimal places.
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "1,234,567.89")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number with thousands separators and no decimal places.
 * @param value - The numeric value to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
