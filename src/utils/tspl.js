// Minimal TSPL/TSPL2 command builder (TSC Printer Language) — the command
// set TSC-brand (and TSC-OEM, e.g. the Sunphor SUP-LP58A / "TSC TE244")
// label printers actually speak. This is why raw label printing "succeeded"
// (the spooler happily accepted the bytes) but nothing came out: those bytes
// were ESC/POS (escpos.js), and a TSPL-only printer just silently discards
// command bytes it doesn't recognize instead of erroring. ESC/POS stays in
// use for the Everycom *receipt* printer — this file is label-printer-only.
//
// TSPL is plain ASCII, line-oriented, CR+LF terminated (verified against
// TSC's official TSPL/TSPL2 programming manual examples). Positions are in
// dots — this printer is 203 DPI, so 1mm ≈ 8 dots.
const DOTS_PER_MM = 8;

export const mmToDots = (mm) => Math.round(mm * DOTS_PER_MM);

export class TsplBuilder {
  constructor() {
    this.lines = [];
  }

  raw(cmd) {
    this.lines.push(cmd);
    return this;
  }

  // Width/height in mm — must match the physical label stock (48mm x 210mm
  // die-cut labels here).
  size(widthMm, heightMm) {
    return this.raw(`SIZE ${widthMm} mm,${heightMm} mm`);
  }

  // Gap between labels + sensor offset, in mm. Die-cut stock with a gap
  // between labels (not continuous/black-mark) — GAP_MM may need tuning
  // against the real printer if labels come out misaligned or skip.
  gap(gapMm, offsetMm = 0) {
    return this.raw(`GAP ${gapMm} mm,${offsetMm} mm`);
  }

  direction(d = 1) {
    return this.raw(`DIRECTION ${d}`);
  }

  reference(x = 0, y = 0) {
    return this.raw(`REFERENCE ${x},${y}`);
  }

  // Clears the image buffer — required once per label, after SIZE/GAP.
  cls() {
    return this.raw('CLS');
  }

  // x,y in dots. font: TSC built-in bitmap fonts "1".."8" (bigger number =
  // bigger font) — "3" is a reasonable medium default. xMult/yMult scale it
  // further (1 = no scaling).
  text(x, y, str, { font = '3', rotation = 0, xMult = 1, yMult = 1 } = {}) {
    const escaped = String(str).replace(/"/g, '\\"');
    return this.raw(`TEXT ${x},${y},"${font}",${rotation},${xMult},${yMult},"${escaped}"`);
  }

  // Code128 barcode. readable: 0 = no human-readable text, 1 = readable text
  // printed per printer default placement.
  barcode128(x, y, data, { height = 80, readable = 1, rotation = 0, narrow = 2, wide = 2 } = {}) {
    const escaped = String(data).replace(/"/g, '\\"');
    return this.raw(
      `BARCODE ${x},${y},"128",${height},${readable},${rotation},${narrow},${wide},"${escaped}"`,
    );
  }

  print(sets = 1, copies = 1) {
    return this.raw(`PRINT ${sets},${copies}`);
  }

  toBytes() {
    const text = this.lines.map((l) => `${l}\r\n`).join('');
    return Array.from(text, (c) => c.charCodeAt(0) & 0xff);
  }
}

export default TsplBuilder;
