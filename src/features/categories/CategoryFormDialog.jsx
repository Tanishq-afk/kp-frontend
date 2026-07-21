import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
  MenuItem, Stack, Switch, TextField,
} from '@mui/material';
import * as categoriesApi from '../../api/categories.api.js';
import { GENDERS } from '../../config/constants.js';
import { errorMessage } from '../../utils/format.js';

// Create / edit a category. Self-contained: runs its own mutation.
export default function CategoryFormDialog({ open, category, onClose, onSaved }) {
  const editing = Boolean(category);
  const { enqueueSnackbar } = useSnackbar();
  const {
    register, handleSubmit, control, reset, formState: { errors },
  } = useForm({ defaultValues: { name: '', gender: '', isActive: true } });

  useEffect(() => {
    if (open) {
      reset(
        category
          ? { name: category.name, gender: category.gender, isActive: category.isActive }
          : { name: '', gender: '', isActive: true }
      );
    }
  }, [open, category, reset]);

  const save = useMutation({
    mutationFn: (values) =>
      editing ? categoriesApi.updateCategory(category._id, values) : categoriesApi.createCategory(values),
    onSuccess: () => {
      enqueueSnackbar(editing ? 'Category updated' : 'Category created', { variant: 'success' });
      onSaved();
      onClose();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
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
            <Controller
              name="gender"
              control={control}
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <TextField
                  select
                  label="Gender"
                  fullWidth
                  error={Boolean(errors.gender)}
                  helperText={errors.gender?.message}
                  {...field}
                >
                  {GENDERS.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {editing && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                    }
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
