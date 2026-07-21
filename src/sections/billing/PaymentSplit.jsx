import {
  Button, IconButton, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { PAYMENT_METHOD, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from 'src/config/constants.js';

// Split payment editor — one or more {method, amount, reference} lines.
export default function PaymentSplit({ payments, onAdd, onUpdate, onRemove, balance }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2">Payment</Typography>
        <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => onAdd(balance > 0 ? balance : '')}>
          Add
        </Button>
      </Stack>
      <Stack spacing={1.5}>
        {payments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No payment added yet.
          </Typography>
        )}
        {payments.map((p, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <Stack direction="row" spacing={1} key={idx} alignItems="center">
            <TextField
              select
              label="Method"
              value={p.method}
              onChange={(e) => onUpdate(idx, { method: e.target.value })}
              sx={{ minWidth: 104 }}
            >
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label="Amount"
              value={p.amount}
              onChange={(e) => onUpdate(idx, { amount: e.target.value })}
              sx={{ flexGrow: 1 }}
            />
            {p.method === PAYMENT_METHOD.UPI && (
              <TextField
                label="Ref"
                value={p.reference}
                onChange={(e) => onUpdate(idx, { reference: e.target.value })}
                sx={{ width: 96 }}
              />
            )}
            <IconButton color="error" size="small" onClick={() => onRemove(idx)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
