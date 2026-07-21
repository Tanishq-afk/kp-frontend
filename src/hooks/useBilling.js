import { useCallback, useMemo, useState } from 'react';
import { DISCOUNT_TYPE, PAYMENT_METHOD } from 'src/config/constants.js';

const emptyCustomer = { id: null, name: '', phone: '' };

// Encapsulates all billing-counter state (cart, customer, discount, split
// payments, remarks) and derives the money totals + the API payload. The page
// layer handles the actual API mutations and toasts.
export function useBilling() {
  const [items, setItems] = useState([]); // { code, barcodeId, productId, productName, size, mrp }
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
        },
      ];
    });
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
  const discountAmount = useMemo(() => {
    const v = Number(discountValue) || 0;
    const amt = discountType === DISCOUNT_TYPE.PERCENT ? Math.round((subtotal * v) / 100) : v;
    return Math.max(0, Math.min(amt, subtotal));
  }, [discountType, discountValue, subtotal]);
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
    items, hasItem, addItem, removeItem, reset,
    customer, setCustomer,
    discountType, setDiscountType, discountValue, setDiscountValue,
    payments, addPayment, updatePayment, removePayment,
    remarks, setRemarks,
    subtotal, discountAmount, total, amountPaid, balance, change,
    buildPayload,
  };
}
