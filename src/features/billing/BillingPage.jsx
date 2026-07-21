import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Badge, Button, Grid, Stack } from '@mui/material';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PageHeader from '../../components/PageHeader.jsx';
import ScanBox from './components/ScanBox.jsx';
import CartList from './components/CartList.jsx';
import CheckoutPanel from './components/CheckoutPanel.jsx';
import HeldBillsDialog from './components/HeldBillsDialog.jsx';
import BillSuccessDialog from './components/BillSuccessDialog.jsx';
import { useBilling } from './useBilling.js';
import * as barcodesApi from '../../api/barcodes.api.js';
import * as customersApi from '../../api/customers.api.js';
import * as billsApi from '../../api/bills.api.js';
import { errorMessage } from '../../utils/format.js';
import { BARCODE_STATUS } from '../../config/constants.js';

export default function BillingPage() {
  const billing = useBilling();
  const { enqueueSnackbar } = useSnackbar();
  const [heldOpen, setHeldOpen] = useState(false);
  const [successBill, setSuccessBill] = useState(null);

  const heldQuery = useQuery({
    queryKey: ['heldBills'],
    queryFn: () => billsApi.listHeldBills().then((r) => r.data),
  });
  const heldCount = heldQuery.data?.length || 0;

  // Scan -> lookup -> add to cart (guarding duplicates & sold units).
  const scan = useMutation({
    mutationFn: (code) => barcodesApi.lookupBarcode(code).then((r) => r.data),
    onSuccess: (bc) => {
      if (billing.hasItem(bc.code)) {
        enqueueSnackbar('Item already added', { variant: 'info' });
        return;
      }
      if (bc.status !== BARCODE_STATUS.AVAILABLE) {
        enqueueSnackbar(`Not available (${bc.status})`, { variant: 'warning' });
        return;
      }
      billing.addItem(bc);
    },
    onError: (e) => enqueueSnackbar(errorMessage(e, 'Unknown barcode'), { variant: 'error' }),
  });

  const lookupCustomer = async (phone) => {
    try {
      const res = await customersApi.lookupByPhone(phone);
      return res.data; // customer or null
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: 'error' });
      return null;
    }
  };

  const complete = useMutation({
    mutationFn: () => billsApi.createBill(billing.buildPayload()).then((r) => r.data),
    onSuccess: (bill) => {
      setSuccessBill(bill);
      billing.reset();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  const hold = useMutation({
    mutationFn: () => billsApi.holdBill(billing.buildPayload()).then((r) => r.data),
    onSuccess: (bill) => {
      enqueueSnackbar(`Held as ${bill.holdRef}`, { variant: 'success' });
      billing.reset();
      heldQuery.refetch();
    },
    onError: (e) => enqueueSnackbar(errorMessage(e), { variant: 'error' }),
  });

  return (
    <>
      <PageHeader
        title="Billing Counter"
        subtitle="Scan items, take payment, and complete the sale"
        action={
          <Badge color="warning" badgeContent={heldCount}>
            <Button
              variant="outlined"
              startIcon={<PauseCircleOutlineRoundedIcon />}
              onClick={() => setHeldOpen(true)}
            >
              Held bills
            </Button>
          </Badge>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <ScanBox onScan={scan.mutate} loading={scan.isPending} />
            <CartList items={billing.items} onRemove={billing.removeItem} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <CheckoutPanel
            billing={billing}
            onLookupCustomer={lookupCustomer}
            onComplete={() => complete.mutate()}
            onHold={() => hold.mutate()}
            completing={complete.isPending}
            holding={hold.isPending}
          />
        </Grid>
      </Grid>

      <HeldBillsDialog open={heldOpen} onClose={() => setHeldOpen(false)} onSettled={() => heldQuery.refetch()} />
      <BillSuccessDialog bill={successBill} onNewSale={() => setSuccessBill(null)} />
    </>
  );
}
