import axios from 'axios';
import { API_URL } from '../config/env.js';

// --- token storage -------------------------------------------------------
const TOKEN_KEY = 'kp_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// --- axios instance ------------------------------------------------------
const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token to every request.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap the success envelope to `response.data` ({ success, data, ... }) and
// normalize errors to an Error with .status and .errors. A 401 (other than the
// login call itself) clears the token and bounces to /login.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || error.message || 'Network error';

    if (status === 401 && !error.config?.url?.includes('/auth/login')) {
      clearToken();
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }

    return Promise.reject(Object.assign(new Error(message), { status, errors: data?.errors }));
  }
);

export default client;
