import api from './axios';

export const getStats = () => api.get('/admin/stats');
export const getAllUsers = () => api.get('/admin/users');
export const deactivateUser = (id) => api.put(`/admin/users/${id}/deactivate`);
export const reactivateUser = (id) => api.put(`/admin/users/${id}/reactivate`);
export const makeAdmin = (id) => api.put(`/admin/users/${id}/make-admin`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAllPosts = () => api.get('/admin/posts');
export const deleteAnyPost = (id) => api.delete(`/admin/posts/${id}`);