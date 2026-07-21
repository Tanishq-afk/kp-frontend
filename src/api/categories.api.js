import client from './client.js';

export const listCategories = (params) => client.get('/categories', { params });
export const getCategory = (id) => client.get(`/categories/${id}`);
export const createCategory = (payload) => client.post('/categories', payload);
export const updateCategory = (id, payload) => client.patch(`/categories/${id}`, payload);
export const deleteCategory = (id) => client.delete(`/categories/${id}`);
