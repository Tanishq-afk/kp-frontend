import TsplBuilder, { mmToDots } from 'src/utils/tspl.js';

const STORAGE_KEY = 'kp_printer_names'; // set on the Printer Setup page

// Physical label stock: 48mm wide die-cut labels. LABEL_HEIGHT_MM was
// originally set to 210mm (per an earlier printer-driver setting), but a
// real test print showed 3 blank labels after every printed one — meaning
// the printer was treating one 210mm SIZE block as a single canvas spanning
// 4 real physical labels (210 / 4 ≈ 52.5mm). Corrected to the real physical
// pitch: ~50mm label + ~2mm gap ≈ 52mm, matching what was observed. If
// labels still drift or skip, this is the first thing to tune further (needs
// to match the real gap the printer's sensor detects).
const LABEL_WIDTH_MM = 48;
const LABEL_HEIGHT_MM = 50;
const GAP_MM = 2;

// One label's worth of TSPL commands: shop name, item name, a native
// printer-drawn CODE128 barcode, MRP. TSPL (not ESC/POS) — this is a TSC-OEM
// label printer ("TSC TE244"), a different command language entirely from
// the Everycom receipt printer. See tspl.js for why.
const buildLabelBytes = (barcode) => {
  const b = new TsplBuilder();
  b.size(LABEL_WIDTH_MM, LABEL_HEIGHT_MM);
  b.gap(GAP_MM);
  b.direction(1);
  b.reference(0, 0);
  b.cls();
  // Vertical layout tightened -- a real print showed the MRP line spilling
  // onto the start of the NEXT physical label, i.e. title+subtitle+barcode
  // (bars + firmware-added human-readable text below them)+MRP together
  // needed more than the ~50mm real label height. Compressed everything
  // (barcode height 10mm -> 8mm, tighter spacing) so total content now ends
  // around Y=30mm, leaving real margin regardless of the exact real height.
  b.text(mmToDots(4), mmToDots(2), 'KIDZ PLAZA', { font: '3' });
  // Sliced to 26 (was 32) -- at font "2"'s ~12-dot character width, 32 chars
  // reached the full 48mm label width with zero margin.
  b.text(mmToDots(4), mmToDots(8), String(barcode.productName || '').slice(0, 26), { font: '2' });
  // narrow=1 (was 2) -- a 16-char code like "KP00009960-4778" needs ~200
  // Code128 modules; at narrow=2 dots/module that's ~53mm, wider than the
  // 48mm label (the barcode's right edge was running past the printable
  // area). At narrow=1 it's ~26mm, comfortably inside with margin to spare.
  b.barcode128(mmToDots(4), mmToDots(14), barcode.code, {
    height: mmToDots(8),
    readable: 1,
    narrow: 1,
    wide: 1,
  });
  b.text(mmToDots(4), mmToDots(27), `MRP :${Math.round(barcode.mrp)}`, { font: '3' });
  b.print(1, 1);
  return b.toBytes();
};

// Prints one or more barcode labels via raw TSPL to the printer saved on the
// Printer Setup page — bypasses the browser print engine (and its @page/
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
