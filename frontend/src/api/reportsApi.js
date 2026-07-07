import axiosInstance from './axiosInstance';

const REPORT_ENDPOINTS = Object.freeze({
    PLATFORM_HISTORY: '/reports/platform-history',
    GLOBAL_PLATFORM_HISTORY: '/reports/global-platform-history',
    USER_PERFORMANCE: (userId) => `/reports/user-performance/${userId}`,
});

/**
 * Fetch chronological performance history for a specific user.
 * @param {string} userId
 * @param {Object} params
 * @returns {Promise<Array>}
 */
export const fetchUserPerformanceHistory = async (userId, params = {}) => {
    const { data } = await axiosInstance.get(REPORT_ENDPOINTS.USER_PERFORMANCE(userId), { params });
    return data.data;
};

/**
 * Fetch chronological platform history for cards layout.
 * @returns {Promise<Array>}
 */
export const fetchPlatformHistory = async (params = {}) => {
    const { data } = await axiosInstance.get(REPORT_ENDPOINTS.PLATFORM_HISTORY, { params });
    return data.data; // Return the array of platform histories
};

/**
 * Fetch global chronological platform history for admin reports.
 * @returns {Promise<Array>}
 */
export const fetchGlobalPlatformHistory = async (params = {}) => {
    const { data } = await axiosInstance.get(REPORT_ENDPOINTS.GLOBAL_PLATFORM_HISTORY, { params });
    return data.data;
};
