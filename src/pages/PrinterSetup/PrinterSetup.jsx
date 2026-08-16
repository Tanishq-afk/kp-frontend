import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import PageHeader from 'src/components/PageHeader';

const IS_TAURI = '__TAURI_INTERNALS__' in window;
const STORAGE_KEY = 'kp_printer_names';

// ESC/POS: init, center, text, left, feed, full cut. A trivial payload just
// to prove raw bytes reach the physical printer -- not real receipt/label
// formatting (that's phase 2, once this foundation is confirmed working).
const buildTestPayload = (label) => {
  const esc = '\x1B';
  const gs = '\x1D';
  const text =
    `${esc}@` + // initialize
    `${esc}a\x01` + // center
    `KIDZ PLAZA\n${label}\n` +
    `${esc}a\x00` + // left
    `If you can read this,\nraw printing works.\n\n\n\n` +
    `${gs}V\x00`; // full cut
  return Array.from(text, (c) => c.charCodeAt(0));
};

// Phase-1 test tool for raw ESC/POS printing (bypasses the browser print
// engine entirely) -- lists Windows printers, lets you name which one is the
// receipt printer vs the label printer, and sends a trivial test payload to
// confirm bytes actually reach the hardware before any real formatting logic
// gets built on top of this.
export default function PrinterSetupPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [printers, setPrinters] = useState([]);
  const [receiptPrinter, setReceiptPrinter] = useState('');
  const [labelPrinter, setLabelPrinter] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.receipt) setReceiptPrinter(saved.receipt);
    if (saved.label) setLabelPrinter(saved.label);
  }, []);

  const refreshPrinters = async () => {
    if (!IS_TAURI) return;
    setLoading(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const list = await invoke('list_printers');
      setPrinters(list);
    } catch (e) {
      enqueueSnackbar(`Failed to list printers: ${e}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshPrinters(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ receipt: receiptPrinter, label: labelPrinter }));
    enqueueSnackbar('Saved', { variant: 'success' });
  };

  const testPrint = async (role, printerName) => {
    if (!printerName) {
      enqueueSnackbar('Pick a printer first', { variant: 'warning' });
      return;
    }
    setTesting(role);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('print_raw', { printerName, data: buildTestPayload(role.toUpperCase()) });
      enqueueSnackbar(`Sent to ${printerName}`, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setTesting('');
    }
  };

  return (
    <Box>
      <PageHeader title="Printer Setup" subtitle="Raw printing test (phase 1)" />

      {!IS_TAURI && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This only works inside the desktop app (Tauri) — raw printer access isn't available in a browser.
        </Alert>
      )}

      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Stack spacing={2}>
            <Button onClick={refreshPrinters} disabled={!IS_TAURI || loading} variant="outlined">
              {loading ? 'Refreshing…' : 'Refresh printer list'}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {printers.length > 0 ? `${printers.length} printer(s) found` : 'No printers found yet — refresh, or check Windows has them installed.'}
            </Typography>

            <TextField
              select
              label="Receipt printer (Everycom)"
              value={receiptPrinter}
              onChange={(e) => setReceiptPrinter(e.target.value)}
              fullWidth
            >
              {printers.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <Button
              variant="contained"
              onClick={() => testPrint('receipt', receiptPrinter)}
              disabled={!IS_TAURI || testing === 'receipt'}
            >
              {testing === 'receipt' ? 'Sending…' : 'Test print — receipt printer'}
            </Button>

            <TextField
              select
              label="Label printer (Sunphor)"
              value={labelPrinter}
              onChange={(e) => setLabelPrinter(e.target.value)}
              fullWidth
            >
              {printers.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
            <Button
              variant="contained"
              onClick={() => testPrint('label', labelPrinter)}
              disabled={!IS_TAURI || testing === 'label'}
            >
              {testing === 'label' ? 'Sending…' : 'Test print — label printer'}
            </Button>

            <Button onClick={save} disabled={!receiptPrinter && !labelPrinter}>
              Save printer names
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
