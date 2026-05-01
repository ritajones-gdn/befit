import api from './axios';

export const checkIn = (data) => api.post('/checkins', data);
export const getStreak = () => api.get('/checkins/streak');
export const getCheckinHistory = () => api.get('/checkins/history');