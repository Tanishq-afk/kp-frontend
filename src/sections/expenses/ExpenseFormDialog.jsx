import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField,
} from '@mui/material';
import * as expensesApi from 'src/api/expenses.api.js';
import { errorMessage } from 'src/utils/format.js';

// Record a new expense (reason + amount). Self-contained: runs its own mutation.
export default function ExpenseFormDialog({ open, onClose, onSaved }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm({ defaultValues: { reason: '', amount: '' } });

  useEffect(() => {
    if (open) reset({ reason: '', amount: '' });
  }, [open, reset]);

  const save = useMutation({
    mutationFn: (v) => expensesApi.createExpense({ reason: v.reason.trim(), amount: Number(v.amount) }),
    onSuccess: () => {
      enqueueSnackbar('Expense added', { variant: 'success' });
      onSaved();
      onClose();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add expense</DialogTitle>
      <form onSubmit={handleSubmit((v) => save.mutate(v))}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Reason"
              fullWidth
              autoFocus
              error={Boolean(errors.reason)}
              helperText={errors.reason?.message}
              {...register('reason', {
                validate: (v) => v.trim().length > 0 || 'Reason is required',
                maxLength: { value: 200, message: 'Max 200 characters' },
              })}
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: 'any' }}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              error={Boolean(errors.amount)}
              helperText={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required',
                validate: (v) => Number(v) > 0 || 'Amount must be greater than 0',
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
