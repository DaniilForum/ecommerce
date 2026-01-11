import api from './axiosConfig';

export const register = (payload) => api.post('/auth/register', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const getProfile = () => api.get('/auth/profile');
