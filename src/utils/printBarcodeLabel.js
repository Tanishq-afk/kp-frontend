import EscPosBuilder from 'src/utils/escpos.js';

const STORAGE_KEY = 'kp_printer_names'; // set on the Printer Setup page

// One label's worth of ESC/POS bytes: shop name, item name, a NATIVE
// printer-drawn CODE128 barcode (crisper than rendering an <svg> to a raster
// image, and immune to every @page/CSS sizing issue we've fought), MRP.
const buildLabelBytes = (barcode) => {
  const b = new EscPosBuilder();
  b.init();
  b.align(1); // center
  b.bold(true);
  b.line('KIDZ PLAZA');
  b.bold(false);
  b.line(String(barcode.productName || '').slice(0, 32));
  b.barcodeWidth(2);
  b.barcodeHeight(50);
  b.barcodeTextPosition(2); // human-readable code printed below the bars
  b.code128(barcode.code);
  b.line();
  b.bold(true);
  b.line(`MRP :${Math.round(barcode.mrp)}`);
  b.bold(false);
  b.feed(3); // separation before the next label, no cut (die-cut stock)
  return b.toBytes();
};

// Prints one or more barcode labels via raw ESC/POS to the printer saved on
// the Printer Setup page — bypasses the browser print engine (and its @page/
// margin/pagination problems) entirely. Falls back to the normal browser
// print flow when not running in Tauri, or when no label printer has been
// configured yet, via `fallback()`.
export const printBarcodeLabels = async (barcodes, fallback) => {
  const isTauri = '__TAURI_INTERNALS__' in window;
  const { label: printerName } = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  if (!isTauri || !printerName) {
    fallback?.();
    return;
  }

  const data = barcodes.flatMap((b) => buildLabelBytes(b));
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('print_raw', { printerName, data });
};

export default printBarcodeLabels;
