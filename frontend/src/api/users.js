import api from './axios';

export const getMyProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);