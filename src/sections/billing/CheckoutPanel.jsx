import {
  Button, Divider, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import CustomerSelect from './CustomerSelect.jsx';
import PaymentSplit from './PaymentSplit.jsx';
import { DISCOUNT_TYPE } from 'src/config/constants.js';
import { formatCurrency } from 'src/utils/format.js';

function Row({ label, value, strong, color }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant={strong ? 'subtitle1' : 'body2'} color={color || 'text.secondary'}>
        {label}
      </Typography>
      <Typography variant={strong ? 'h6' : 'body2'} fontWeight={strong ? 700 : 600} color={color}>
        {value}
      </Typography>
    </Stack>
  );
}

// The full right-hand checkout column: customer, discount, split payment, totals
// and the Complete / Hold actions.
export default function CheckoutPanel({ billing, onLookupCustomer, onComplete, onHold, completing, holding }) {
  const {
    items, customer, setCustomer,
    discountType, setDiscountType, discountValue, setDiscountValue,
    payments, addPayment, updatePayment, removePayment,
    remarks, setRemarks,
    subtotal, discountAmount, total, amountPaid, balance, change,
  } = billing;

  const canComplete = items.length > 0 && total > 0 && amountPaid >= total;
  const canHold = items.length > 0;

  return (
    <Stack spacing={2}>
      <CustomerSelect customer={customer} onChange={setCustomer} onLookup={onLookupCustomer} />

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Discount
        </Typography>
        <Stack direction="row" spacing={1}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={discountType}
            onChange={(_, v) => v && setDiscountType(v)}
          >
            <ToggleButton value={DISCOUNT_TYPE.FLAT}>₹</ToggleButton>
            <ToggleButton value={DISCOUNT_TYPE.PERCENT}>%</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            type="number"
            fullWidth
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === DISCOUNT_TYPE.PERCENT ? 'Percent' : 'Amount'}
          />
        </Stack>
      </Paper>

      <PaymentSplit
        payments={payments}
        onAdd={addPayment}
        onUpdate={updatePayment}
        onRemove={removePayment}
        balance={balance}
      />

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
          <Row label="Discount" value={`- ${formatCurrency(discountAmount)}`} />
          <Divider />
          <Row label="Total" value={formatCurrency(total)} strong />
          <Row label="Paid" value={formatCurrency(amountPaid)} />
          {balance > 0 && <Row label="Balance" value={formatCurrency(balance)} color="error.main" />}
          {change > 0 && <Row label="Change" value={formatCurrency(change)} color="success.main" />}
        </Stack>

        <TextField
          fullWidth
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button fullWidth color="warning" variant="outlined" disabled={!canHold || holding} onClick={onHold}>
            {holding ? 'Holding…' : 'Hold'}
          </Button>
          <Button fullWidth variant="contained" size="large" disabled={!canComplete || completing} onClick={onComplete}>
            {completing ? 'Saving…' : 'Complete'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
