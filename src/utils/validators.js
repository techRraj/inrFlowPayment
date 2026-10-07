export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const isValidMobile = (v) => /^[6-9]\d{9}$/.test(String(v).trim());
export const isStrongEnough = (v) => String(v).length >= 6;
export const isPositiveNumber = (v) => !isNaN(v) && Number(v) > 0;
export const MAX_DEMO_AMOUNT = 100000;

export function validateAmount(v, { max = MAX_DEMO_AMOUNT } = {}) {
  const n = Number(v);
  if (v === '' || v === null || v === undefined) return 'Amount is required.';
  if (isNaN(n)) return 'Amount must be a number.';
  if (n <= 0) return 'Amount must be greater than 0.';
  if (n > max) return `Maximum demo transaction is ₹${max.toLocaleString('en-IN')}.`;
  return null;
}