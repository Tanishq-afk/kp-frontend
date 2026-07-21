import { Box, Chip, Divider, IconButton, Paper, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RemoveShoppingCartRoundedIcon from '@mui/icons-material/RemoveShoppingCartRounded';
import { formatCurrency } from 'src/utils/format.js';

export default function CartList({ items, onRemove }) {
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
            <Typography fontWeight={700}>{formatCurrency(it.mrp)}</Typography>
            <IconButton color="error" size="small" onClick={() => onRemove(it.code)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Stack>
          {idx < items.length - 1 && <Divider />}
        </Box>
      ))}
    </Paper>
  );
}
