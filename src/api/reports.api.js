import client from './client.js';

// Full single-day (IST) report: sales + returns + net + the day's lists.
export const getDaySummary = (params) => client.get('/reports/day-summary', { params });
