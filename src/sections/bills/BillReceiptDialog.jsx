import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import * as billsApi from 'src/api/bills.api.js';
import BillReceiptContent from 'src/sections/bills/BillReceiptContent.jsx';
import { printReceipt } from 'src/utils/printReceipt.js';
import { printBillReceipt } from 'src/utils/printBillReceipt.js';

// On-screen preview of the printable invoice. Reachable from the bills list
// (row print icon) or from BillDetailDialog ("Print" button).
//
// Print button tries raw ESC/POS first (printBillReceipt -> print_raw,
// bypasses the OS print dialog entirely, same mechanism as barcode labels),
// falling back to the browser dialog (printReceipt) when not running in
// Tauri or when no receipt printer is configured on the Printer Setup page.
export default function BillReceiptDialog({ billId, onClose }) {
  const open = Boolean(billId);
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);
  const { data: b, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => billsApi.getBill(billId).then((r) => r.data),
    enabled: open,
  });

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printBillReceipt(b, () => printReceipt());
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Print bill
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading || !b ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <BillReceiptContent bill={b} />
        )}
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={!b || printing} onClick={handlePrint}>
          {printing ? 'Printing…' : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
