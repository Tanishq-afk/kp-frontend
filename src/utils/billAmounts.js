// Credit dues received after the sale: what the bill has been paid beyond the
// counter payments and any exchange credit (see the Dues page).
export const paidLater = (bill) => {
  const atCounter = (bill?.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const later = (Number(bill?.amountPaid) || 0) - atCounter - (Number(bill?.appliedCredit) || 0);
  return Math.max(0, Math.round(later * 100) / 100);
};

// True when the bill's discount came from item-wise discounts (not a bill discount).
export const usesItemDiscounts = (bill) => (bill?.items || []).some((it) => it.discount > 0);
