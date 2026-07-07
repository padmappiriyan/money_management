import axiosInstance from './axiosInstance';

const USER_ENDPOINTS = Object.freeze({
  BASE: '/users',
  STATS: '/users/stats',
  BULK_UPLOAD: '/users/bulk-upload',
  TEMPLATE_DOWNLOAD: '/users/template/download',
});

/**
 * Fetch users with optional pagination and search
 * @param {object} params - { page, limit, search }
 * @returns {Promise<object>}
 */
export const getAllUsers = async (params = {}) => {
  const { data } = await axiosInstance.get(USER_ENDPOINTS.BASE, { params });
  return data; // Returns { success, users, pagination }
};

/**
 * Create a new user (Admin only)
 * @param {{ name, email, password, role }} userData 
 * @returns {Promise<object>}
 */
export const createUser = async (userData) => {
  const { data } = await axiosInstance.post(USER_ENDPOINTS.BASE, userData);
  return data;
};

/**
 * Update user status (Admin only)
 * @param {string} userId
 * @param {string} status
 * @returns {Promise<object>}
 */
export const updateUserStatus = async (userId, status) => {
  const { data } = await axiosInstance.patch(`${USER_ENDPOINTS.BASE}/${userId}/status`, { status });
  return data.user;
};

/**
 * Get user stats (counts by role)
 * @returns {Promise<{ admin: number, supervisor: number, user: number, total: number }>}
 */
export const getUserStats = async () => {
  const { data } = await axiosInstance.get(USER_ENDPOINTS.STATS);
  return data.stats;
};

/**
 * Download User Template as Blob
 * @returns {Promise<Blob>}
 */
export const downloadUserTemplate = async () => {
    const { data } = await axiosInstance.get(USER_ENDPOINTS.TEMPLATE_DOWNLOAD, {
        responseType: 'blob'
    });
    return data;
};

/**
 * Bulk Upload Users
 * @param {File} file 
 * @returns {Promise<object>}
 */
export const bulkUploadUsers = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post(USER_ENDPOINTS.BULK_UPLOAD, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};
