/**
 * Utilities for formatting and date manipulations in BounceFIN.
 */

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Format numeric value to Brazilian Real (BRL)
 */
export function formatCurrency(value: number | undefined | null): string {
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

/**
 * Parses user input to safe numeric float.
 * Handles inputs like "1.200,50", "1200.50", "4500", etc.
 * Enforces non-negative values and upper bounds to avoid numeric overflow / NaN issues.
 */
export function parseCurrencyInput(value: string | number): number {
  const sanitize = (num: number): number => {
    if (isNaN(num) || !isFinite(num) || num < 0) return 0;
    // Cap at 1 billion to prevent arithmetic overflow and calculation degradation
    const capped = Math.min(1000000000, num);
    return Number(capped.toFixed(2));
  };

  if (typeof value === 'number') {
    return sanitize(value);
  }
  if (!value) return 0;

  // Clean string
  const cleaned = value.toString().trim().replace(/R\$\s?/, '');
  if (!cleaned) return 0;

  // Check if Brazilian format with comma as decimal separator
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Ex: 1.200,50 -> 1200.50
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return sanitize(parsed);
  } else if (cleaned.includes(',')) {
    // Ex: 1200,50 -> 1200.50
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);
    return sanitize(parsed);
  } else {
    // Ex: 1200.50 or 1200
    const parsed = parseFloat(cleaned);
    return sanitize(parsed);
  }
}

/**
 * Normalizes year and month into "YYYY-MM"
 */
export function toYearMonth(year: number, monthIndex: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${mm}`;
}

/**
 * Parses "YYYY-MM" into { year: number, monthIndex: number }
 */
export function parseYearMonth(ym: string): { year: number; monthIndex: number } {
  if (!ym || !ym.includes('-')) {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  }
  const parts = ym.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  return {
    year: isNaN(year) ? new Date().getFullYear() : year,
    monthIndex: isNaN(month) ? new Date().getMonth() : Math.max(0, Math.min(11, month)),
  };
}

/**
 * Formats "YYYY-MM" into "Janeiro de 2026"
 */
export function formatMonthYear(ym: string): string {
  const { year, monthIndex } = parseYearMonth(ym);
  return `${MONTH_NAMES[monthIndex]} de ${year}`;
}

/**
 * Returns the number of days in a given year and month (0-indexed month)
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Checks if a given yearMonth (YYYY-MM) falls within the start and end month inclusive.
 * Handles inputs in "YYYY-MM" or "YYYY-MM-DD" format.
 */
export function isMonthInRange(targetYM: string, start: string, end: string): boolean {
  if (!targetYM) return false;
  const target = targetYM.slice(0, 7);
  const startYM = (start || '').slice(0, 7);
  const endYM = (end || '').slice(0, 7);

  if (startYM && target < startYM) {
    return false;
  }
  if (endYM && target > endYM) {
    return false;
  }
  return true;
}

/**
 * Formats date "YYYY-MM-DD" to "DD/MM/YYYY"
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Calculates if a due date is overdue relative to today.
 */
export function isDateOverdue(dueDateStr: string, isPaid: boolean): boolean {
  if (isPaid) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr + 'T00:00:00');
  return due < today;
}
