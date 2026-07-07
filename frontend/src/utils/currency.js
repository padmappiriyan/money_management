/** Application default currency (French client). */
export const CURRENCY_CODE = 'EUR';
export const CURRENCY_SYMBOL = '€';
export const CURRENCY_LABEL = 'EUR (€)';
export const CURRENCY_LOCALE = 'fr-FR';

/**
 * Formats a numeric amount using French locale (e.g. 200,00).
 */
export function formatCurrencyAmount(value) {
  const num = Number(value) || 0;
  return num
    .toLocaleString(CURRENCY_LOCALE, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\u202f/g, ' ');
}

/**
 * Full display with label prefix (e.g. "EUR (€) 200,00").
 */
export function formatCurrencyWithLabel(value) {
  return `${CURRENCY_LABEL} ${formatCurrencyAmount(value)}`;
}

/**
 * Compact display with symbol prefix (e.g. "€ 200,00").
 */
export function formatCurrencyCompact(value) {
  return `${CURRENCY_SYMBOL} ${formatCurrencyAmount(value)}`;
}

/**
 * Y-axis tick labels for charts (e.g. "€100", "€1.5k").
 */
export function formatChartAxisTick(value) {
  const num = Number(value) || 0;
  if (num >= 1000) {
    const scaled = num / 1000;
    const formatted = scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1);
    return `${CURRENCY_SYMBOL}${formatted}k`;
  }
  return `${CURRENCY_SYMBOL}${num}`;
}
