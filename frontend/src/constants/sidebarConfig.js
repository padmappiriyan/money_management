import { FiGrid, FiDollarSign, FiGitPullRequest, FiUsers, FiShield, FiActivity, FiUser, FiLayers, FiTrendingUp, FiFileText } from 'react-icons/fi';

/**
 * Common sidebar items shared across multiple roles.
 */
const COMMON_ITEMS = {
  DASHBOARD: { label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  // TRANSACTIONS: { label: 'Transactions', path: '/dashboard/transactions', icon: FiDollarSign },
  TRANSACTION_HISTORY: { label: 'Transaction History', path: '/dashboard/transaction-history', icon: FiFileText },
  CHANGE_REQUESTS: { label: 'Change Requests', path: '/dashboard/change-requests', icon: FiGitPullRequest },
  AUDIT_LOGS: { label: 'Audit Logs', path: '/dashboard/audit-logs', icon: FiShield },
  SYSTEM_LOGS: { label: 'System Logs', path: '/dashboard/activity-timeline', icon: FiActivity },
  PROFILE: { label: 'Profile', path: '/dashboard/profile', icon: FiUser },
  // REPORTS: { label: 'Reports', path: '/dashboard/reports', icon: FiBarChart },
  EXCEL: { label: 'Excel', path: '/dashboard/excel', icon: FiFileText },
};

/**
 * Sidebar Navigation Configuration per Role.
 */
export const SIDEBAR_CONFIG = {
  admin: [
    COMMON_ITEMS.DASHBOARD,
    // COMMON_ITEMS.TRANSACTIONS,
    COMMON_ITEMS.TRANSACTION_HISTORY,
    { label: 'Source Brands', path: '/dashboard/platforms', icon: FiLayers },
    { label: 'Global Rates', path: '/dashboard/rates', icon: FiTrendingUp },
    COMMON_ITEMS.CHANGE_REQUESTS,
    { label: 'Users', path: '/dashboard/users', icon: FiUsers },
    { label: 'User Records', path: '/dashboard/user-records', icon: FiUsers },
    // COMMON_ITEMS.REPORTS,
    // COMMON_ITEMS.EXCEL,
    COMMON_ITEMS.AUDIT_LOGS,
    COMMON_ITEMS.SYSTEM_LOGS,
    COMMON_ITEMS.PROFILE,
  ],
  supervisor: [
    COMMON_ITEMS.DASHBOARD,
    // COMMON_ITEMS.TRANSACTIONS,
    COMMON_ITEMS.TRANSACTION_HISTORY,
    { label: 'Market Rates', path: '/dashboard/rates', icon: FiTrendingUp },
    COMMON_ITEMS.CHANGE_REQUESTS,
    COMMON_ITEMS.EXCEL,
    COMMON_ITEMS.AUDIT_LOGS,
    COMMON_ITEMS.SYSTEM_LOGS,
    COMMON_ITEMS.PROFILE,
  ],
  user: [
    COMMON_ITEMS.DASHBOARD,
    // COMMON_ITEMS.TRANSACTIONS,
    COMMON_ITEMS.TRANSACTION_HISTORY,
    // COMMON_ITEMS.EXCEL,
    COMMON_ITEMS.CHANGE_REQUESTS,
    COMMON_ITEMS.AUDIT_LOGS,
    COMMON_ITEMS.SYSTEM_LOGS,
    COMMON_ITEMS.PROFILE,
  ],
};
