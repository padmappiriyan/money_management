/**
 * Shared Axios instance.
 *
 * Authentication strategy: HttpOnly Cookie
 * -----------------------------------------
 * The backend sets `accessToken` and `refreshToken` as httpOnly cookies.
 * `withCredentials: true` tells the browser to include those cookies on
 * every cross-origin request automatically — no manual token injection needed.
 *
 * ⚠️  The backend CORS config must allow the specific frontend origin (not '*')
 *     and have `credentials: true` for this to work.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Guard to prevent infinite refresh loops and handle race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect 401 Unauthorized errors that aren't from the refresh/login calls themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      
      if (isRefreshing) {
        // If already refreshing, wait for it to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // Attempt to call the refresh endpoint
        // Backend reads HttpOnly refresh token and rotates cookies
        axiosInstance
          .post('/auth/refresh')
          .then(() => {
            processQueue(null);
            resolve(axiosInstance(originalRequest));
          })
          .catch((err) => {
            // Refresh failed (likely token expired or revoked)
            processQueue(err);
            
            // Wipe the user state to force redirect to login
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Normalise other errors for cleaner UI handling
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
