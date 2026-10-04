import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// The shop operates in India: every date shown, defaulted or printed is an IST day.
export const IST_TZ = 'Asia/Kolkata';
// Today's IST calendar date as a plain dayjs (safe for date pickers).
export const todayIST = () => dayjs(dayjs().tz(IST_TZ).format('YYYY-MM-DD'));
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
// A 'YYYY-MM-DD' calendar date is shown as written; an instant is converted to IST.
const toIST = (d) => (typeof d === 'string' && DATE_ONLY.test(d) ? dayjs(d) : dayjs(d).tz(IST_TZ));

// INR currency, e.g. ₹1,800 or ₹2,504.90
export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

export const formatNumber = (n) => new Intl.NumberFormat('en-IN').format(Number(n) || 0);

export const formatDate = (d) => (d ? toIST(d).format('DD MMM YYYY') : '');
export const formatDateTime = (d) => (d ? toIST(d).format('DD MMM YYYY, hh:mm A') : '');

// Pulls a readable message out of an API/axios error (our client normalizes
// errors to Error objects with .message and optional .errors[]).
export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.errors?.[0] || err?.message || fallback;
