import client from './client.js';

// Step 1: completed bills matching a bill number / customer phone (paginated).
export const lookupBills = (params) => client.get('/returns/lookup', { params });
// Step 2: a bill's items annotated with { returnable, refundAmount }.
export const getReturnableBill = (billId) => client.get(`/returns/bill/${billId}`);
// Create a return / exchange (atomic).
export const createReturn = (payload) => client.post('/returns', payload);
// Returns history + detail.
export const listReturns = (params) => client.get('/returns', { params });
export const getReturn = (id) => client.get(`/returns/${id}`);
// Superadmin: every return in the filtered range, for the printed list (no paging).
export const listReturnsForPrint = (params) => client.get('/returns/print-list', { params });
