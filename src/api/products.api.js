import client from './client.js';

export const listProducts = (params) => client.get('/products', { params });
export const getProduct = (id) => client.get(`/products/${id}`);
export const createProduct = (payload) => client.post('/products', payload);
export const updateProduct = (id, payload) => client.patch(`/products/${id}`, payload);
export const deleteProduct = (id) => client.delete(`/products/${id}`);
