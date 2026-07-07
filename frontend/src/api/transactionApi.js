import axiosInstance from './axiosInstance';

const TRANSACTION_ENDPOINTS = Object.freeze({
  BASE: '/transactions',
  LEDGER: '/transactions/ledger',
  EXPORT: '/transactions/export',
  STATS: '/analytics/daily',
  BY_ID: (id) => `/transactions/${id}`,
});

export const getTransactionStats = async (params) => {
  const { data } = await axiosInstance.get(TRANSACTION_ENDPOINTS.STATS, { params });
  return data.data; // backend: { summary: {}, breakdown: [] }
};

/**
 * Record a new institutional fund transfer.
 * 
 * @param {Object} transactionData 
 * @returns {Promise<Object>}
 */
export const createTransaction = async (transactionData) => {
  const { data } = await axiosInstance.post(TRANSACTION_ENDPOINTS.BASE, transactionData);
  return data.data; // backend: { success: true, data: { ... } }
};

/**
 * Retrieve transactions with optional filters and pagination.
 * 
 * @param {Object} params - Query parameters (platform, type, staffId, keyword, etc.)
 * @returns {Promise<Object>}
 */
export const getTransactions = async (params) => {
  const { data } = await axiosInstance.get(TRANSACTION_ENDPOINTS.BASE, { params });
  return data; // backend: { success: true, data: [], total, pages, page }
};

/**
 * Retrieve specialized ledger transactions matching current dashboard schema.
 */
export const getLedgerTransactions = async (params) => {
  const { data } = await axiosInstance.get(TRANSACTION_ENDPOINTS.LEDGER, { params });
  return data; // backend: { success: true, data: [], total, pages, page }
};

/**
 * Download transactions as Excel.
 * 
 * @param {Object} params - Current filters
 * @returns {Promise<Blob>}
 */
export const exportTransactions = async (params) => {
  const response = await axiosInstance.get(TRANSACTION_ENDPOINTS.EXPORT, { 
    params,
    responseType: 'blob' 
  });
  return response.data;
};

/**
 * Get detailed transaction by ID.
 * 
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getTransactionById = async (id) => {
  const { data } = await axiosInstance.get(TRANSACTION_ENDPOINTS.BY_ID(id));
  return data.data;
};

