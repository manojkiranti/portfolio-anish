const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const audCents = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plain = new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 });

export function formatAccounting(
  value: number,
  { deduct = false, currency = false }: { deduct?: boolean; currency?: boolean } = {},
): string {
  const rounded = Math.round(value);
  if (rounded === 0) return currency ? "$0" : "0";
  const body = (currency ? aud : plain).format(Math.abs(rounded));
  return deduct || rounded < 0 ? `(${body})` : body;
}

export function formatCurrency(value: number, cents = false): string {
  return (cents ? audCents : aud).format(value);
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatYears(n: number): string {
  return `${n} year${n === 1 ? "" : "s"}`;
}

export function formatNumber(value: number, maxDecimals = 0): string {
  return new Intl.NumberFormat("en-AU", { maximumFractionDigits: maxDecimals }).format(value);
}
