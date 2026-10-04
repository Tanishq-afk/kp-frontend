import client from './client.js';

export const createBill = (payload) => client.post('/bills', payload);
export const holdBill = (payload) => client.post('/bills/hold', payload);
export const listHeldBills = () => client.get('/bills/held');
export const completeHeldBill = (id, payload) => client.post(`/bills/${id}/complete`, payload);
export const discardBill = (id) => client.delete(`/bills/${id}`);
export const listBills = (params) => client.get('/bills', { params });
export const getBill = (id) => client.get(`/bills/${id}`);
// Superadmin: every bill in the filtered range, for the printed list (no paging).
export const listBillsForPrint = (params) => client.get('/bills/print-list', { params });
