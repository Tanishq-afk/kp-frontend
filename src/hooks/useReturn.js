import { useCallback, useMemo, useState } from 'react';
import { DISCOUNT_TYPE, PAYMENT_METHOD } from 'src/config/constants.js';

// Encapsulates the returns-counter state: the picked original bill, which of its
// units are being returned (each resellable/damaged), an optional exchange cart
// of newly-scanned items, and the payment split that settles the net. Derives
// the return credit, exchange total, net (collect/refund/even) and the API
// payload. The page layer owns the API mutations + toasts.
export function useReturn() {
  const [source, setSource] = useState(null); // { bill, items } from getReturnableBill
  const [selected, setSelected] = useState({}); // barcodeId -> { resellable, labelLost }
  const [newItems, setNewItems] = useState([]); // exchange cart: { code, barcodeId, productName, size, mrp }
  const [discountType, setDiscountType] = useState(DISCOUNT_TYPE.FLAT);
  const [discountValue, setDiscountValue] = useState('');
  const [payments, setPayments] = useState([]); // { method, amount, reference }
  const [remarks, setRemarks] = useState('');

  const clearWork = () => {
    setSelected({});
    setNewItems([]);
    setDiscountType(DISCOUNT_TYPE.FLAT);
    setDiscountValue('');
    setPayments([]);
    setRemarks('');
  };

  const loadBill = useCallback((data) => { setSource(data); clearWork(); }, []);
  const reset = useCallback(() => { setSource(null); clearWork(); }, []);

  // --- return selection ---
  const isSelected = useCallback((barcodeId) => Boolean(selected[barcodeId]), [selected]);
  const toggleReturn = useCallback((barcodeId) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[barcodeId]) delete next[barcodeId];
      else next[barcodeId] = { resellable: true, labelLost: false };
      return next;
    });
  }, []);
  const setResellable = useCallback((barcodeId, resellable) => {
    setSelected((prev) =>
      prev[barcodeId]
        ? { ...prev, [barcodeId]: { resellable, labelLost: resellable ? prev[barcodeId].labelLost : false } }
        : prev
    );
  }, []);
  const setLabelLost = useCallback((barcodeId, labelLost) => {
    setSelected((prev) => (prev[barcodeId] ? { ...prev, [barcodeId]: { ...prev[barcodeId], labelLost } } : prev));
  }, []);

  // --- exchange cart ---
  const hasNewItem = useCallback((code) => newItems.some((i) => i.code === code), [newItems]);
  const addNewItem = useCallback((bc) => {
    setNewItems((prev) => {
      if (prev.some((i) => i.code === bc.code)) return prev;
      return [
        ...prev,
        {
          code: bc.code,
          barcodeId: bc._id,
          productName: bc.productName,
          size: bc.size,
          mrp: Number(bc.mrp) || 0,
        },
      ];
    });
  }, []);
  const removeNewItem = useCallback((code) => {
    setNewItems((prev) => prev.filter((i) => i.code !== code));
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

  // --- derived money ---
  const returnItems = useMemo(() => {
    if (!source) return [];
    return source.items
      .filter((it) => selected[it.barcode])
      .map((it) => ({
        ...it,
        resellable: selected[it.barcode].resellable,
        labelLost: selected[it.barcode].labelLost,
      }));
  }, [source, selected]);

  const returnCredit = useMemo(
    () => returnItems.reduce((s, it) => s + (Number(it.refundAmount) || 0), 0),
    [returnItems]
  );

  const exchangeSubtotal = useMemo(
    () => newItems.reduce((s, i) => s + (Number(i.mrp) || 0), 0),
    [newItems]
  );
  const exchangeDiscount = useMemo(() => {
    const v = Number(discountValue) || 0;
    const amt = discountType === DISCOUNT_TYPE.PERCENT ? Math.round((exchangeSubtotal * v) / 100) : v;
    return Math.max(0, Math.min(amt, exchangeSubtotal));
  }, [discountType, discountValue, exchangeSubtotal]);
  const exchangeTotal = Math.max(0, exchangeSubtotal - exchangeDiscount);

  const netAmount = exchangeTotal - returnCredit; // >0 collect, <0 refund, 0 even
  // eslint-disable-next-line no-nested-ternary
  const direction = netAmount > 0 ? 'collect' : netAmount < 0 ? 'refund' : 'even';
  const settleAmount = Math.abs(netAmount);
  const amountPaid = useMemo(
    () => payments.reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [payments]
  );
  const balance = Math.max(0, settleAmount - amountPaid);

  // A collect must be fully tendered; a refund/even can be processed as-is.
  const canSubmit = returnItems.length > 0 && (direction !== 'collect' || amountPaid >= netAmount);

  const buildPayload = useCallback(
    () => ({
      originalBill: source?.bill?._id,
      returnItems: returnItems.map((it) => ({
        barcode: it.barcode,
        resellable: it.resellable,
        labelLost: it.labelLost || false,
      })),
      newBarcodes: newItems.map((i) => i.code),
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
    [source, returnItems, newItems, discountType, discountValue, payments, remarks]
  );

  return {
    source, loadBill, reset,
    selected, isSelected, toggleReturn, setResellable, setLabelLost,
    newItems, hasNewItem, addNewItem, removeNewItem,
    discountType, setDiscountType, discountValue, setDiscountValue,
    payments, addPayment, updatePayment, removePayment,
    remarks, setRemarks,
    returnItems, returnCredit,
    exchangeSubtotal, exchangeDiscount, exchangeTotal,
    netAmount, direction, settleAmount, amountPaid, balance,
    canSubmit, buildPayload,
  };
}
