import axiosInstance from './axiosInstance';

const LEDGER_ENDPOINTS = Object.freeze({
    STATUS: '/ledger/status',
    OPEN: '/ledger/opening',
    RECONCILE: '/ledger/reconcile',
    LOCK: '/ledger/lock',
    CLOSE: '/ledger/close',
    HISTORY: '/ledger/reconciliation-history'
});

/**
 * Fetch current ledger status
 * Renamed to getLedgerStatus to match existing component imports
 */
export const getLedgerStatus = async (currency = 'EUR') => {
    const { data } = await axiosInstance.get(LEDGER_ENDPOINTS.STATUS, { params: { currency } });
    return data;
};

/**
 * Set opening balance for a new shift
 */
export const openLedger = async (payload) => {
    const { data } = await axiosInstance.post(LEDGER_ENDPOINTS.OPEN, payload);
    return data;
};

/**
 * Close ledger with physical cash count
 */
export const closeLedger = async (payload) => {
    const { data } = await axiosInstance.post(LEDGER_ENDPOINTS.CLOSE, payload);
    return data;
};

/**
 * Lock ledger to prevent further transactions during reconciliation
 */
export const lockLedger = async (payload) => {
    const { data } = await axiosInstance.post(LEDGER_ENDPOINTS.LOCK, payload);
    return data;
};

/**
 * Save daily reconciliation data (Manual drawer balance)
 */
export const saveReconciliation = async (payload) => {
    const { data } = await axiosInstance.post(LEDGER_ENDPOINTS.RECONCILE, payload);
    return data;
};

/**
 * Get reconciliation history
 */
export const fetchReconciliationHistory = async (userId = null) => {
    const params = {};
    if (userId) params.userId = userId;
    const { data } = await axiosInstance.get(LEDGER_ENDPOINTS.HISTORY, { params });
    return data.data;
};
