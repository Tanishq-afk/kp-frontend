import client from './client.js';

// Each fn returns the success envelope ({ success, data, ... }).
export const login = (payload) => client.post('/auth/login', payload); // -> data: { token, user }
export const getMe = () => client.get('/auth/me'); // -> data: user
