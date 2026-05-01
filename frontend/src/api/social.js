import api from './axios';

export const searchUsers = (username) => api.get(`/social/search?username=${username}`);
export const getUserProfile = (id) => api.get(`/social/users/${id}`);
export const followUser = (id) => api.post(`/social/users/${id}/follow`);
export const unfollowUser = (id) => api.delete(`/social/users/${id}/unfollow`);
export const getFollowers = () => api.get('/social/followers');
export const getFollowing = () => api.get('/social/following');