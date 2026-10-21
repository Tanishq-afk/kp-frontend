import { useCallback, useMemo, useState } from 'react';
import { DISCOUNT_TYPE, PAYMENT_METHOD } from 'src/config/constants.js';
import { itemDiscountsPayload, lineDiscount } from 'src/utils/discount.js';

const emptyCustomer = { id: null, name: '', phone: '' };

// Encapsulates all billing-counter state (cart, customer, discount, split
// payments, remarks) and derives the money totals + the API payload. The page
// layer handles the actual API mutations and toasts.
export function useBilling() {
  // { code, barcodeId, productId, productName, size, mrp, discountType, discountValue }
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [discountType, setDiscountType] = useState(DISCOUNT_TYPE.FLAT);
  const [discountValue, setDiscountValue] = useState('');
  const [payments, setPayments] = useState([]); // { method, amount, reference }
  const [remarks, setRemarks] = useState('');

  const hasItem = useCallback((code) => items.some((i) => i.code === code), [items]);

  const addItem = useCallback((barcode) => {
    setItems((prev) => {
      if (prev.some((i) => i.code === barcode.code)) return prev;
      return [
        ...prev,
        {
          code: barcode.code,
          barcodeId: barcode._id,
          productId: barcode.product?._id || barcode.product,
          productName: barcode.productName,
          size: barcode.size,
          mrp: Number(barcode.mrp) || 0,
          discountType: DISCOUNT_TYPE.FLAT,
          discountValue: '',
        },
      ];
    });
  }, []);

  // Item-wise discount on one cart line (patch: { discountType?, discountValue? }).
  const setItemDiscount = useCallback((code, patch) => {
    setItems((prev) => prev.map((i) => (i.code === code ? { ...i, ...patch } : i)));
  }, []);

  const removeItem = useCallback((code) => {
    setItems((prev) => prev.filter((i) => i.code !== code));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setCustomer(emptyCustomer);
    setDiscountType(DISCOUNT_TYPE.FLAT);
    setDiscountValue('');
    setPayments([]);
    setRemarks('');
  }, []);

  // --- payments ---
  const addPayment = useCallback((amount) => {
    setPayments((prev) => [...prev, { method: PAYMENT_METHOD.CASH, amount: amount ?? '', reference: '' }]);
  }, []);
  const updatePayment = useCallback((index, patch) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }, []);
  const removePayment = useCallback((index) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // --- derived totals ---
  const subtotal = useMemo(() => items.reduce((s, i) => s + Number(i.mrp || 0), 0), [items]);
  // A bill uses item discounts OR a bill discount, never both (the backend
  // rejects both); whichever is in use locks the other's inputs.
  const itemDiscountTotal = useMemo(() => items.reduce((s, i) => s + lineDiscount(i).discount, 0), [items]);
  const hasItemDiscount = items.some((i) => Number(i.discountValue) > 0);
  const hasBillDiscount = Number(discountValue) > 0;
  const itemDiscountError = items.some((i) => lineDiscount(i).error);
  const discountAmount = useMemo(() => {
    if (hasItemDiscount) return Math.min(itemDiscountTotal, subtotal);
    const v = Number(discountValue) || 0;
    const amt = discountType === DISCOUNT_TYPE.PERCENT ? Math.round((subtotal * v) / 100) : v;
    return Math.max(0, Math.min(amt, subtotal));
  }, [hasItemDiscount, itemDiscountTotal, discountType, discountValue, subtotal]);
  const total = Math.max(0, subtotal - discountAmount);
  const amountPaid = useMemo(
    () => payments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [payments]
  );
  const balance = Math.max(0, total - amountPaid);
  const change = Math.max(0, amountPaid - total);

  // API payload shared by complete + hold.
  const buildPayload = useCallback(
    () => ({
      barcodes: items.map((i) => i.code),
      itemDiscounts: itemDiscountsPayload(items),
      customer:
        customer.phone && customer.name
          ? { name: customer.name.trim(), phone: customer.phone.trim() }
          : undefined,
      discountType,
      discountValue: Number(discountValue) || 0,
      payments: payments
        .filter((p) => Number(p.amount) > 0)
        .map((p) => ({
          method: p.method,
          amount: Number(p.amount),
          ...(p.reference?.trim() ? { reference: p.reference.trim() } : {}),
        })),
      remarks: remarks.trim() || undefined,
    }),
    [items, customer, discountType, discountValue, payments, remarks]
  );

  return {
    items, hasItem, addItem, removeItem, reset, setItemDiscount,
    hasItemDiscount, hasBillDiscount, itemDiscountError,
    customer, setCustomer,
    discountType, setDiscountType, discountValue, setDiscountValue,
    payments, addPayment, updatePayment, removePayment,
    remarks, setRemarks,
    subtotal, discountAmount, total, amountPaid, balance, change,
    buildPayload,
  };
}
