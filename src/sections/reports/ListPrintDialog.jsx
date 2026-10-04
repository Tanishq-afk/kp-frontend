import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { formatCurrency, formatDate, formatNumber, formatDateTime } from 'src/utils/format.js';
import { printReceipt } from 'src/utils/printReceipt.js';
import { printBillReceipt } from 'src/utils/printBillReceipt.js';
import ReceiptLogo from 'src/components/ReceiptLogo.jsx';

const Rule = () => <Box sx={{ borderTop: '1px dashed #000', my: 0.75 }} />;

// One listing line: "KP-0319  04 Oct 2026 ........ ₹1,408".
function ListRow({ label, date, amount }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ fontSize: 15 }}>
      <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
        {label}
        <Box component="span" sx={{ ml: 1 }}>{formatDate(date)}</Box>
      </Box>
      <Box component="span" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatCurrency(amount)}</Box>
    </Stack>
  );
}

// Printable listing (thermal-receipt style) of bills or returns for a date range.
// `rows` = [{ key, label, date, amount }]; printed through the same path as the
// bill receipt (raw to the receipt printer in the desktop app, browser otherwise).
// `filters` = { search, paymentStatus } are optional print-only filters, chosen in
// the dialog (blank = no filter). `paymentOptions` (null = no payment filter) lists
// the payment statuses offered.
export default function ListPrintDialog({
  open, onClose, title, range, rows, count, total, totalLabel, user,
  filters, onFiltersChange, paymentOptions = null, loading = false, truncated = false, limit,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);
  const setFilter = (key) => (e) => onFiltersChange({ ...filters, [key]: e.target.value });
  const appliedFilters = [
    filters.paymentStatus && `payment: ${filters.paymentStatus}`,
    filters.search && `search: "${filters.search}"`,
  ].filter(Boolean);

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

  const fromLabel = range.from ? formatDate(range.from) : 'Start';
  const toLabel = range.to ? formatDate(range.to) : 'Today';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        className="no-print"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Print {title.toLowerCase()}
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1.5} className="no-print" sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Optional filters for the printout (leave blank to print everything in the date range)
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder={title === 'Bill' ? 'Search invoice, customer name or phone…' : 'Search return no., invoice, customer…'}
            value={filters.search}
            onChange={setFilter('search')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          {paymentOptions && (
            <TextField select size="small" fullWidth label="Payment" value={filters.paymentStatus} onChange={setFilter('paymentStatus')}>
              <MenuItem value="">All</MenuItem>
              {paymentOptions.map((p) => (
                <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>
              ))}
            </TextField>
          )}
        </Stack>

        <Box
          className="receipt-area"
          sx={{
            fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.5,
            // Must match print.css's .receipt-area width/padding (see printReceipt.js).
            width: '80mm',
            mx: 'auto',
            color: 'common.black',
            bgcolor: 'common.white',
            padding: '4mm',
          }}
        >
          <ReceiptLogo />
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 600, fontSize: 15 }}>Piplod</Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700, mt: 0.5 }}>
            {title.toUpperCase()} LIST
          </Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontWeight: 700 }}>
            {fromLabel} to {toLabel}
          </Typography>

          {appliedFilters.length > 0 && (
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 14 }}>
              Filters: {appliedFilters.join(' · ')}
            </Typography>
          )}

          <Rule />
          {loading && (
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 15 }}>Loading…</Typography>
          )}
          {!loading && rows.length === 0 && (
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 15 }}>No records match</Typography>
          )}
          {rows.map((r) => (
            <ListRow key={r.key} label={r.label} date={r.date} amount={r.amount} />
          ))}

          {truncated && (
            <Typography component="div" sx={{ textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
              Showing first {formatNumber(limit)} of {formatNumber(count)}. Narrow the date range to print the rest.
            </Typography>
          )}

          <Rule />
          <Stack direction="row" justifyContent="space-between" sx={{ fontWeight: 400 }}>
            <Box component="span">Count</Box>
            <Box component="span">{formatNumber(count)}</Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ fontWeight: 700 }}>
            <Box component="span">{totalLabel}</Box>
            <Box component="span">{formatCurrency(total)}</Box>
          </Stack>

          <Rule />
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500, mt: 0.5 }}>
            Printed {formatDateTime(new Date())}
            {user?.name ? ` by ${user.name}` : ''}
          </Typography>
          <Typography component="div" sx={{ textAlign: 'center', fontSize: 15, fontWeight: 500 }}>
            {'*'.repeat(24)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} disabled={printing || loading} onClick={handlePrint}>
          {printing ? 'Printing…' : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
