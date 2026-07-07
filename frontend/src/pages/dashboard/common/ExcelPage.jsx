import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FiFileText, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
    addMonths,
    subMonths,
} from 'date-fns';
import { useAuthContext } from '../../../contexts/AuthContext';
import useSettings from '../../../hooks/useSettings';
import ExcelPlatformTable from '../../../components/excel/ExcelPlatformTable';
import ExcelEntryForm from '../../../components/excel/ExcelEntryForm';
import UserReconciliationHistory from '../../../components/dashboard/admin/UserReconciliationHistory';
import { sortPlatformsByKnownOrder } from '../../../utils/platformStyles';
import {
    parseAmount,
    applyEntryToRow,
    findPlatformByValue,
    getPlatformKey,
    getFieldForEntryType,
} from '../../../utils/excelLedger';
import {
    loadLedgerTableData,
    saveLedgerTableData,
    LEDGER_UPDATED_EVENT,
    syncLedgerWithBackendTransactions
} from '../../../utils/excelLedgerStorage';
import { getTransactions } from '../../../api/transactionApi';
import toast from 'react-hot-toast';

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

const ExcelPage = () => {
    const { activePlatforms, loadActivePlatforms, loading } = useSettings();
    const { userInfo } = useAuthContext();
    const [selectedMonths, setSelectedMonths] = useState({});
    const [tableData, setTableData] = useState(() => loadLedgerTableData());

    useEffect(() => {
        const handleLedgerUpdate = () => {
            setTableData(loadLedgerTableData());
        };
        window.addEventListener(LEDGER_UPDATED_EVENT, handleLedgerUpdate);
        return () => window.removeEventListener(LEDGER_UPDATED_EVENT, handleLedgerUpdate);
    }, []);

    const syncDatabaseLedger = useCallback(async () => {
        try {
            const response = await getTransactions({ pageSize: 1000 });
            if (response && response.success && response.data) {
                syncLedgerWithBackendTransactions(response.data);
            }
        } catch (error) {
            console.error('Error syncing database ledger:', error);
        }
    }, []);

    useEffect(() => {
        loadActivePlatforms();
        syncDatabaseLedger();
    }, [loadActivePlatforms, syncDatabaseLedger]);

    const platforms = useMemo(
        () => sortPlatformsByKnownOrder(activePlatforms).slice(0, 3),
        [activePlatforms]
    );

    const ensureMonthRows = useCallback((prev, platformId, monthDate) => {
        const key = format(monthDate, 'yyyy-MM');
        const existing = prev[platformId]?.[key];
        if (existing) return existing;
        return buildMonthRows(monthDate);
    }, []);

    useEffect(() => {
        setTableData((prev) => {
            let changed = false;
            const next = { ...prev };
            platforms.forEach((platform) => {
                const platformKey = getPlatformKey(platform);
                const platformMonth = selectedMonths[platformKey] || startOfMonth(new Date());
                const pMonthKey = format(platformMonth, 'yyyy-MM');
                if (!next[platformKey]?.[pMonthKey]) {
                    next[platformKey] = {
                        ...(next[platformKey] || {}),
                        [pMonthKey]: buildMonthRows(platformMonth),
                    };
                    changed = true;
                }
            });
            if (changed) {
                saveLedgerTableData(next, { notify: false });
            }
            return next;
        });
    }, [platforms, selectedMonths]);

    const handleRowChange = useCallback((platformKey, dateKey, updatedRow) => {
        setTableData((prev) => {
            const entryDate = new Date(`${dateKey}T12:00:00`);
            const rowMonthKey = format(startOfMonth(entryDate), 'yyyy-MM');
            const next = {
                ...prev,
                [platformKey]: {
                    ...(prev[platformKey] || {}),
                    [rowMonthKey]: (prev[platformKey]?.[rowMonthKey] || []).map((row) =>
                        row.dateKey === dateKey ? updatedRow : row
                    ),
                },
            };
            saveLedgerTableData(next, { notify: false });
            return next;
        });
    }, []);

    const handleEntrySubmit = useCallback((formData) => {
        const platform = findPlatformByValue(platforms, formData.platform);
        if (!platform) {
            toast.error('Selected platform was not found.');
            return false;
        }

        const amount = parseAmount(formData.amount);
        const field = getFieldForEntryType(formData.type);
        if (!field) {
            return false;
        }

        const platformKey = getPlatformKey(platform);
        const entryDate = formData.date ? new Date(`${formData.date}T12:00:00`) : new Date();
        const entryDateKey = format(entryDate, 'yyyy-MM-dd');
        const entryMonth = startOfMonth(entryDate);
        const entryMonthKey = format(entryMonth, 'yyyy-MM');

        setTableData((prev) => {
            const rows = ensureMonthRows(prev, platformKey, entryMonth).map((row) =>
                row.dateKey === entryDateKey ? applyEntryToRow(row, formData.type, amount) : row
            );

            const next = {
                ...prev,
                [platformKey]: {
                    ...(prev[platformKey] || {}),
                    [entryMonthKey]: rows,
                },
            };
            saveLedgerTableData(next, { notify: false });
            return next;
        });

        const typeLabel = formData.type.charAt(0).toUpperCase() + formData.type.slice(1);
        const platformName = platform.name || formData.platform;
        toast.success(`${typeLabel} entry of €${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} added to ${platformName} for today.`);

        if (entryMonthKey !== format(selectedMonths[platformKey] || startOfMonth(new Date()), 'yyyy-MM')) {
            toast('Entry saved for today. Switch to the current month to view it.', { icon: 'ℹ️' });
        }

        return true;
    }, [platforms, ensureMonthRows, selectedMonths]);

    const handleResetMonth = () => {
        setSelectedMonths({});
    };

    const isLoading = loading && platforms.length === 0;

    return (
        <div className="px-4 py-2 md:px-8 mx-auto max-w-[1600px]">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                            <FiFileText size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter leading-none">
                            Excel <span className="text-brand-600">Workspace</span>
                        </h1>
                    </div>
                    <p className="text-neutral-500 font-bold text-sm mt-1">
                        For <span className="text-brand-600">{userInfo?.email || userInfo?.name || 'User'}</span>
                    </p>
                    <p className="text-neutral-400 font-bold text-[13px] opacity-80 mt-1">
                        Platform daily ledgers — editable spreadsheet view
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleResetMonth}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-600 transition-colors"
                    >
                        <FiRefreshCw size={14} />
                        Reset Months
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-[420px] bg-neutral-50 animate-pulse rounded-2xl border border-neutral-100" />
                    ))}
                </div>
            ) : platforms.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[360px] bg-white rounded-3xl border border-neutral-100">
                    <p className="text-neutral-500 font-medium">No active platforms found.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {platforms.map((platform) => {
                            const platformKey = getPlatformKey(platform);
                            const platformMonth = selectedMonths[platformKey] || startOfMonth(new Date());
                            const pMonthKey = format(platformMonth, 'yyyy-MM');
                            const rows = tableData[platformKey]?.[pMonthKey] || buildMonthRows(platformMonth);

                            return (
                                <ExcelPlatformTable
                                    key={platformKey}
                                    platform={platform}
                                    rows={rows}
                                    onRowChange={handleRowChange}
                                    selectedMonth={platformMonth}
                                    onPrevMonth={() => setSelectedMonths((prev) => ({ ...prev, [platformKey]: subMonths(platformMonth, 1) }))}
                                    onNextMonth={() => setSelectedMonths((current) => ({ ...current, [platformKey]: addMonths(platformMonth, 1) }))}
                                    readOnly={true}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-8 mb-8">
                        <UserReconciliationHistory userId={userInfo?.id || userInfo?._id} />
                    </div>

                    <ExcelEntryForm platforms={platforms} onSubmit={handleEntrySubmit} />
                </>
            )}
        </div>
    );
};

export default ExcelPage;
