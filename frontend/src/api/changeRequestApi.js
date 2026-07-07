import axiosInstance from './axiosInstance';

const CHANGE_REQUEST_ENDPOINTS = Object.freeze({
  BASE: '/change-requests',
  DETAIL: (id) => `/change-requests/${id}`,
  APPROVE: (id) => `/change-requests/${id}/approve`,
  REJECT: (id) => `/change-requests/${id}/reject`,
  ANALYTICS: '/change-requests/stats/analytics',
});

/**
 * Get change request analytics.
 * 
 * @returns {Promise<Object>}
 */
export const getChangeRequestAnalytics = async () => {
  const { data } = await axiosInstance.get(CHANGE_REQUEST_ENDPOINTS.ANALYTICS);
  return data.data;
};

/**
 * Get a single change request by ID.
 * 
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getChangeRequestById = async (id) => {
  const { data } = await axiosInstance.get(CHANGE_REQUEST_ENDPOINTS.DETAIL(id));
  return data.data;
};

/**
 * Submit a request to modify a transaction field.
 * 
 * @param {Object} requestData - { transactionId, field, newValue, reason }
 * @returns {Promise<Object>}
 */
export const createChangeRequest = async (requestData) => {
  const { data } = await axiosInstance.post(CHANGE_REQUEST_ENDPOINTS.BASE, requestData);
  return data.data;
};

/**
 * Get all or filtered change requests.
 * 
 * @param {Object} params - Query params (status, transactionId, pageNumber, pageSize)
 * @returns {Promise<Object>}
 */
export const getChangeRequests = async (params) => {
  const { data } = await axiosInstance.get(CHANGE_REQUEST_ENDPOINTS.BASE, { params });
  return data;
};

/**
 * Admin: Approve a change request.
 * 
 * @param {string} id 
 * @param {Object} adminData - { adminRemarks } 
 * @returns {Promise<Object>}
 */
export const approveChangeRequest = async (id, adminData) => {
  const { data } = await axiosInstance.put(CHANGE_REQUEST_ENDPOINTS.APPROVE(id), adminData);
  return data.data;
};

/**
 * Admin: Reject a change request.
 * 
 * @param {string} id 
 * @param {Object} adminData - { adminRemarks } 
 * @returns {Promise<Object>}
 */
export const rejectChangeRequest = async (id, adminData) => {
  const { data } = await axiosInstance.put(CHANGE_REQUEST_ENDPOINTS.REJECT(id), adminData);
  return data.data;
};
