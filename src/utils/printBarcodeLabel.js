import TsplBuilder, { mmToDots } from 'src/utils/tspl.js';

const STORAGE_KEY = 'kp_printer_names'; // set on the Printer Setup page

// Physical label stock: 48mm wide die-cut labels. Real label height has been
// wrong twice now, inferred each time from how content split across
// physical labels rather than a direct measurement:
//   - Started at 210mm (an old driver setting) -> print showed 3 blanks
//     after every label -> real height inferred as 210/4 ≈ 52.5mm -> set to
//     50mm.
//   - At 50mm, a print showed the SAME logical label's content (title +
//     barcode on one physical label, MRP on the next) splitting across
//     TWO physical labels -> real height re-inferred as (50+2)/2 ≈ 26mm.
// TODO: get a ruler measurement of one real label (border to border) to
// confirm this instead of inferring again if it's still off -- 24mm is a
// guess, not a measurement.
const LABEL_WIDTH_MM = 48;
const LABEL_HEIGHT_MM = 24;
const GAP_MM = 2;
const LABEL_WIDTH_DOTS = mmToDots(LABEL_WIDTH_MM);
// Widest a barcode is allowed to get, leaving a margin each side -- the
// label's real height/width came from an earlier inference (24mm confirmed
// working; still not a ruler measurement), so this stays conservative
// rather than using the full 48mm.
const MAX_BARCODE_WIDTH_MM = 40;

// TSC built-in bitmap font cell widths in dots (before any xMult scaling) --
// standard/documented TSPL font metrics, used to center text manually since
// TSPL TEXT has no built-in center-alignment mode (always left-aligned from
// the given x).
const FONT_WIDTH_DOTS = { 1: 8, 2: 12, 3: 16 };
const centeredX = (text, font) => {
  const w = String(text).length * FONT_WIDTH_DOTS[font];
  return Math.max(0, Math.round((LABEL_WIDTH_DOTS - w) / 2));
};

// Code128 (Code Set B) module count: 11 dots/char for each data char, plus
// start(11) + checksum(11) + stop(13) = 35 fixed overhead.
const code128Modules = (data) => String(data).length * 11 + 35;

const buildLabelBytes = (barcode) => {
  const b = new TsplBuilder();
  b.size(LABEL_WIDTH_MM, LABEL_HEIGHT_MM);
  b.gap(GAP_MM);
  b.direction(1);
  b.reference(0, 0);
  b.cls();

  const title = 'KIDZ PLAZA';
  // productName + articleNumber on one line (was productName alone) --
  // requested so the article number is visible on the printed label.
  // Capped at 26 chars total, same width-safety margin as before.
  const nameLine = `${String(barcode.productName || '').slice(0, 16)} #${barcode.articleNumber || ''}`.slice(0, 26);
  const mrpLine = `MRP :${Math.round(barcode.mrp)}`;

  // Adaptive barcode width: code length varies (historical imported codes
  // aren't all the same length as new KP########-#### ones), so a fixed
  // module width either overflows long codes or leaves short ones
  // needlessly thin. Pick the widest module size (1-3 dots) that still fits
  // MAX_BARCODE_WIDTH_MM for THIS specific code, then center it.
  const modules = code128Modules(barcode.code);
  const maxWidthDots = mmToDots(MAX_BARCODE_WIDTH_MM);
  const narrow = Math.max(1, Math.min(3, Math.floor(maxWidthDots / modules)));
  const barcodeWidthDots = modules * narrow;
  const barcodeX = Math.max(0, Math.round((LABEL_WIDTH_DOTS - barcodeWidthDots) / 2));

  // Vertical layout for the ~24mm real height, with a bit more breathing
  // room between rows than the first (correctly-fitting but cramped) pass.
  b.text(centeredX(title, 2), mmToDots(1), title, { font: '2' });
  b.text(centeredX(nameLine, 2), mmToDots(4.5), nameLine, { font: '2' });
  b.barcode128(barcodeX, mmToDots(8), barcode.code, {
    height: mmToDots(6),
    readable: 1,
    narrow,
    wide: narrow,
  });
  b.text(centeredX(mrpLine, 2), mmToDots(17.5), mrpLine, { font: '2' });
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
