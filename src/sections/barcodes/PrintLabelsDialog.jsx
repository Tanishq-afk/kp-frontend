import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import BarcodeLabel from './BarcodeLabel.jsx';
import * as barcodesApi from 'src/api/barcodes.api.js';
import { errorMessage } from 'src/utils/format.js';
import { printBarcodeLabels } from 'src/utils/printBarcodeLabel.js';

// `product` is a print-queue row ({ product, productName, categoryName, ... }).
export default function PrintLabelsDialog({ product, onClose }) {
  const open = Boolean(product);
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [printing, setPrinting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['printLabels', product?.product],
    queryFn: () =>
      barcodesApi
        .listBarcodes({ product: product.product, printStatus: 'pending', limit: 200 })
        .then((r) => r.data),
    enabled: open,
  });
  const labels = data || [];

  const mark = useMutation({
    mutationFn: () => barcodesApi.markPrinted({ product: product.product }),
    onSuccess: (res) => {
      enqueueSnackbar(`Marked ${res.data.modified} label(s) printed`, { variant: 'success' });
      qc.invalidateQueries({ queryKey: ['printQueue'] });
      onClose();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printBarcodeLabels(labels, () => window.print());
    } catch (e) {
      enqueueSnackbar(`Print failed: ${e}`, { variant: 'error' });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={isMobile}>
      <DialogTitle
        className="no-print"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Print labels — {product?.productName}
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : (
          <Box className="print-area" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {labels.map((b) => (
              <BarcodeLabel key={b._id} barcode={b} />
            ))}
            {labels.length === 0 && <Typography color="text.secondary">No pending labels.</Typography>}
          </Box>
        )}
      </DialogContent>
      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button startIcon={<PrintRoundedIcon />} onClick={handlePrint} disabled={!labels.length || printing}>
          {printing ? 'Printing…' : 'Print'}
        </Button>
        <Button variant="contained" onClick={() => mark.mutate()} disabled={!labels.length || mark.isPending}>
          {mark.isPending ? 'Working…' : 'Mark printed'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
