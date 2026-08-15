// Prints a thermal receipt (.receipt-area) at its EXACT content height,
// instead of relying on `@page { size: 80mm auto }`. The `auto` height
// keyword isn't reliably honored by every print engine/driver — several
// fall back to a full default page length (Letter/A4-ish, ~280-300mm) when
// they can't resolve it, and the printer prints that whole length, mostly
// blank, after the receipt content ends.
//
// Measuring the rendered element and injecting an exact `@page` size makes
// this deterministic regardless of engine support for `auto`.
const PX_PER_MM = 96 / 25.4;
const FALLBACK_HEIGHT_MM = 200;
const SAFETY_MARGIN_MM = 2; // small buffer so the last line never clips

export const printReceipt = (className = 'receipt-area') => {
  const el = document.querySelector(`.${className}`);
  const heightMm = el ? Math.ceil(el.offsetHeight / PX_PER_MM) + SAFETY_MARGIN_MM : FALLBACK_HEIGHT_MM;

  let styleTag = document.getElementById('dynamic-receipt-page-size');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-receipt-page-size';
    document.head.appendChild(styleTag);
  }
  // Must target the same NAMED page print.css assigns .receipt-area to
  // ("receipt") — an unnamed @page here would no longer apply to it now that
  // it's explicitly bound to a named page (see print.css for why: the label
  // printer needs its own page size, so this can't be the single default
  // page anymore). Placed after print.css in the DOM, so this wins the
  // cascade and overrides the static `80mm auto` fallback there.
  styleTag.textContent = `@page receipt { size: 80mm ${heightMm}mm; margin: 0; }`;

  window.print();
};

export default printReceipt;
