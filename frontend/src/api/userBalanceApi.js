import axiosInstance from './axiosInstance';

const USER_BALANCE_ENDPOINTS = Object.freeze({
  MINE: '/user-balances/mine',
  GLOBAL: '/user-balances/global',
  ALL_USERS: '/user-balances/all-users',
  ADJUST: (staffId, platformId) => `/user-balances/adjust/${staffId}/${platformId}`,
});

/**
 * Get the logged-in user's platform account balances.
 * 
 * @returns {Promise<Array>} List of platform objects with currentBalanceLkr
 */
export const getMyPlatformBalances = async () => {
    const { data } = await axiosInstance.get(USER_BALANCE_ENDPOINTS.MINE);
    return data.balances; // backend returns { success: true, balances: [...] }
};

/**
 * Get aggregate platform balances for all users (Admin Only).
 * 
 * @returns {Promise<Object>} Object with totalOpeningBalance, totalSpend, etc.
 */
export const getGlobalPlatformBalances = async () => {
    const { data } = await axiosInstance.get(USER_BALANCE_ENDPOINTS.GLOBAL);
    return data.data;
};

/**
 * Get performance breakdown for all users (Admin Only).
 * 
 * @param {Object} filters - { search, status, platformId, from, to }
 * @returns {Promise<Array>} List of user performance records
 */
export const getAllUsersBalances = async (filters = {}) => {
    const { page = 1, size = 10, ...payload } = filters;
    const { data } = await axiosInstance.post(
        USER_BALANCE_ENDPOINTS.ALL_USERS, 
        payload,
        { params: { page, size } }
    );
    return data;
};

/**
 * Adjust (Top-up) a specific staff member's balance.
 * 
 * @param {string} staffId 
 * @param {string} platformId 
 * @param {Object} adjustmentData - { amount, type }
 * @returns {Promise<Object>}
 */
export const adjustStaffBalance = async (staffId, platformId, adjustmentData) => {
    const { data } = await axiosInstance.post(
        USER_BALANCE_ENDPOINTS.ADJUST(staffId, platformId), 
        adjustmentData
    );
    return data.data;
};
