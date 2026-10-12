import { useEffect, useRef, useState } from 'react';
import {
  Button, Checkbox, Divider, FormControlLabel, Paper, Stack, TextField, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material';
import CustomerSelect from './CustomerSelect.jsx';
import PaymentSplit from './PaymentSplit.jsx';
import { DISCOUNT_TYPE } from 'src/config/constants.js';
import { discountProblem } from 'src/utils/discount.js';
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

  // A part-paid sale can only be completed as credit, and credit needs a customer
  // (name and phone) so the pending amount can be tracked and collected later.
  const hasCustomer = Boolean(customer.name?.trim() && customer.phone?.trim());
  const [creditAccepted, setCreditAccepted] = useState(false);
  useEffect(() => {
    if (balance === 0) setCreditAccepted(false);
  }, [balance]);

  // Prefill remarks with the picked customer's last note (internal context for the
  // counter). Never overwrites what the admin typed: only an empty field, or one
  // still holding the previous customer's prefilled note, is replaced.
  const prefilled = useRef('');
  const handleCustomerPick = (found) => {
    const note = found?.remarks?.trim() || '';
    if (remarks.trim() === '' || remarks === prefilled.current) {
      setRemarks(note);
      prefilled.current = note;
    }
  };
  const showPrefillHint = Boolean(prefilled.current) && remarks === prefilled.current;

  const discountError = discountProblem(discountType, discountValue, subtotal);
  const creditOk = balance === 0 || (hasCustomer && creditAccepted);
  const canComplete = items.length > 0 && total > 0 && creditOk && !discountError;
  const canHold = items.length > 0 && !discountError;

  return (
    <Stack spacing={2}>
      <CustomerSelect customer={customer} onChange={setCustomer} onLookup={onLookupCustomer} onPick={handleCustomerPick} />

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
            error={Boolean(discountError)}
            helperText={discountError || undefined}
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

      {balance > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Pending balance</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={creditAccepted}
                disabled={!hasCustomer}
                onChange={(e) => setCreditAccepted(e.target.checked)}
              />
            }
            label={`Record ${formatCurrency(balance)} as credit for this customer`}
          />
          {!hasCustomer && (
            <Typography variant="caption" color="warning.main" display="block">
              Enter the customer's name and phone to sell on credit.
            </Typography>
          )}
        </Paper>
      )}

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
          helperText={showPrefillHint ? "Customer's last remark (internal, not printed on the bill)" : undefined}
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
