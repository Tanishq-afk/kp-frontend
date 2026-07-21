import client from './client.js';

export const getSummary = (params) => client.get('/dashboard/summary', { params });
export const getDailySales = (params) => client.get('/dashboard/sales/daily', { params });
export const getPaymentMethods = (params) => client.get('/dashboard/sales/payment-methods', { params });
export const getTopProducts = (params) => client.get('/dashboard/sales/top-products', { params });
export const getSalesByCategory = (params) => client.get('/dashboard/sales/by-category', { params });
