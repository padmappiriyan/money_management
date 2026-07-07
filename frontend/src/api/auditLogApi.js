import axiosInstance from './axiosInstance';

/**
 * Fetch Audit Logs
 * @param {Object} params
 * @param {number} params.pageNumber  - page number (default 1)
 * @param {number} params.pageSize    - results per page (default 20)
 * @param {string} params.startDate   - ISO date string e.g. "2026-06-01"
 * @param {string} params.endDate     - ISO date string e.g. "2026-06-30"
 * @param {string} params.eventType   - comma-separated: "send", "receive", "deposit"
 * @param {string} params.platform    - comma-separated slugs: "ria", "moneygram", "western-union"
 * @returns {Promise<Object>}
 */
export const getAuditLogs = async (params) => {
    const { data } = await axiosInstance.get('/audit-logs', { params });
    return data;
};
