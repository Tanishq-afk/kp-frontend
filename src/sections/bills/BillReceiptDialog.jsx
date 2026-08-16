import { useQuery } from '@tanstack/react-query';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import * as billsApi from 'src/api/bills.api.js';
import BillReceiptContent from 'src/sections/bills/BillReceiptContent.jsx';
import { printReceipt } from 'src/utils/printReceipt.js';

// On-screen preview of the printable invoice. Reachable from the bills list
// (row print icon) or from BillDetailDialog ("Print" button).
//
// Prints via the normal dialog (printReceipt, same as labels/day-summary) --
// NOT the hidden-window silent-print path (printBillWindow.js/PrintBill
// page). That approach didn't work reliably on real Windows hardware, so
// it's parked unused rather than deleted (may revisit once the raw-ESC/POS
// printing work is further along), and this reverts to the known-safe
// dialog-based flow in the meantime.
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
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={!b} onClick={() => printReceipt()}>
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
