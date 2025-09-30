export function formatNumber(n) {
  if (typeof n !== "number") return "-";
  return n.toLocaleString();
}

export function formatCurrency(n, currency = "USD") {
  if (typeof n !== "number") return "-";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function money(n, currency = "USD") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}