import axios from 'axios';

const api = axios.create({
    baseURL: window.__API_BASE_URL__,
});

export const getTenants = () => api.get('/tenant');
export const createTenant = (uriName, data) =>
    api.post(`/tenant?tenantUriName=${encodeURIComponent(uriName)}`, data);
export const registerUser = (tenantUri, data) => api.post(`/${tenantUri}/register`, data);
export const loginUser = (tenantUri, data) => api.post(`/${tenantUri}/login`, data);

export default api;