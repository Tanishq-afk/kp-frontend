import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import PageHeader from 'src/components/PageHeader';
import SizeQuantityEditor from 'src/sections/products/SizeQuantityEditor';
import * as productsApi from 'src/api/products.api.js';
import * as categoriesApi from 'src/api/categories.api.js';
import { SIZE_TYPES, SIZE_TYPE_LABELS } from 'src/config/constants.js';
import { errorMessage } from 'src/utils/format.js';

export default function ProductFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [sizeType, setSizeType] = useState('');
  const [sizeQty, setSizeQty] = useState({}); // { size: quantityString }

  const {
    register, handleSubmit, control, reset, formState: { errors },
  } = useForm({ defaultValues: { name: '', category: '', costPrice: '', mrp: '' } });

  const catsQuery = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => categoriesApi.listCategories({ limit: 100, isActive: true }).then((r) => r.data),
  });

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: editing,
  });

  useEffect(() => {
    const p = productQuery.data?.data;
    if (editing && p) {
      reset({
        name: p.name,
        category: p.category?._id || p.category,
        costPrice: p.costPrice,
        mrp: p.mrp,
      });
      setSizeType(p.sizeType);
      const m = {};
      (p.sizes || []).forEach((s) => { m[s.size] = String(s.quantity); });
      setSizeQty(m);
    }
  }, [editing, productQuery.data, reset]);

  const save = useMutation({
    mutationFn: (payload) =>
      editing ? productsApi.updateProduct(id, payload) : productsApi.createProduct(payload),
    onSuccess: (res) => {
      enqueueSnackbar(
        editing ? 'Product updated' : `Product created · ${res.barcodeCount} barcodes generated`,
        { variant: 'success' }
      );
      navigate('/products');
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const onSubmit = (values) => {
    const base = {
      name: values.name,
      category: values.category,
      costPrice: Number(values.costPrice),
      mrp: Number(values.mrp),
    };
    if (editing) {
      save.mutate(base); // sizes/sizeType are not editable
      return;
    }
    if (!sizeType) {
      enqueueSnackbar('Select a size type', { variant: 'warning' });
      return;
    }
    const sizes = Object.entries(sizeQty)
      .map(([size, qty]) => ({ size, quantity: Number(qty) || 0 }))
      .filter((s) => s.quantity > 0);
    if (sizes.length === 0) {
      enqueueSnackbar('Enter quantity for at least one size', { variant: 'warning' });
      return;
    }
    save.mutate({ ...base, sizeType, sizes });
  };

  const totalUnits = useMemo(
    () => Object.values(sizeQty).reduce((s, q) => s + (Number(q) || 0), 0),
    [sizeQty]
  );
  const cats = catsQuery.data || [];

  return (
    <Box>
      <PageHeader
        title={editing ? 'Edit product' : 'New product'}
        subtitle={editing ? 'Update product details' : 'Add a product and generate its barcodes'}
      />
      <Card sx={{ maxWidth: 780 }}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Product name"
                  fullWidth
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Article number"
                  fullWidth
                  disabled
                  value={editing ? (productQuery.data?.data?.articleNumber ?? '') : 'Assigned automatically'}
                  helperText={editing ? 'System-assigned, not editable' : "Assigned once you save — you don't enter this"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Category"
                      fullWidth
                      error={Boolean(errors.category)}
                      helperText={errors.category?.message}
                      {...field}
                    >
                      {cats.map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                          {c.name} · {c.gender}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Cost price"
                  type="number"
                  fullWidth
                  error={Boolean(errors.costPrice)}
                  helperText={errors.costPrice?.message}
                  {...register('costPrice', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="MRP"
                  type="number"
                  fullWidth
                  error={Boolean(errors.mrp)}
                  helperText={errors.mrp?.message}
                  {...register('mrp', { required: 'Required', min: { value: 0, message: '≥ 0' } })}
                />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Size type"
                  fullWidth
                  value={sizeType}
                  onChange={(e) => { setSizeType(e.target.value); setSizeQty({}); }}
                  disabled={editing}
                  helperText={editing ? 'Size type cannot be changed after creation' : ''}
                >
                  {SIZE_TYPES.map((st) => (
                    <MenuItem key={st} value={st}>
                      {SIZE_TYPE_LABELS[st]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                {!editing && sizeType && (
                  <Typography variant="body2" color="text.secondary">
                    Opening stock: <strong>{totalUnits}</strong> unit(s) → {totalUnits} barcode(s)
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Sizes &amp; quantities
                </Typography>
                {editing ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(productQuery.data?.data?.sizes || []).map((s) => (
                      <Chip key={s.size} label={`${s.size}: ${s.quantity}`} />
                    ))}
                  </Stack>
                ) : (
                  <SizeQuantityEditor sizeType={sizeType} value={sizeQty} onChange={setSizeQty} />
                )}
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button onClick={() => navigate('/products')}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={save.isPending}>
                {save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
