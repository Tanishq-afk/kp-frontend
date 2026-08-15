import { getToken } from 'src/api/client.js';
import { printReceipt } from 'src/utils/printReceipt.js';

// Prints a bill silently (no OS print dialog) via a hidden second Tauri
// window with --kiosk-printing, while the main window stays free of that
// flag so everything else (barcode labels, day-summary) keeps the normal
// dialog. See the conversation: kiosk-printing is a whole-window setting,
// not something a single print() call can toggle, so a silent-bill-only
// flow needs its own window.
//
// The hidden window loads /print/bill/:id?token=... on the SAME live URL —
// it can't share the main window's localStorage (Windows requires a
// separate data directory whenever additionalBrowserArgs differs), so the
// auth token is handed over via the URL instead, and PrintBill.jsx re-saves
// it into that window's own localStorage before fetching.
//
// Falls back to printing in the current window/dialog when not running
// inside Tauri (plain browser) — there's no secondary-window concept there.
export const printBillWindow = async (billId) => {
  const isTauri = '__TAURI_INTERNALS__' in window;
  if (!isTauri) {
    printReceipt();
    return;
  }

  const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
  const token = getToken();
  const url = `${window.location.origin}/print/bill/${billId}?token=${encodeURIComponent(token || '')}`;

  const win = new WebviewWindow(`print-bill-${billId}-${Date.now()}`, {
    url,
    visible: false,
    width: 400,
    height: 300,
    additionalBrowserArgs: '--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --kiosk-printing',
    // Required on Windows whenever additionalBrowserArgs differs from
    // another webview (the main window has none) — they can't share a
    // WebView2 data directory in that case.
    dataDirectory: 'print-bill-profile',
  });

  win.once('tauri://error', (e) => {
    console.error('Print window failed to open:', e);
  });
};

export default printBillWindow;
