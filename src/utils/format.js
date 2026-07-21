import dayjs from 'dayjs';

// INR currency, e.g. ₹1,800 or ₹2,504.90
export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export const formatDate = (d) => (d ? dayjs(d).format('DD MMM YYYY') : '');
export const formatDateTime = (d) => (d ? dayjs(d).format('DD MMM YYYY, hh:mm A') : '');

// Pulls a readable message out of an API/axios error (our client normalizes
// errors to Error objects with .message and optional .errors[]).
export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.errors?.[0] || err?.message || fallback;
