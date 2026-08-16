import html2canvas from 'html2canvas';
import EscPosBuilder from 'src/utils/escpos.js';

const STORAGE_KEY = 'kp_printer_names'; // set on the Printer Setup page

// 80mm ESC/POS thermal printers (Everycom included) print at 576 dots
// (72mm) across at 203 DPI — this is the printer's usable print width, not
// the full 80mm paper width.
const PRINT_WIDTH_DOTS = 576;
// Luminance threshold (0-255) for converting the captured render to 1-bit
// black/white. html2canvas renders real anti-aliased text, so this just
// needs to sit mid-grey to keep strokes solid without going too heavy.
const THRESHOLD = 180;

// Captures an already-rendered DOM element (the exact same preview the user
// sees in the dialog — BillReceiptContent) as a 1-bit bitmap and packs it
// into ESC/POS raster format. This prints EXACTLY what the preview shows —
// real fonts, real weights, the real ₹ symbol — instead of re-implementing
// the design as plain printer text, which can never be pixel-identical to
// actual CSS rendering (see conversation: the hand-built text version's
// bold/₹-substitution/font were all visibly different from the browser
// design once printed on real hardware).
const captureReceiptRaster = async (el) => {
  const scale = PRINT_WIDTH_DOTS / el.offsetWidth;
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const widthDots = canvas.width;
  const heightDots = canvas.height;
  const widthBytes = Math.ceil(widthDots / 8);
  const ctx = canvas.getContext('2d');
  const { data: px } = ctx.getImageData(0, 0, widthDots, heightDots);

  const raster = new Uint8Array(widthBytes * heightDots);
  for (let y = 0; y < heightDots; y += 1) {
    for (let x = 0; x < widthDots; x += 1) {
      const i = (y * widthDots + x) * 4;
      const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      const alpha = px[i + 3];
      // Transparent or light pixels stay white (bit 0); only sufficiently
      // dark, opaque pixels become printed (black) dots.
      if (alpha > 128 && lum < THRESHOLD) {
        raster[y * widthBytes + (x >> 3)] |= 0x80 >> (x % 8);
      }
    }
  }
  return { widthBytes, heightDots, data: Array.from(raster) };
};

// Prints a bill via raw ESC/POS (as a captured image of the real preview) to
// the printer saved on the Printer Setup page — bypasses the browser print
// dialog entirely, same mechanism as printBarcodeLabel.js. Falls back to the
// normal browser print flow when not running in Tauri, no receipt printer is
// configured, or the preview element isn't in the DOM.
export const printBillReceipt = async (fallback, elClassName = 'receipt-area') => {
  const isTauri = '__TAURI_INTERNALS__' in window;
  const { receipt: printerName } = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const el = document.querySelector(`.${elClassName}`);

  if (!isTauri || !printerName || !el) {
    fallback?.();
    return;
  }

  const { widthBytes, heightDots, data } = await captureReceiptRaster(el);

  const bld = new EscPosBuilder();
  bld.init();
  bld.align(1);
  bld.rasterImage(widthBytes, heightDots, data);
  bld.feed(3);
  bld.cut(true);

  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('print_raw', { printerName, data: bld.toBytes() });
};

export default printBillReceipt;
