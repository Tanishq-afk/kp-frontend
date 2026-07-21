import {
  Box, Checkbox, Chip, Divider, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';

// The original bill and its units. Tick a unit to return it, then mark it
// resellable (goes back to stock, fresh label minted) or damaged (retired).
export default function ReturnItemsPanel({ source, isSelected, onToggle, onSetResellable, selection }) {
  const { bill, items } = source;

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{bill.billNumber}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(bill.customerName || 'Walk-in')}
              {bill.customerPhone ? ` · ${bill.customerPhone}` : ''} · {formatDateTime(bill.createdAt)}
            </Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            Bill total {formatCurrency(bill.total)}
          </Typography>
        </Stack>
      </Box>
      <Divider />

      {items.map((it, idx) => {
        const selected = isSelected(it.barcode);
        const resellable = selection[it.barcode]?.resellable ?? true;
        return (
          <Box key={it.barcode} sx={{ opacity: it.returnable ? 1 : 0.55 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 1.25 }}>
              <Checkbox
                checked={selected}
                disabled={!it.returnable}
                onChange={() => onToggle(it.barcode)}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography noWrap fontWeight={600}>{it.productName}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" variant="outlined" label={`Size ${it.size}`} />
                  {!it.returnable && <Chip size="small" color="info" label="Already returned" />}
                </Stack>
              </Box>

              {selected && it.returnable && (
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={resellable ? 'resellable' : 'damaged'}
                  onChange={(_, v) => v && onSetResellable(it.barcode, v === 'resellable')}
                >
                  <ToggleButton value="resellable" color="success">Resellable</ToggleButton>
                  <ToggleButton value="damaged" color="error">Damaged</ToggleButton>
                </ToggleButtonGroup>
              )}

              <Box sx={{ textAlign: 'right', minWidth: 84 }}>
                <Typography fontWeight={700}>{formatCurrency(it.refundAmount)}</Typography>
                <Typography variant="caption" color="text.secondary">refund</Typography>
              </Box>
            </Stack>
            {idx < items.length - 1 && <Divider />}
          </Box>
        );
      })}
    </Paper>
  );
}
