import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { useIsMobile } from 'src/hooks/useIsMobile.js';
import BarcodeLabel from 'src/sections/barcodes/BarcodeLabel.jsx';
import * as barcodesApi from 'src/api/barcodes.api.js';
import { printBarcodeLabels } from 'src/utils/printBarcodeLabel.js';

// Reprint a lost/damaged physical label. Unlike PrintLabelsDialog (the print
// queue, which only shows never-printed labels), this pulls every unit that's
// still `available` for the product regardless of printStatus — the whole
// point is re-printing a label that was already printed once and then lost.
export default function ReprintBarcodeDialog({ product, onClose }) {
  const open = Boolean(product);
  const isMobile = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();
  const [printing, setPrinting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reprintBarcodes', product?._id],
    queryFn: () =>
      barcodesApi
        .listBarcodes({ product: product._id, status: 'available', limit: 200 })
        .then((r) => r.data),
    enabled: open,
  });
  const labels = data || [];

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
        Reprint barcode — {product?.name}
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
            {labels.length === 0 && (
              <Typography color="text.secondary">
                No in-stock units found for this product — nothing to print.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions className="no-print" sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          onClick={handlePrint}
          disabled={!labels.length || printing}
        >
          {printing ? 'Printing…' : 'Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
