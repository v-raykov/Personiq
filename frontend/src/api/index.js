import axios from 'axios';

const api = axios.create({
    baseURL: window.__API_BASE_URL__,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getTenants = () => api.get('/tenant');
export const createTenant = (uriName, data) =>
    api.post(`/tenant?tenantUriName=${encodeURIComponent(uriName)}`, data);
export const registerUser = (tenantUri, data) => api.post(`/${tenantUri}/register`, data);
export const loginUser = (tenantUri, data) => api.post(`/${tenantUri}/login`, data);
export const getMe = (tenantUri) => api.get(`/${tenantUri}/me`);
export const getUsersAdmin = (tenantUri) => api.get(`/${tenantUri}/admin/user`);
export const registerUserAdmin = (tenantUri, data) => api.post(`/${tenantUri}/admin/register`, data);

export default api;