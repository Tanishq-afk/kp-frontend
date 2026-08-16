// Minimal ESC/POS command builder. This is a long-established, widely-cloned
// protocol (Epson's spec, implemented near-identically by generic thermal
// printers including the Sunphor SUP-LP58A) — sending these bytes directly to
// the printer bypasses the browser's print engine (and every page-size/
// margin/pagination problem that came with it) entirely. The printer
// interprets the bytes itself; there's no HTML/CSS layout involved at all.
const ESC = 0x1b;
const GS = 0x1d;

export class EscPosBuilder {
  constructor() {
    this.bytes = [];
  }

  raw(...codes) {
    this.bytes.push(...codes);
    return this;
  }

  text(str) {
    for (let i = 0; i < str.length; i += 1) {
      this.bytes.push(str.charCodeAt(i) & 0xff);
    }
    return this;
  }

  line(str = '') {
    return this.text(str).raw(0x0a);
  }

  init() {
    return this.raw(ESC, 0x40);
  }

  // 0 = left, 1 = center, 2 = right
  align(a) {
    return this.raw(ESC, 0x61, a);
  }

  bold(on) {
    return this.raw(ESC, 0x45, on ? 1 : 0);
  }

  feed(lines = 1) {
    return this.raw(ESC, 0x64, lines);
  }

  cut(partial = true) {
    return this.raw(GS, 0x56, partial ? 1 : 0);
  }

  barcodeHeight(dots) {
    return this.raw(GS, 0x68, dots);
  }

  barcodeWidth(n) {
    // 2-6 typical (module width in dots) — 2 is the thinnest/most compact.
    return this.raw(GS, 0x77, n);
  }

  // 0 = no human-readable text, 1 = above, 2 = below, 3 = both
  barcodeTextPosition(n) {
    return this.raw(GS, 0x48, n);
  }

  // CODE128 via GS k <m=73> <n> <data> (the modern/Type-B form all
  // ESC/POS-compatible printers support). {B selects Code Set B, which
  // covers our alphanumeric codes.
  code128(data) {
    const payload = `{B${data}`;
    this.raw(GS, 0x6b, 73, payload.length);
    return this.text(payload);
  }

  toBytes() {
    return this.bytes;
  }
}

export default EscPosBuilder;
