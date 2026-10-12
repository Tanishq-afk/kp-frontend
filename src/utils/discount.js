import { DISCOUNT_TYPE } from 'src/config/constants.js';
import { formatCurrency } from 'src/utils/format.js';

// Why a discount can't be applied ('' when it's fine). Mirrors the backend limits:
// a percent above 100, or a flat amount above the bill, is rejected rather than
// silently capped (a % typed as ₹, e.g. 1620%, would otherwise zero the bill).
export const discountProblem = (type, rawValue, subtotal) => {
  const value = Number(rawValue) || 0;
  if (type === DISCOUNT_TYPE.PERCENT && value > 100) {
    return 'Percent discount cannot be more than 100%. Did you mean ₹?';
  }
  if (type !== DISCOUNT_TYPE.PERCENT && value > subtotal) {
    return `More than the bill amount ${formatCurrency(subtotal)}`;
  }
  return '';
};
