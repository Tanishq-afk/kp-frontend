import {
  Box, Checkbox, Chip, Divider, FormControlLabel, Paper, Stack, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material';
import { formatCurrency, formatDateTime } from 'src/utils/format.js';

// Why an item can't be returned right now — distinct from "genuinely already
// returned" so historical (unit-untracked) bills don't get a misleading label.
const UNAVAILABLE_LABEL = {
  already_returned: { label: 'Already returned', color: 'info' },
  no_unit_link: { label: 'Not trackable', color: 'default' },
};
const UNAVAILABLE_TOOLTIP = {
  no_unit_link: "This bill has no barcode/unit record for this line (imported historical bill) — it can't be processed as a return in-app.",
};

// The original bill and its units. Tick a unit to return it, then mark it
// resellable (back to stock — the same barcode is reused unless the label is
// lost, in which case a fresh one is issued) or damaged (retired).
export default function ReturnItemsPanel({ source, isSelected, onToggle, onSetResellable, onSetLabelLost, selection }) {
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
        const key = it.barcode || `${it.productName}-${idx}`;
        const selected = isSelected(it.barcode);
        const resellable = selection[it.barcode]?.resellable ?? true;
        const unavailable = UNAVAILABLE_LABEL[it.returnableReason];
        const tooltip = UNAVAILABLE_TOOLTIP[it.returnableReason];
        return (
          <Box key={key} sx={{ opacity: it.returnable ? 1 : 0.55 }}>
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
                  {unavailable && (
                    <Tooltip title={tooltip || ''} disableHoverListener={!tooltip}>
                      <Chip size="small" color={unavailable.color} label={unavailable.label} />
                    </Tooltip>
                  )}
                </Stack>
              </Box>

              {selected && it.returnable && (
                <Stack spacing={0.25} alignItems="flex-end">
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={resellable ? 'resellable' : 'damaged'}
                    onChange={(_, v) => v && onSetResellable(it.barcode, v === 'resellable')}
                  >
                    <ToggleButton value="resellable" color="success">Resellable</ToggleButton>
                    <ToggleButton value="damaged" color="error">Damaged</ToggleButton>
                  </ToggleButtonGroup>
                  {resellable && (
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          sx={{ py: 0.25 }}
                          checked={Boolean(selection[it.barcode]?.labelLost)}
                          onChange={(e) => onSetLabelLost(it.barcode, e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="caption" color="text.secondary">
                          Label lost — issue new barcode
                        </Typography>
                      }
                    />
                  )}
                </Stack>
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
