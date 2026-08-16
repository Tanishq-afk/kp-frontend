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

// One label's worth of TSPL commands: shop name, item name + article
// number, a native printer-drawn CODE128 barcode, MRP. TSPL (not ESC/POS) --
// this is a TSC-OEM label printer ("TSC TE244"), a different command
// language entirely from the Everycom receipt printer. See tspl.js for why.
const buildLabelBytes = (barcode) => {
  const b = new TsplBuilder();
  b.size(LABEL_WIDTH_MM, LABEL_HEIGHT_MM);
  b.gap(GAP_MM);
  b.direction(1);
  b.reference(0, 0);
  b.cls();
  // Vertical layout re-tightened for the ~24mm real height (was designed
  // for 50mm) -- content now aims to end around Y=17mm, leaving margin.
  b.text(mmToDots(4), mmToDots(0.5), 'KIDZ PLAZA', { font: '2' });
  // productName + articleNumber on one line (was productName alone) --
  // requested so the article number is visible on the printed label.
  // Capped at 26 chars total, same width-safety margin as before.
  const nameLine = `${String(barcode.productName || '').slice(0, 16)} #${barcode.articleNumber || ''}`.slice(0, 26);
  b.text(mmToDots(4), mmToDots(3.5), nameLine, { font: '2' });
  // narrow=1 -- a 16-char code like "KP00009960-4778" needs ~200 Code128
  // modules; at narrow=2 dots/module that's ~53mm, wider than the 48mm
  // label. At narrow=1 it's ~26mm, comfortably inside with margin to spare.
  b.barcode128(mmToDots(4), mmToDots(6.5), barcode.code, {
    height: mmToDots(5),
    readable: 1,
    narrow: 1,
    wide: 1,
  });
  b.text(mmToDots(4), mmToDots(14.5), `MRP :${Math.round(barcode.mrp)}`, { font: '2' });
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
