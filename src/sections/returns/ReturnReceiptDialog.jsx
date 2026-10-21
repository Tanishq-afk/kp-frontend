import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import * as returnsApi from 'src/api/returns.api.js';
import ReturnReceiptContent from 'src/sections/returns/ReturnReceiptContent.jsx';
import { printReceipt } from 'src/utils/printReceipt.js';
import { printBillReceipt } from 'src/utils/printBillReceipt.js';

// On-screen preview + print of a return slip. Reachable from the returns list
// (row print icon) and from ReturnSuccessDialog. Prints exactly like
// BillReceiptDialog: raw to the configured receipt printer, else the browser
// print dialog.
export default function ReturnReceiptDialog({ returnId, onClose }) {
  const open = Boolean(returnId);
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);
  const { data: r, isLoading } = useQuery({
    queryKey: ['return', returnId],
    queryFn: () => returnsApi.getReturn(returnId).then((res) => res.data),
    enabled: open,
  });

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printBillReceipt(() => printReceipt());
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Print return slip
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading || !r ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <ReturnReceiptContent ret={r} />
        )}
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={!r || printing} onClick={handlePrint}>
          {printing ? 'Printing…' : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
