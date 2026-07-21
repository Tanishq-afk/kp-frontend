import {
  Button, Divider, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import PaymentSplit from 'src/sections/billing/PaymentSplit.jsx';
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

const NET_META = {
  collect: { label: 'Customer pays', color: 'error.main' },
  refund: { label: 'Refund to customer', color: 'success.main' },
  even: { label: 'Settled — nothing due', color: 'text.primary' },
};

// The right-hand settlement column: return credit, exchange total, the net to
// collect or refund, the payment split, remarks and the submit action.
export default function SettlementPanel({ rtn, onSubmit, submitting }) {
  const {
    source, returnItems, returnCredit,
    newItems, discountType, setDiscountType, discountValue, setDiscountValue,
    exchangeSubtotal, exchangeDiscount, exchangeTotal,
    direction, settleAmount, payments, addPayment, updatePayment, removePayment, balance,
    remarks, setRemarks, canSubmit,
  } = rtn;

  const hasExchange = newItems.length > 0;
  const net = NET_META[direction];
  const submitLabel = submitting
    ? 'Processing…'
    : direction === 'collect'
    ? `Collect ${formatCurrency(settleAmount)} & process`
    : direction === 'refund'
    ? `Refund ${formatCurrency(settleAmount)} & process`
    : 'Process';

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Customer</Typography>
        <Typography fontWeight={600}>{source.bill.customerName || 'Walk-in'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {source.bill.customerPhone || 'No phone on file'}
        </Typography>
      </Paper>

      {hasExchange && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Discount on new items</Typography>
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
      )}

      {direction !== 'even' && (
        <PaymentSplit
          payments={payments}
          onAdd={addPayment}
          onUpdate={updatePayment}
          onRemove={removePayment}
          balance={balance}
        />
      )}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Row
            label={`Return credit (${returnItems.length} item${returnItems.length === 1 ? '' : 's'})`}
            value={`- ${formatCurrency(returnCredit)}`}
            color="success.main"
          />
          {hasExchange && (
            <>
              <Row label="New items" value={formatCurrency(exchangeSubtotal)} />
              {exchangeDiscount > 0 && (
                <Row label="Discount" value={`- ${formatCurrency(exchangeDiscount)}`} />
              )}
              <Row label="New items total" value={formatCurrency(exchangeTotal)} />
            </>
          )}
          <Divider />
          <Row label={net.label} value={formatCurrency(settleAmount)} strong color={net.color} />
        </Stack>

        <TextField
          fullWidth
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{ mt: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </Paper>
    </Stack>
  );
}
