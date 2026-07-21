import client from './client.js';

export const getPrintQueue = () => client.get('/barcodes/print-queue');
export const listBarcodes = (params) => client.get('/barcodes', { params });
export const markPrinted = (payload) => client.post('/barcodes/print', payload);
export const lookupBarcode = (code) => client.get(`/barcodes/${encodeURIComponent(code)}`);
