import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { setToken } from 'src/api/client.js';
import * as billsApi from 'src/api/bills.api.js';
import BillReceiptContent from 'src/sections/bills/BillReceiptContent.jsx';
import { printReceipt } from 'src/utils/printReceipt.js';

// Standalone, chrome-less page loaded ONLY inside the hidden print-bill Tauri
// window (see utils/printBillWindow.js) — not part of the normal app
// navigation/layout. It has no access to the main window's login state (a
// separate data directory is required whenever additionalBrowserArgs
// differs), so the token comes in via the URL and is saved into this
// window's own localStorage before fetching the bill.
//
// Fetches the bill, renders it, auto-prints once, then closes itself.
export default function PrintBillPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState(null);
  const printedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) setToken(token);
    billsApi
      .getBill(id)
      .then((r) => setBill(r.data))
      .catch((e) => setError(e.message || 'Failed to load bill'));
  }, [id, searchParams]);

  useEffect(() => {
    if (!bill || printedRef.current) return;
    printedRef.current = true;

    // Let the receipt actually paint before measuring/printing.
    const t = setTimeout(() => printReceipt(), 150);

    const closeWindow = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch {
        // not in Tauri (e.g. opened directly in a browser for testing) — no-op
      }
    };
    // afterprint fires once the print job is sent (dialog or silent) —
    // standard DOM event, works for both. Fallback timer in case it doesn't
    // fire for some reason, so the hidden window never gets stuck open.
    window.addEventListener('afterprint', closeWindow);
    const fallback = setTimeout(closeWindow, 8000);

    return () => {
      clearTimeout(t);
      clearTimeout(fallback);
      window.removeEventListener('afterprint', closeWindow);
    };
  }, [bill]);

  if (error) return <div style={{ padding: 16, fontFamily: 'sans-serif' }}>{error}</div>;
  if (!bill) return null;
  return <BillReceiptContent bill={bill} />;
}
