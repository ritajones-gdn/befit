import api from './axios';

export const logWorkout = (data) => api.post('/workouts/log', data);
export const addSets = (id, data) => api.post(`/workouts/${id}/sets`, data);
export const getWorkoutHistory = () => api.get('/workouts/history');
export const getWorkout = (id) => api.get(`/workouts/${id}`);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`);