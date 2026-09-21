import client from './client.js';

export const createExpense = (payload) => client.post('/expenses', payload);
// Paginated list + range total (`totalAmount` on the response envelope).
export const listExpenses = (params) => client.get('/expenses', { params });
export const getDailyExpenses = (params) => client.get('/expenses/daily', { params });
// Superadmin only.
export const getMonthlyExpenses = (params) => client.get('/expenses/monthly', { params });
