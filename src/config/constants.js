// ----------------------------------------------------------------------------
// Enums mirrored from the backend (kp-backend/src/config/constants.js) plus UI
// label/colour maps. Keep this the single source of truth on the frontend —
// never hardcode these strings in components.
// ----------------------------------------------------------------------------

export const ROLE = { SUPERADMIN: 'superadmin', ADMIN: 'admin' };
export const ROLES = [ROLE.SUPERADMIN, ROLE.ADMIN];

export const GENDERS = ['Male', 'Female', 'Unisex', 'Kids'];

export const SIZE_TYPE = { ALPHA: 'alpha', NUMERIC: 'numeric', FREESIZE: 'freesize' };
export const SIZE_TYPES = [SIZE_TYPE.ALPHA, SIZE_TYPE.NUMERIC, SIZE_TYPE.FREESIZE];
export const SIZE_TYPE_LABELS = {
  [SIZE_TYPE.ALPHA]: 'Alpha (XS–XXXL)',
  [SIZE_TYPE.NUMERIC]: 'Numeric (0–42)',
  [SIZE_TYPE.FREESIZE]: 'Free size',
};

export const ALPHA_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export const NUMERIC_SIZES = ['0', '2', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30', '32', '34', '36', '38', '40', '42'];
export const FREE_SIZE = ['Free Size'];

export const sizesForType = (sizeType) => {
  if (sizeType === SIZE_TYPE.ALPHA) return ALPHA_SIZES;
  if (sizeType === SIZE_TYPE.NUMERIC) return NUMERIC_SIZES;
  if (sizeType === SIZE_TYPE.FREESIZE) return FREE_SIZE;
  return [];
};

export const PAYMENT_METHOD = { CASH: 'cash', CARD: 'card', UPI: 'upi' };
export const PAYMENT_METHODS = [PAYMENT_METHOD.CASH, PAYMENT_METHOD.CARD, PAYMENT_METHOD.UPI];
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.CARD]: 'Card',
  [PAYMENT_METHOD.UPI]: 'UPI',
};

export const DISCOUNT_TYPE = { FLAT: 'flat', PERCENT: 'percent' };

export const PAYMENT_STATUS = { PAID: 'paid', PARTIAL: 'partial', UNPAID: 'unpaid' };
export const BILL_STATUS = { HELD: 'held', COMPLETED: 'completed', CANCELLED: 'cancelled', REFUNDED: 'refunded' };
export const BARCODE_STATUS = { AVAILABLE: 'available', SOLD: 'sold', RETURNED: 'returned', VOID: 'void' };
export const PRINT_STATUS = { PENDING: 'pending', PRINTED: 'printed' };

// MUI Chip colour per status (used across lists).
export const PAYMENT_STATUS_COLOR = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'error',
};
export const BILL_STATUS_COLOR = {
  held: 'warning',
  completed: 'success',
  cancelled: 'default',
  refunded: 'info',
};

export const CURRENCY = 'INR';
