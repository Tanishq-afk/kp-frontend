import client from './client.js';

// Customers with an unpaid credit balance (largest first, with totals).
export const listOutstanding = () => client.get('/dues/customers');
// One customer's open credit bills and payment history.
export const getCustomerDues = (customerId) => client.get(`/dues/customers/${customerId}`);
// Record a payment from a customer against their open bills (admin).
export const recordPayment = (payload) => client.post('/dues/payments', payload);
