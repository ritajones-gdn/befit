import api from './axios';

export const logMeal = (data) => api.post('/meals/log', data);
export const getTodayMeals = () => api.get('/meals/today');
export const getMealHistory = (date) => api.get(`/meals/history?date=${date}`);
export const deleteMeal = (id) => api.delete(`/meals/${id}`);