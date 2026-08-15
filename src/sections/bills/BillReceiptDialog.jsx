import { useQuery } from '@tanstack/react-query';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import * as billsApi from 'src/api/bills.api.js';
import BillReceiptContent from 'src/sections/bills/BillReceiptContent.jsx';
import { printBillWindow } from 'src/utils/printBillWindow.js';

// On-screen preview of the printable invoice. Reachable from the bills list
// (row print icon) or from BillDetailDialog ("Print" button). The actual
// print markup lives in BillReceiptContent, shared with the hidden
// silent-print window (PrintBill page) used on the Tauri desktop app.
export default function BillReceiptDialog({ billId, onClose }) {
  const open = Boolean(billId);
  const { data: b, isLoading } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => billsApi.getBill(billId).then((r) => r.data),
    enabled: open,
  });

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
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={!b} onClick={() => printBillWindow(billId)}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
