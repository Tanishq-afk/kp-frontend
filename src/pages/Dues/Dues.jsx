import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Button, Card, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PageHeader from 'src/components/PageHeader';
import StatCard from 'src/components/StatCard';
import CustomerDuesDialog from 'src/sections/dues/CustomerDuesDialog.jsx';
import ListPrintDialog from 'src/sections/reports/ListPrintDialog.jsx';
import * as duesApi from 'src/api/dues.api.js';
import { useAuth } from 'src/hooks/useAuth.js';
import { ROLE } from 'src/config/constants.js';
import { formatCurrency, formatDate, formatNumber } from 'src/utils/format.js';

// Customers who owe money on credit. Everyone can see the list; admins record
// payments from a customer's row, superadmins can print the list.
export default function DuesPage() {
  const { user, role } = useAuth();
  const isSuperadmin = role === ROLE.SUPERADMIN;
  const canReceive = role === ROLE.ADMIN;
  const [customerId, setCustomerId] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dues-outstanding'],
    queryFn: () => duesApi.listOutstanding().then((r) => r.data),
  });
  const items = data?.items || [];

  return (
    <Box>
      <PageHeader
        title="Dues"
        subtitle="Credit sales still to be collected"
        action={
          isSuperadmin && (
            <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => setPrintOpen(true)} disabled={!data}>
              Print list
            </Button>
          )
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StatCard label="Total outstanding" value={formatCurrency(data?.total)} icon={<AccountBalanceWalletRoundedIcon />} color="error" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard label="Customers owing" value={formatNumber(data?.count)} icon={<AccountBalanceWalletRoundedIcon />} color="warning" />
        </Box>
      </Stack>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Open bills</TableCell>
                <TableCell>Oldest bill</TableCell>
                <TableCell align="right">Outstanding</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.customer} hover sx={{ cursor: 'pointer' }} onClick={() => setCustomerId(c.customer)}>
                  <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell align="right">{c.bills}</TableCell>
                  <TableCell>{formatDate(c.oldestBillAt)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatCurrency(c.due)}</TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No customers have a pending balance</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <CustomerDuesDialog customerId={customerId} onClose={() => setCustomerId(null)} canReceive={canReceive} />

      {isSuperadmin && data && (
        <ListPrintDialog
          open={printOpen}
          onClose={() => setPrintOpen(false)}
          title="Dues"
          range={null}
          rows={items.map((c) => ({ key: c.customer, label: c.name, date: c.oldestBillAt, amount: c.due }))}
          count={data.count}
          total={data.total}
          totalLabel="Total due"
          user={user}
          showFilters={false}
        />
      )}
    </Box>
  );
}
