import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
} from 'date-fns';
import {
    applyEntryToRow,
    normalizeEntryType,
    parseAmount,
    computeBalance,
} from './excelLedger';

const getStorageKey = () => {
    try {
        const rawUser = localStorage.getItem('userInfo');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const userId = user?.email || user?._id || user?.id || 'guest';
        return `mttms_excel_ledger_v1_${userId}`;
    } catch {
        return 'mttms_excel_ledger_v1_guest';
    }
};

export const LEDGER_UPDATED_EVENT = 'excel-ledger-updated';

const buildEmptyRow = (date) => ({
    date,
    dateKey: format(date, 'yyyy-MM-dd'),
    bf: '',
    send: '',
    paid: '',
    deposit: '',
    balance: 0,
});

const buildMonthRows = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return eachDayOfInterval({ start, end }).map(buildEmptyRow);
};

export const loadLedgerTableData = () => {
    try {
        const raw = localStorage.getItem(getStorageKey());
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Load ledger table data for a SPECIFIC user (used by admin to view other users' records).
 * @param {{ email?: string, _id?: string, id?: string }} user
 */
export const loadLedgerTableDataForUser = (user) => {
    try {
        const userId = user?.email || user?._id || user?.id || 'guest';
        const key = `mttms_excel_ledger_v1_${userId}`;
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Load and aggregate ledger table data for ALL active users.
 */
export const loadLedgerTableDataForAllUsers = (users) => {
    const aggregatedData = {};

    users.forEach(user => {
        // Only include active users in the aggregation
        if (user.status === 'inactive') return;

        const userData = loadLedgerTableDataForUser(user);
        
        Object.keys(userData).forEach(platformKey => {
            if (!aggregatedData[platformKey]) {
                aggregatedData[platformKey] = {};
            }
            
            Object.keys(userData[platformKey]).forEach(monthKey => {
                if (!aggregatedData[platformKey][monthKey]) {
                    const [year, month] = monthKey.split('-');
                    const monthDate = new Date(year, month - 1, 1);
                    aggregatedData[platformKey][monthKey] = buildMonthRows(monthDate);
                }
                
                const userMonthRows = userData[platformKey][monthKey];
                const aggMonthRows = aggregatedData[platformKey][monthKey];
                
                userMonthRows.forEach(userRow => {
                    const aggRowIndex = aggMonthRows.findIndex(r => r.dateKey === userRow.dateKey);
                    if (aggRowIndex !== -1) {
                        const aggRow = { ...aggMonthRows[aggRowIndex] };
                        
                        const currentBf = parseAmount(aggRow.bf);
                        const userBf = parseAmount(userRow.bf);
                        if (currentBf > 0 || userBf > 0) aggRow.bf = String(currentBf + userBf);

                        const currentSend = parseAmount(aggRow.send);
                        const userSend = parseAmount(userRow.send);
                        if (currentSend > 0 || userSend > 0) aggRow.send = String(currentSend + userSend);
                        
                        const currentPaid = parseAmount(aggRow.paid);
                        const userPaid = parseAmount(userRow.paid);
                        if (currentPaid > 0 || userPaid > 0) aggRow.paid = String(currentPaid + userPaid);
                        
                        const currentDeposit = parseAmount(aggRow.deposit);
                        const userDeposit = parseAmount(userRow.deposit);
                        if (currentDeposit > 0 || userDeposit > 0) aggRow.deposit = String(currentDeposit + userDeposit);
                        
                        aggRow.balance = parseAmount(aggRow.bf) + parseAmount(aggRow.send) - parseAmount(aggRow.paid) - parseAmount(aggRow.deposit);
                        
                        aggMonthRows[aggRowIndex] = aggRow;
                    }
                });
            });
        });
    });

    return aggregatedData;
};

export const saveLedgerTableData = (tableData, { notify = true } = {}) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(tableData));
    if (notify) {
        window.dispatchEvent(new Event(LEDGER_UPDATED_EVENT));
    }
};

const ensureMonthRowsInData = (data, platformKey, monthDate) => {
    const monthKey = format(monthDate, 'yyyy-MM');
    const existing = data[platformKey]?.[monthKey];
    if (existing) return existing;
    return buildMonthRows(monthDate);
};

export const applyLedgerEntry = (tableData, { platformKey, date, type, amount }) => {
    const entryDate = date instanceof Date ? date : new Date(`${date}T12:00:00`);
    const dateKey = format(entryDate, 'yyyy-MM-dd');
    const entryMonth = startOfMonth(entryDate);
    const monthKey = format(entryMonth, 'yyyy-MM');
    const ledgerType = normalizeEntryType(type);
    const numericAmount = parseAmount(amount);

    const monthRows = ensureMonthRowsInData(tableData, platformKey, entryMonth);
    const updatedRows = monthRows.map((row) =>
        row.dateKey === dateKey ? applyEntryToRow(row, ledgerType, numericAmount) : row
    );

    return {
        tableData: {
            ...tableData,
            [platformKey]: {
                ...(tableData[platformKey] || {}),
                [monthKey]: updatedRows,
            },
        },
        entryMonthKey: monthKey,
        dateKey,
        entryDate,
    };
};

export const appendLedgerEntry = (entry) => {
    const current = loadLedgerTableData();
    const { tableData } = applyLedgerEntry(current, entry);
    saveLedgerTableData(tableData);
    return tableData;
};

/**
 * Synchronizes the local storage table data with the official transactions from the backend database.
 * @param {Array} transactions - List of transactions from the backend
 */
export const syncLedgerWithBackendTransactions = (transactions) => {
    if (!Array.isArray(transactions)) return;
    
    let tableData = loadLedgerTableData();
    let changed = false;
    
    // Group transactions by platformKey and monthKey
    const grouped = {};
    transactions.forEach(tx => {
        if (!tx.platform || !tx.type || !tx.amount) return;
        
        // Normalize platform key
        let platformKey = tx.platform.toLowerCase();
        if (platformKey.includes('western')) platformKey = 'western_union';
        else if (platformKey.includes('moneygram')) platformKey = 'moneygram';
        else if (platformKey.includes('ria')) platformKey = 'ria';
        
        const txDate = new Date(tx.createdAt);
        const monthKey = format(txDate, 'yyyy-MM');
        const dateKey = format(txDate, 'yyyy-MM-dd');
        
        if (!grouped[platformKey]) grouped[platformKey] = {};
        if (!grouped[platformKey][monthKey]) grouped[platformKey][monthKey] = {};
        if (!grouped[platformKey][monthKey][dateKey]) {
            grouped[platformKey][monthKey][dateKey] = { send: 0, paid: 0, deposit: 0 };
        }
        
        const type = normalizeEntryType(tx.type);
        if (type === 'send') {
            grouped[platformKey][monthKey][dateKey].send += tx.amount;
        } else if (type === 'receive' || type === 'paid') {
            grouped[platformKey][monthKey][dateKey].paid += tx.amount;
        } else if (type === 'deposit') {
            grouped[platformKey][monthKey][dateKey].deposit += tx.amount;
        }
    });

    // Merge grouped transactions into tableData
    Object.keys(grouped).forEach(platformKey => {
        Object.keys(grouped[platformKey]).forEach(monthKey => {
            // Check if we need to initialize this month
            if (!tableData[platformKey]) tableData[platformKey] = {};
            if (!tableData[platformKey][monthKey]) {
                const [year, month] = monthKey.split('-');
                const monthDate = new Date(year, month - 1, 1);
                tableData[platformKey][monthKey] = buildMonthRows(monthDate);
            }
            
            const monthRows = tableData[platformKey][monthKey];
            let monthChanged = false;
            
            const updatedRows = monthRows.map(row => {
                const txData = grouped[platformKey][monthKey][row.dateKey];
                if (txData) {
                    // Update send, paid, deposit with the official database values
                    const nextSend = txData.send > 0 ? String(txData.send) : '';
                    const nextPaid = txData.paid > 0 ? String(txData.paid) : '';
                    const nextDeposit = txData.deposit > 0 ? String(txData.deposit) : '';
                    
                    if (row.send !== nextSend || row.paid !== nextPaid || row.deposit !== nextDeposit) {
                        monthChanged = true;
                        return {
                            ...row,
                            send: nextSend,
                            paid: nextPaid,
                            deposit: nextDeposit,
                            balance: computeBalance(row.bf, nextSend, nextPaid, nextDeposit)
                        };
                    }
                }
                return row;
            });
            
            if (monthChanged) {
                tableData[platformKey][monthKey] = updatedRows;
                changed = true;
            }
        });
    });

    if (changed) {
        saveLedgerTableData(tableData);
    }
};

/**
 * Save ledger table data for a SPECIFIC user.
 */
export const saveLedgerTableDataForUser = (user, tableData, { notify = true } = {}) => {
    const userId = user?.email || user?._id || user?.id || 'guest';
    const key = `mttms_excel_ledger_v1_${userId}`;
    localStorage.setItem(key, JSON.stringify(tableData));
    if (notify) {
        window.dispatchEvent(new Event(LEDGER_UPDATED_EVENT));
    }
};

/**
 * Synchronizes the local storage table data for a SPECIFIC user with their official transactions from the database.
 * @param {Object} user - User object
 * @param {Array} transactions - List of transactions from the backend
 */
export const syncLedgerWithBackendTransactionsForUser = (user, transactions) => {
    if (!user || !Array.isArray(transactions)) return;
    
    let tableData = loadLedgerTableDataForUser(user);
    let changed = false;
    
    // Group transactions by platformKey and monthKey
    const grouped = {};
    transactions.forEach(tx => {
        if (!tx.platform || !tx.type || !tx.amount) return;
        
        // Normalize platform key
        let platformKey = tx.platform.toLowerCase();
        if (platformKey.includes('western')) platformKey = 'western_union';
        else if (platformKey.includes('moneygram')) platformKey = 'moneygram';
        else if (platformKey.includes('ria')) platformKey = 'ria';
        
        const txDate = new Date(tx.createdAt);
        const monthKey = format(txDate, 'yyyy-MM');
        const dateKey = format(txDate, 'yyyy-MM-dd');
        
        if (!grouped[platformKey]) grouped[platformKey] = {};
        if (!grouped[platformKey][monthKey]) grouped[platformKey][monthKey] = {};
        if (!grouped[platformKey][monthKey][dateKey]) {
            grouped[platformKey][monthKey][dateKey] = { send: 0, paid: 0, deposit: 0 };
        }
        
        const type = normalizeEntryType(tx.type);
        if (type === 'send') {
            grouped[platformKey][monthKey][dateKey].send += tx.amount;
        } else if (type === 'receive' || type === 'paid') {
            grouped[platformKey][monthKey][dateKey].paid += tx.amount;
        } else if (type === 'deposit') {
            grouped[platformKey][monthKey][dateKey].deposit += tx.amount;
        }
    });

    // Merge grouped transactions into tableData
    Object.keys(grouped).forEach(platformKey => {
        Object.keys(grouped[platformKey]).forEach(monthKey => {
            // Check if we need to initialize this month
            if (!tableData[platformKey]) tableData[platformKey] = {};
            if (!tableData[platformKey][monthKey]) {
                const [year, month] = monthKey.split('-');
                const monthDate = new Date(year, month - 1, 1);
                tableData[platformKey][monthKey] = buildMonthRows(monthDate);
            }
            
            const monthRows = tableData[platformKey][monthKey];
            let monthChanged = false;
            
            const updatedRows = monthRows.map(row => {
                const txData = grouped[platformKey][monthKey][row.dateKey];
                if (txData) {
                    // Update send, paid, deposit with the official database values
                    const nextSend = txData.send > 0 ? String(txData.send) : '';
                    const nextPaid = txData.paid > 0 ? String(txData.paid) : '';
                    const nextDeposit = txData.deposit > 0 ? String(txData.deposit) : '';
                    
                    if (row.send !== nextSend || row.paid !== nextPaid || row.deposit !== nextDeposit) {
                        monthChanged = true;
                        return {
                            ...row,
                            send: nextSend,
                            paid: nextPaid,
                            deposit: nextDeposit,
                            balance: computeBalance(row.bf, nextSend, nextPaid, nextDeposit)
                        };
                    }
                }
                return row;
            });
            
            if (monthChanged) {
                tableData[platformKey][monthKey] = updatedRows;
                changed = true;
            }
        });
    });

    if (changed) {
        saveLedgerTableDataForUser(user, tableData);
    }
};

export { buildMonthRows, buildEmptyRow };
