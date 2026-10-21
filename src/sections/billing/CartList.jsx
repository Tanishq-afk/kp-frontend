import {
  Box, Chip, Divider, IconButton, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveShoppingCartRoundedIcon from '@mui/icons-material/RemoveShoppingCartRounded';
import { formatCurrency } from 'src/utils/format.js';
import { DISCOUNT_TYPE } from 'src/config/constants.js';
import { lineDiscount } from 'src/utils/discount.js';

// Scanned items. With `onDiscountChange`, each line gets an item-wise discount
// (₹ or %); `discountLocked` disables it while a bill-level discount is in use.
export default function CartList({ items, onRemove, onDiscountChange, discountLocked = false }) {
  if (!items.length) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
        <RemoveShoppingCartRoundedIcon sx={{ fontSize: 44, mb: 1, opacity: 0.5 }} />
        <Typography variant="subtitle1">No items yet</Typography>
        <Typography variant="body2">Scan a barcode to start a sale.</Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <Stack
        direction="row"
        sx={{ px: 2, py: 1.25, color: 'text.secondary' }}
        justifyContent="space-between"
      >
        <Typography variant="caption" fontWeight={700}>
          {items.length} ITEM{items.length > 1 ? 'S' : ''}
        </Typography>
      </Stack>
      <Divider />
      {items.map((it, idx) => (
        <Box key={it.code}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography noWrap fontWeight={600}>
                {it.productName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={`Size ${it.size}`} variant="outlined" />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {it.code}
                </Typography>
              </Stack>
            </Box>
            <LinePrice item={it} />
            <IconButton color="error" size="small" onClick={() => onRemove(it.code)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Stack>
          {onDiscountChange && (
            <LineDiscountInput item={it} onChange={onDiscountChange} disabled={discountLocked} />
          )}
          {idx < items.length - 1 && <Divider />}
        </Box>
      ))}
    </Paper>
  );
}

function LinePrice({ item }) {
  const { discount, net } = lineDiscount(item);
  if (!discount) return <Typography fontWeight={700}>{formatCurrency(item.mrp)}</Typography>;
  return (
    <Stack alignItems="flex-end">
      <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
        {formatCurrency(item.mrp)}
      </Typography>
      <Typography fontWeight={700} color="success.main">{formatCurrency(net)}</Typography>
    </Stack>
  );
}

function LineDiscountInput({ item, onChange, disabled }) {
  const { error } = lineDiscount(item);
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ px: 1.5, pb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ pt: 0.75, minWidth: 56 }}>
        Discount
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={item.discountType}
        disabled={disabled}
        onChange={(_, v) => v && onChange(item.code, { discountType: v })}
      >
        <ToggleButton value={DISCOUNT_TYPE.FLAT} sx={{ py: 0.25 }}>₹</ToggleButton>
        <ToggleButton value={DISCOUNT_TYPE.PERCENT} sx={{ py: 0.25 }}>%</ToggleButton>
      </ToggleButtonGroup>
      <TextField
        type="number"
        size="small"
        value={item.discountValue}
        disabled={disabled}
        onChange={(e) => onChange(item.code, { discountValue: e.target.value })}
        placeholder="0"
        error={Boolean(error)}
        helperText={error || (disabled ? 'Bill discount in use' : undefined)}
        inputProps={{ min: 0, step: 'any' }}
        sx={{ width: 120 }}
      />
    </Stack>
  );
}
