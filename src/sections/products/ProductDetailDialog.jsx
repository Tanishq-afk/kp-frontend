import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid,
  IconButton, Stack, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ConfirmDialog from 'src/components/ConfirmDialog';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import * as productsApi from 'src/api/products.api.js';
import { formatCurrency, errorMessage } from 'src/utils/format.js';

function Info({ label, value }) {
  return (
    <Grid item xs={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={600}>{value}</Typography>
    </Grid>
  );
}

export default function ProductDetailDialog({ productId, onClose, onEdit, onDeleted }) {
  const open = Boolean(productId);
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProduct(productId),
    enabled: open,
  });
  const product = data?.data;
  const bc = data?.barcodes;

  const del = useMutation({
    mutationFn: () => productsApi.deleteProduct(productId),
    onSuccess: () => {
      enqueueSnackbar('Product deleted', { variant: 'info' });
      qc.invalidateQueries({ queryKey: ['products'] });
      setConfirm(false);
      onDeleted();
    },
    onError: (e) => {
      enqueueSnackbar(errorMessage(e), { variant: 'error' });
      setConfirm(false);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Product details
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading || !product ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Article {product.articleNumber} · {product.category?.name} ({product.category?.gender})
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Info label="Cost price" value={formatCurrency(product.costPrice)} />
              <Info label="MRP" value={formatCurrency(product.mrp)} />
              <Info label="Size type" value={product.sizeType} />
              <Info label="Current stock" value={product.currentStock} />
            </Grid>
            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Sizes
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {product.sizes?.map((s) => (
                  <Chip key={s.size} label={`${s.size}: ${s.quantity}`} />
                ))}
              </Stack>
            </Box>
            {bc && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Barcodes
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`Total ${bc.total}`} />
                    <Chip color="success" label={`Available ${bc.available}`} />
                    <Chip label={`Sold ${bc.sold}`} />
                    <Chip color="warning" label={`To print ${bc.printPending}`} />
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button color="error" onClick={() => setConfirm(true)}>
          Delete
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => onEdit(productId)}>
          Edit
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={confirm}
        title="Delete product"
        message="Products with sold units can't be deleted (deactivate instead)."
        confirmText="Delete"
        loading={del.isPending}
        onConfirm={() => del.mutate()}
        onClose={() => setConfirm(false)}
      />
    </Dialog>
  );
}
