import api from './axios';

export const createPost = (data) => api.post('/posts', data);
export const getFeed = () => api.get('/posts/feed');
export const getPost = (id) => api.get(`/posts/${id}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const unlikePost = (id) => api.delete(`/posts/${id}/unlike`);
export const addComment = (id, data) => api.post(`/posts/${id}/comments`, data);
export const getComments = (id) => api.get(`/posts/${id}/comments`);
export const deleteComment = (id, commentId) => api.delete(`/posts/${id}/comments/${commentId}`);