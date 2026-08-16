import EscPosBuilder from 'src/utils/escpos.js';
import {
  LOGO_WIDTH_BYTES, LOGO_HEIGHT_DOTS, LOGO_RASTER_BYTES,
} from 'src/assets/kidzPlazaLogoRaster.js';
import { formatDateTime } from 'src/utils/format.js';
import { DISCOUNT_TYPE, PAYMENT_METHOD_LABELS } from 'src/config/constants.js';

const STORAGE_KEY = 'kp_printer_names'; // set on the Printer Setup page

// 80mm ESC/POS thermal printers (Everycom included) print at 576 dots
// (72mm) across at 203 DPI; default Font A is 12 dots wide -> 48 chars/line.
// This mirrors the browser receipt's 80mm width minus its 4mm+4mm padding
// (BillReceiptContent.jsx) -- same physical print area either way.
const COLS = 48;
const SR_W = 3;
const QTY_W = 4;
const PRICE_W = 10; // fits "Rs. 99,999" -- see padLeftSafe below for anything bigger
// 1 space between each of the 4 columns (3 gaps) -- without these the
// columns run together with no visual separation (e.g. qty "1" glued
// directly to "Rs. 1,299").
const ITEM_W = COLS - SR_W - QTY_W - PRICE_W - 3; // 28

const TERMS = [
  'No Return/No Exchange for Discounted Merchandise.',
  'Exchange within 3 Days from the Sale.',
  'No Cash Refund.',
  'M.R.P. inclusive of all Taxes.',
];

// The printer's default code page (PC437/PC850-style) has no ₹ glyph --
// text() sends one byte per char (charCodeAt & 0xff), so an unmapped
// Unicode char like ₹ (U+20B9) would print as garbage. "Rs." is the
// standard thermal-receipt substitute. This is raw-print-only; the browser
// receipt (formatCurrency, format.js) keeps the real ₹ symbol.
const money = (n) => `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(n) || 0)}`;

const padRight = (s, n) => {
  const str = String(s);
  return str.length >= n ? str.slice(0, n) : str + ' '.repeat(n - str.length);
};
const padLeft = (s, n) => {
  const str = String(s);
  return str.length >= n ? str.slice(0, n) : ' '.repeat(n - str.length) + str;
};

// Same as padLeft, but NEVER truncates -- for money amounts, where slicing
// (e.g. "Rs. 10,500" -> "Rs. 10,50") would silently print a wrong price.
// An unexpectedly large value just overflows the column (row goes a bit
// long/misaligned) instead of lying about the amount.
const padLeftSafe = (s, n) => {
  const str = String(s);
  return str.length >= n ? str : ' '.repeat(n - str.length) + str;
};

// label ..... value, padded to fill exactly COLS chars (falls back to a
// single space separator if the combined text is already too long to fit).
const kvLine = (label, value) => {
  const l = String(label);
  const v = String(value);
  const gap = COLS - l.length - v.length;
  return gap > 0 ? l + ' '.repeat(gap) + v : `${l} ${v}`;
};

const wrapWords = (text, width) => {
  const words = String(text).split(' ').filter(Boolean);
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    if (!cur) { cur = w; return; }
    if (`${cur} ${w}`.length <= width) cur += ` ${w}`;
    else { lines.push(cur); cur = w; }
  });
  if (cur) lines.push(cur);
  if (lines.length === 0) return [''];
  // Hard-split any single word longer than the column (very long SKU names).
  return lines.flatMap((l) => {
    if (l.length <= width) return [l];
    const chunks = [];
    for (let i = 0; i < l.length; i += width) chunks.push(l.slice(i, i + width));
    return chunks;
  });
};

// One item's table row(s) -- wraps the item name into the Item Name column,
// continuation lines leave Sr./Qty/Price blank (matches how a real
// dot-matrix/thermal POS table wraps long descriptions).
const itemLines = (sr, itemText, qty, price) =>
  wrapWords(itemText, ITEM_W).map((line, i) =>
    `${padRight(i === 0 ? String(sr) : '', SR_W)} ${padRight(line, ITEM_W)} ${padLeftSafe(i === 0 ? String(qty) : '', QTY_W)} ${padLeftSafe(i === 0 ? String(price) : '', PRICE_W)}`);

const buildBillReceiptBytes = (b) => {
  const bld = new EscPosBuilder();
  bld.init();

  bld.align(1); // center
  bld.rasterImage(LOGO_WIDTH_BYTES, LOGO_HEIGHT_DOTS, LOGO_RASTER_BYTES);
  bld.feed(1);
  bld.bold(true);
  bld.line('Piplod');
  bld.line('TAX INVOICE');
  bld.bold(false);
  bld.align(0); // left

  bld.line('-'.repeat(COLS));
  bld.bold(true);
  bld.line(kvLine('Bill No', b.billNumber));
  bld.bold(false);
  bld.line(kvLine('Date', formatDateTime(b.createdAt)));
  bld.line(kvLine('Customer', b.customerName || 'Walk-in'));
  if (b.customerPhone) bld.line(kvLine('Contact No', b.customerPhone));

  bld.line('-'.repeat(COLS));
  bld.bold(true);
  bld.line(`${padRight('Sr.', SR_W)} ${padRight('Item Name', ITEM_W)} ${padLeft('Qty', QTY_W)} ${padLeft('Price', PRICE_W)}`);
  bld.bold(false);
  bld.line('-'.repeat(COLS));

  const items = b.items || [];
  if (items.length === 0) {
    bld.line(kvLine('-', 'No item detail'));
  } else {
    items.forEach((it, i) => {
      const name = `${it.productName || ''}${it.size && it.size !== 'Free Size' ? ` (${it.size})` : ''}`;
      itemLines(i + 1, name, 1, money(it.mrp)).forEach((l) => bld.line(l));
    });
  }

  bld.line('-'.repeat(COLS));
  bld.line(kvLine('Total', money(b.subtotal)));
  const discountLabel = b.discountType === DISCOUNT_TYPE.PERCENT
    ? `${b.discountValue}% (- ${money(b.discount)})`
    : `- ${money(b.discount)}`;
  bld.line(kvLine('Discount', discountLabel));
  bld.line(kvLine('Additional Charges', money(b.tax)));
  bld.bold(true);
  bld.line(kvLine('Final Amount', money(b.total)));
  bld.bold(false);

  bld.line('-'.repeat(COLS));
  const payments = b.payments || [];
  if (payments.length === 0) {
    bld.line(kvLine('Amount paid', money(b.amountPaid)));
  } else {
    payments.forEach((p) => bld.line(kvLine(PAYMENT_METHOD_LABELS[p.method] || p.method, money(p.amount))));
  }
  if (b.changeReturned > 0) bld.line(kvLine('Change returned', money(b.changeReturned)));

  if (b.remarks) {
    bld.line('-'.repeat(COLS));
    wrapWords(`Remarks: ${b.remarks}`, COLS).forEach((l) => bld.line(l));
  }

  bld.line('-'.repeat(COLS));
  bld.bold(true);
  bld.line('Terms and Conditions:');
  bld.bold(false);
  TERMS.forEach((t, i) => wrapWords(`${i + 1}) ${t}`, COLS).forEach((l) => bld.line(l)));

  bld.line('-'.repeat(COLS));
  bld.align(1);
  bld.line('Thank you for shopping with us!');
  bld.line('*'.repeat(24));
  bld.align(0);

  bld.feed(3);
  bld.cut(true);

  return bld.toBytes();
};

// Prints a bill via raw ESC/POS to the printer saved on the Printer Setup
// page — bypasses the browser print dialog entirely, same mechanism as
// printBarcodeLabel.js. Falls back to the normal browser print flow when not
// running in Tauri, or when no receipt printer has been configured yet.
export const printBillReceipt = async (bill, fallback) => {
  const isTauri = '__TAURI_INTERNALS__' in window;
  const { receipt: printerName } = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  if (!isTauri || !printerName) {
    fallback?.();
    return;
  }

  const data = buildBillReceiptBytes(bill);
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('print_raw', { printerName, data });
};

export default printBillReceipt;
