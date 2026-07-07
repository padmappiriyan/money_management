/**
 * Auth-domain API calls.
 *
 * Backend contract  (POST /api/auth/*)
 * ─────────────────────────────────────
 *  POST /login   → body { email, password }
 *                ← sets httpOnly cookies (accessToken, refreshToken)
 *                ← body { success: true, user: { id, name, email, role, status, ... } }
 *
 *  POST /refresh → reads refreshToken cookie automatically (withCredentials)
 *                ← rotates cookies
 *                ← body { success: true, message }
 *
 *  POST /logout  → clears cookies in DB and browser
 *                ← body { message: 'User logged out successfully' }
 *
 * Each function returns only the relevant payload so callers stay clean.
 */
import axiosInstance from './axiosInstance';

const AUTH_ENDPOINTS = Object.freeze({
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  CHANGE_PASSWORD: '/auth/change-password',
});

/**
 * Authenticate a user and receive their profile.
 * Tokens are set as httpOnly cookies by the server — no token handling needed here.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ id, name, email, role, status, createdAt, modifiedAt }>}
 */
export const loginUser = async ({ email, password }) => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, { email, password });
  return data.user; // backend: { success: true, user: { ... } }
};

/**
 * Request a new access token using the stored refresh token cookie.
 * Call this when a protected request returns 401.
 *
 * @returns {Promise<void>}
 */
export const refreshAccessToken = async () => {
  await axiosInstance.post(AUTH_ENDPOINTS.REFRESH);
};

/**
 * Log out the current user — clears httpOnly cookies on the server
 * and revokes the refresh token in the database.
 *
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
};

/**
 * Update the current user's password.
 * 
 * @param {{ currentPassword, newPassword }} payload 
 * @returns {Promise<void>}
 */
export const changePassword = async (payload) => {
  await axiosInstance.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload);
};
