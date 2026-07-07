import axiosInstance from './axiosInstance';

const ACTIVITY_ENDPOINTS = {
  BASE: '/activities',
  ME: '/activities/me'
};

/**
 * Fetch activities with optional pagination and search
 * The backend will filter results based on the logged-in user's role.
 * @param {object} params - { page, limit, search, actionType, startDate, endDate, userId }
 * @returns {Promise<object>}
 */
export const getActivities = async (params = {}) => {
  const { data } = await axiosInstance.get(ACTIVITY_ENDPOINTS.BASE, { params });
  return data; // { success, data: [], pagination }
};

// Backward compatibility or legacy use
export const getAllActivities = getActivities;
export const getMyActivities = getActivities;
