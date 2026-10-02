/**
 * Format an Indian Rupee amount into standard Lakh / Crore notation.
 * e.g. 4250000 -> "₹42.50 Lakh", 12500000 -> "₹1.25 Cr"
 */
export function formatPriceINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format KM driven with Indian comma separator.
 * e.g. 34200 -> "34,200 km"
 */
export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("en-IN").format(km)} km`;
}

/**
 * Calculate indicative starting monthly EMI based on standard Indian auto finance rates.
 * Default: 20% down payment, 60 months tenure, 9.5% per annum interest rate.
 */
export function calculateStartingEmi(
  price: number,
  downPaymentPercent = 20,
  tenureMonths = 60,
  annualInterestRate = 9.5
): number {
  const principal = price * (1 - downPaymentPercent / 100);
  const monthlyRate = annualInterestRate / 100 / 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

/**
 * Format starting EMI as a readable monthly string.
 * e.g. 38450 -> "₹38,450/mo"
 */
export function formatEmiPerMonth(emi: number): string {
  return `₹${new Intl.NumberFormat("en-IN").format(emi)}/mo`;
}
