import client from './client.js';

export const lookupByPhone = (phone) => client.get('/customers/lookup', { params: { phone } });
export const listCustomers = (params) => client.get('/customers', { params });
export const getCustomer = (id) => client.get(`/customers/${id}`);
export const createCustomer = (payload) => client.post('/customers', payload);
export const updateCustomer = (id, payload) => client.patch(`/customers/${id}`, payload);
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);
