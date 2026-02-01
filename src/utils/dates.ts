/**
 * Date utilities for OneTab Importer
 */

/**
 * Convert Unix epoch milliseconds to ISO 8601 string
 */
export function epochToIso(epochMs: number): string {
  return new Date(epochMs).toISOString();
}

/**
 * Convert ISO 8601 string to Unix epoch milliseconds
 */
export function isoToEpoch(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * Get year from ISO date string
 */
export function getYear(isoString: string): string {
  return isoString.substring(0, 4);
}

/**
 * Get year-month (YYYY-MM) from ISO date string
 */
export function getYearMonth(isoString: string): string {
  return isoString.substring(0, 7);
}

/**
 * Get ISO week number and year (YYYY-Www) from date
 */
export function getYearWeek(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();

  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);

  // Calculate the week number
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get date only (YYYY-MM-DD) from ISO date string
 */
export function getDateOnly(isoString: string): string {
  return isoString.substring(0, 10);
}

/**
 * Format date for display in Markdown
 */
export function formatDateForDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date for Markdown header (shorter)
 */
export function formatDateForHeader(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(
  dateIso: string,
  fromIso?: string,
  toIso?: string
): boolean {
  const date = new Date(dateIso).getTime();

  if (fromIso) {
    const from = new Date(fromIso).getTime();
    if (date < from) return false;
  }

  if (toIso) {
    const to = new Date(toIso).getTime();
    if (date > to) return false;
  }

  return true;
}

/**
 * Parse a date string that might be in various formats
 * Supports: YYYY-MM-DD, YYYY-MM, YYYY, or ISO 8601
 */
export function parseFlexibleDate(dateStr: string, endOfPeriod = false): string {
  // Already ISO format
  if (dateStr.includes('T')) {
    return dateStr;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    if (endOfPeriod) {
      return `${dateStr}T23:59:59.999Z`;
    }
    return `${dateStr}T00:00:00.000Z`;
  }

  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    if (endOfPeriod) {
      const [year, month] = dateStr.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      return `${dateStr}-${lastDay.toString().padStart(2, '0')}T23:59:59.999Z`;
    }
    return `${dateStr}-01T00:00:00.000Z`;
  }

  // YYYY
  if (/^\d{4}$/.test(dateStr)) {
    if (endOfPeriod) {
      return `${dateStr}-12-31T23:59:59.999Z`;
    }
    return `${dateStr}-01-01T00:00:00.000Z`;
  }

  // Try parsing as-is
  return new Date(dateStr).toISOString();
}

/**
 * Get current timestamp as ISO string
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Get a human-readable relative time description
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
