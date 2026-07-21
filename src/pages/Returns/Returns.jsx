import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Button, Grid, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PageHeader from 'src/components/PageHeader';
import BillLookup from 'src/sections/returns/BillLookup.jsx';
import ReturnItemsPanel from 'src/sections/returns/ReturnItemsPanel.jsx';
import ExchangeCart from 'src/sections/returns/ExchangeCart.jsx';
import SettlementPanel from 'src/sections/returns/SettlementPanel.jsx';
import ReturnSuccessDialog from 'src/sections/returns/ReturnSuccessDialog.jsx';
import { useReturn } from 'src/hooks/useReturn.js';
import * as returnsApi from 'src/api/returns.api.js';
import * as barcodesApi from 'src/api/barcodes.api.js';
import { errorMessage } from 'src/utils/format.js';
import { BARCODE_STATUS } from 'src/config/constants.js';

export default function ReturnsPage() {
  const rtn = useReturn();
  const { enqueueSnackbar } = useSnackbar();
  const [success, setSuccess] = useState(null);

  // Step 1 -> load a bill's returnable items.
  const pickBill = useMutation({
    mutationFn: (billId) => returnsApi.getReturnableBill(billId).then((r) => r.data),
    onSuccess: (data) => {
      rtn.loadBill(data);
      if (!data.items?.some((it) => it.returnable)) {
        enqueueSnackbar('Every item on this bill has already been returned', { variant: 'info' });
      }
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  // Scan an item into the exchange cart (guard duplicates / unavailable).
  const scan = useMutation({
    mutationFn: (code) => barcodesApi.lookupBarcode(code).then((r) => r.data),
    onSuccess: (bc) => {
      if (rtn.hasNewItem(bc.code)) {
        enqueueSnackbar('Item already added', { variant: 'info' });
        return;
      }
      if (bc.status !== BARCODE_STATUS.AVAILABLE) {
        enqueueSnackbar(`Not available (${bc.status})`, { variant: 'warning' });
        return;
      }
      rtn.addNewItem(bc);
    },
    onError: (e) => enqueueSnackbar(errorMessage(e, 'Unknown barcode'), { variant: 'error' }),
  });

  const submit = useMutation({
    mutationFn: () => returnsApi.createReturn(rtn.buildPayload()).then((r) => r.data),
    onSuccess: (result) => {
      setSuccess(result);
      rtn.reset();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  return (
    <>
      <PageHeader
        title="Sales Returns"
        subtitle={
          rtn.source
            ? 'Select items to return, add exchange items, then settle'
            : 'Find a bill by invoice number or customer phone to start a return'
        }
        action={
          rtn.source && (
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={rtn.reset}>
              Change bill
            </Button>
          )
        }
      />

      {!rtn.source ? (
        <BillLookup onPick={pickBill.mutate} picking={pickBill.isPending} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <ReturnItemsPanel
                source={rtn.source}
                selection={rtn.selected}
                isSelected={rtn.isSelected}
                onToggle={rtn.toggleReturn}
                onSetResellable={rtn.setResellable}
              />
              <ExchangeCart
                onScan={scan.mutate}
                scanning={scan.isPending}
                items={rtn.newItems}
                onRemove={rtn.removeNewItem}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <SettlementPanel rtn={rtn} onSubmit={() => submit.mutate()} submitting={submit.isPending} />
          </Grid>
        </Grid>
      )}

      <ReturnSuccessDialog result={success} onNew={() => setSuccess(null)} />
    </>
  );
}
