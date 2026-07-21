import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack,
  Switch, TextField,
} from '@mui/material';
import * as customersApi from '../../api/customers.api.js';
import { errorMessage } from '../../utils/format.js';

const PHONE_RX = /^\+?\d{7,15}$/;

export default function CustomerFormDialog({ open, customer, onClose, onSaved }) {
  const editing = Boolean(customer);
  const { enqueueSnackbar } = useSnackbar();
  const {
    register, handleSubmit, control, reset, formState: { errors },
  } = useForm({ defaultValues: { name: '', phone: '', remarks: '', isActive: true } });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? { name: customer.name, phone: customer.phone, remarks: customer.remarks || '', isActive: customer.isActive }
          : { name: '', phone: '', remarks: '', isActive: true }
      );
    }
  }, [open, customer, reset]);

  const save = useMutation({
    mutationFn: (values) =>
      editing ? customersApi.updateCustomer(customer._id, values) : customersApi.createCustomer(values),
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Customer updated' : 'Customer created', { variant: 'success' });
      onSaved();
      onClose();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Edit customer' : 'New customer'}</DialogTitle>
      <form onSubmit={handleSubmit((v) => save.mutate(v))}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              autoFocus
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />
            <TextField
              label="Phone"
              fullWidth
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: PHONE_RX, message: '7–15 digits' },
              })}
            />
            <TextField label="Remarks" fullWidth multiline minRows={2} {...register('remarks')} />
            {editing && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Active"
                  />
                )}
              />
            )}
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
