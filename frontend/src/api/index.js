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

export const getTenants = () =>
    api.get('/tenant');

export const createTenant = (uriName, data) =>
    api.post(`/tenant?tenantUriName=${encodeURIComponent(uriName)}`, data);

export const registerUser = (tenantUri, data) =>
    api.post(`/${tenantUri}/register`, data);

export const loginUser = (tenantUri, data) =>
    api.post(`/${tenantUri}/login`, data);

export const getMe = (tenantUri) =>
    api.get(`/${tenantUri}/me`);

export const getUsersAdmin = (tenantUri) =>
    api.get(`/${tenantUri}/admin/user`);

export const registerUserAdmin = (tenantUri, data) =>
    api.post(`/${tenantUri}/admin/register`, data);

export const createCustomerAttribute = (tenantUri, data) =>
    api.post(`/${tenantUri}/admin/customer/attribute`, data);

export const getCustomerAttributes = (tenantUri) =>
    api.get(`/${tenantUri}/admin/customer/attribute`);

export const deleteCustomerAttribute = (tenantUri, attributeId) =>
    api.delete(`/${tenantUri}/admin/customer/attribute`, {
        params: {attributeId}
    });

export const getAttributeValue = (tenantUri, attributeId, customerId) =>
    api.get(`/${tenantUri}/admin/customer/attribute/value/${attributeId}`, {
        params: {customerId}
    });

export const getAllAttributeValues = (tenantUri, customerId) =>
    api.get(`/${tenantUri}/admin/customer/attribute/value`, {
        params: {customerId}
    });

export const updateCustomerAttributes = (tenantUri, customerId, attributes, overwriteList = false) =>
    api.post(`/${tenantUri}/admin/customer/attribute/value`, attributes, {
        params: {
            customerId,
            overwriteList
        }
    });

export const deleteAttributeValue = (tenantUri, attributeId, customerId, value = null) =>
    api.delete(`/${tenantUri}/admin/customer/attribute/value/${attributeId}`, {
        params: {
            customerId,
            value
        }
    });

export const getCustomers = (tenantUri) => api.get(`${tenantUri}/admin/customer`);

export const getBulkAttributes = (tenantUri, customerIds) =>
    api.post(`${tenantUri}/admin/customer/attribute/value/bulk`, customerIds);

export const getActions = (tenantUri) =>
    api.get(`${tenantUri}/admin/action`);

export const getActionById = (tenantUri, actionId) => api.get(`/${tenantUri}/admin/action/${actionId}`);

export const createAction = (tenantUri, name, attributes) =>
    api.post(`${tenantUri}/admin/action`, attributes, {params: {name}});

export const deleteAction = (tenantUri, actionId) =>
    api.delete(`${tenantUri}/admin/action/${actionId}`);

export const createActionAttribute = (tenantUri, actionId, request) =>
    api.put(`${tenantUri}/admin/action/${actionId}`, request);

export const deleteActionAttribute = (tenantUri, attributeId) =>
    api.delete(`${tenantUri}/admin/action`, {params: {attributeId}});

export const getItems = (tenantUri) =>
    api.get(`/${tenantUri}/admin/item`);

export const createItem = (tenantUri, name, attributes) =>
    api.post(`/${tenantUri}/admin/item`, attributes, {params: {name}});

export const deleteItem = (tenantUri, itemId) =>
    api.delete(`/${tenantUri}/admin/item/${itemId}`);

export const createItemAttribute = (tenantUri, itemId, attrRequest) =>
    api.put(`/${tenantUri}/admin/item/${itemId}`, attrRequest);

export const deleteItemAttribute = (tenantUri, attributeId) =>
    api.delete(`/${tenantUri}/admin/item`, {params: {attributeId}});

export const getCustomerInventory = (tenantUri, customerId) =>
    api.get(`/${tenantUri}/admin/item/customer/${customerId}`);

export const grantItem = (tenantUri, itemId, customerId, attributes) =>
    api.post(`/${tenantUri}/admin/item/${itemId}/grant`, attributes, {params: {customerId}});

export const getRules = (tenantUri) => api.get(`/${tenantUri}/admin/rule`);

export const createRule = (tenantUri, data) => api.post(`/${tenantUri}/admin/rule`, data);

export const deleteRule = (tenantUri, ruleId) => api.delete(`/${tenantUri}/admin/rule/${ruleId}`);

export const getReactions = (tenantUri) => api.get(`/${tenantUri}/admin/reaction`);

export const createAttributeReaction = (tenantUri, data) => api.post(`/${tenantUri}/admin/reaction/attribute`, data);

export const createItemReaction = (tenantUri, data) => api.post(`/${tenantUri}/admin/reaction/item`, data);

export const getGrantedItemsByIds = (tenantUri, data) => api.post(`/${tenantUri}/admin/item/granted/bulk`, data)