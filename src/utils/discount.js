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

// One cart line's item discount: the ₹ off, the price after it, and why it can't
// be applied ('' when fine). Same limits as the backend: ≤100% or ≤ the item's MRP.
export const lineDiscount = (item) => {
  const mrp = Number(item.mrp) || 0;
  const value = Number(item.discountValue) || 0;
  const percent = item.discountType === DISCOUNT_TYPE.PERCENT;
  let error = '';
  if (percent && value > 100) error = 'Max 100%';
  else if (!percent && value > mrp) error = `Max ${formatCurrency(mrp)}`;
  const discount = error ? 0 : percent ? Math.round((mrp * value) / 100) : value;
  return { discount, net: mrp - discount, error };
};

// The payload entries for lines that carry a discount.
export const itemDiscountsPayload = (items) =>
  items
    .filter((it) => Number(it.discountValue) > 0)
    .map((it) => ({ code: it.code, discountType: it.discountType, discountValue: Number(it.discountValue) }));

// A line's discount as printed: "10%" or "₹150".
export const lineDiscountLabel = (it) =>
  it.discountType === DISCOUNT_TYPE.PERCENT ? `${it.discountValue}%` : formatCurrency(it.discountValue);
