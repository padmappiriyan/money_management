import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
    addMonths,
    subMonths,
} from 'date-fns';
import ExcelPlatformTable from '../../../components/excel/ExcelPlatformTable';
import { sortPlatformsByKnownOrder } from '../../../utils/platformStyles';
import { getPlatformKey } from '../../../utils/excelLedger';
import {
    loadLedgerTableData,
    saveLedgerTableData,
    LEDGER_UPDATED_EVENT,
    syncLedgerWithBackendTransactions
} from '../../../utils/excelLedgerStorage';
import DailyDrawerReconciliation from '../../../components/dashboard/DailyDrawerReconciliation';
import CloseDayConfirmationModal from '../../../components/dashboard/CloseDayConfirmationModal';
import {
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    PlusCircle,
    Activity,
    RefreshCw,
    Lock,
    User,
    Shield,
    CheckCircle,
    Calendar,
    ExternalLink,
    AlertCircle,
    Pointer,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLedgerStatus, lockLedger, openLedger } from '../../../api/ledgerApi';
import PlatformBalanceTable from '../../../components/dashboard/PlatformBalanceTable';
import useSettings from '../../../hooks/useSettings';
import { useMyBalances } from '../../../queries/useUserBalance';
import { useAuthContext } from '../../../contexts/AuthContext';
import RevenueAnalyticsChart from '../../../components/dashboard/RevenueAnalyticsChart';
import { getTransactionStats, getTransactions } from '../../../api/transactionApi';
import LedgerHistoryExplorer from '../../../components/dashboard/LedgerHistoryExplorer';
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

const UserDashboard = ({ userInfo }) => {
    const { activePlatforms, loadActivePlatforms } = useSettings();
    const { data: myBalances = [], isPending: balancesLoading, refetch: fetchMyBalances } = useMyBalances();
    const [startLoading, setStartLoading] = useState(false);
    const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [ledgerStatus, setLedgerStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Excel spreadsheet state
    const [selectedMonths, setSelectedMonths] = useState({});
    const [tableData, setTableData] = useState(() => loadLedgerTableData());

    useEffect(() => {
        const handleLedgerUpdate = () => {
            setTableData(loadLedgerTableData());
        };
        window.addEventListener(LEDGER_UPDATED_EVENT, handleLedgerUpdate);
        return () => window.removeEventListener(LEDGER_UPDATED_EVENT, handleLedgerUpdate);
    }, []);

    const excelPlatforms = useMemo(
        () => sortPlatformsByKnownOrder(activePlatforms).slice(0, 3),
        [activePlatforms]
    );

    useEffect(() => {
        setTableData((prev) => {
            let changed = false;
            const next = { ...prev };
            excelPlatforms.forEach((platform) => {
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
    }, [excelPlatforms, selectedMonths]);
    const [stats, setStats] = useState({
        totalTransactions: 0,
        volume: 0,
        averageValue: 0,
        successRate: 0
    });

    useEffect(() => {
        checkLedgerStatus();
        fetchMyBalances();
        fetchStats();
        loadActivePlatforms();
        syncDatabaseLedger();
    }, [fetchMyBalances, loadActivePlatforms]);

    const syncDatabaseLedger = async () => {
        try {
            const response = await getTransactions({ pageSize: 1000 });
            if (response && response.success && response.data) {
                syncLedgerWithBackendTransactions(response.data);
            }
        } catch (error) {
            console.error('Error syncing database ledger:', error);
        }
    };

    const checkLedgerStatus = async () => {
        try {
            const response = await getLedgerStatus();
            setLedgerStatus(response.data);
            if (!response.data?.isOpen) {
                // Temporarily disabling the mandatory daily shift pop-up based on user request
                // setIsOpeningModalOpen(true);
            }
        } catch (error) {
            console.error('Error checking ledger status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getTransactionStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleStartDay = async () => {
        try {
            setStartLoading(true);
            const suggested = ledgerStatus?.suggestedOpening || 0;
            await openLedger({ openingBalance: suggested, currency: 'EUR' });
            toast.success('Day started successfully');
            await checkLedgerStatus();
            fetchMyBalances();
            syncDatabaseLedger();
        } catch (error) {
            console.error('Error starting day:', error);
            toast.error(error.response?.data?.message || 'Failed to start day');
        } finally {
            setStartLoading(false);
        }
    };

    const handleCloseDayConfirm = async () => {
        try {
            setLoading(true);
            await lockLedger({ currency: 'EUR' }); // Initiates shift locking without requiring billetage
            toast.success('Shift locked for reconciliation');
            setIsCloseDayModalOpen(false); // Close the modal upon success
            await checkLedgerStatus(); // Refresh status to set isClosed to true
        } catch (error) {
            console.error('Error locking ledger:', error);
            toast.error(error.response?.data?.message || 'Failed to lock shift');
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    const isNotStarted = !ledgerStatus?.status;
    const isOpen = ledgerStatus?.status === 'open';
    const isClosed = ledgerStatus?.status === 'locked' || ledgerStatus?.status === 'closed' || isNotStarted;

    const globalTotals = myBalances.reduce((acc, platform) => ({
        opening: acc.opening + (platform.openingBalanceLkr || 0),
        send: acc.send + (platform.todaySendLkr || 0),
        paid: acc.paid + (platform.todayPaidLkr || 0),
        deposit: acc.deposit + (platform.todayDepositLkr || 0),
        balance: acc.balance + (platform.currentBalanceLkr || 0)
    }), { opening: 0, send: 0, paid: 0, deposit: 0, balance: 0 });

    return (
        <div className="px-4 py-2 lg:px-8 lg:py-4 space-y-6">


            <CloseDayConfirmationModal
                isOpen={isCloseDayModalOpen}
                onClose={() => setIsCloseDayModalOpen(false)}
                onConfirm={handleCloseDayConfirm}
            />

            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                            Welcome back, <span className="text-brand-600">{userInfo?.email || 'Partner'}</span>
                        </h1>
                        {isNotStarted ? (
                            <div className="px-3 py-1 rounded-full text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm border bg-slate-50 text-slate-400 border-slate-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                Not Started
                            </div>
                        ) : isOpen ? (
                            <div className="px-3 py-1 rounded-full text-[9px] font-bold uppercase  flex items-center gap-1.5 shadow-sm border bg-emerald-50 text-emerald-600 border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Opening
                            </div>
                        ) : (
                            <div className="px-3 py-1 rounded-full text-[9px] font-bold uppercase  flex items-center gap-1.5 shadow-sm border bg-slate-100 text-slate-400 border-slate-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                Closed
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                fetchMyBalances();
                                syncDatabaseLedger();
                            }}
                            className="bg-white hover:bg-slate-50 text-brand-800 px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-[10px]  transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                        >
                            <RefreshCw size={14} className={balancesLoading ? 'animate-spin' : ''} /> REFRESH
                        </button>
                        <button
                            onClick={handleStartDay}
                            disabled={!isNotStarted || startLoading}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-[10px]  transition-all shadow-xl active:scale-95 cursor-pointer ${isNotStarted ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'}`}
                        >
                            {startLoading ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />} START DAY
                        </button>
                        <button
                            onClick={() => setIsCloseDayModalOpen(true)}
                            disabled={!isOpen}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-[10px] transition-all shadow-xl active:scale-95 cursor-pointer ${isOpen ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200/50' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'}`}
                        >
                            <Lock size={14} /> CLOSE DAY
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5">Here's what's happening in your workspace today.</p>
                    
                    <div className="relative flex items-center group">
                        <button 
                            onClick={() => setIsStatsOpen(!isStatsOpen)} 
                            className="p-1 hover:bg-slate-100 rounded-full text-brand-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                        >
                            <Activity size={13} className="animate-pulse" />
                        </button>

                        {/* Custom Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                            View Today's Summary
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 transform rotate-45 -mt-[3px]" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isStatsOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                {/* Backdrop overlay with blur */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsStatsOpen(false)}
                                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                />

                                {/* Centered Modal Container */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    transition={{ type: 'spring', duration: 0.3 }}
                                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-100/50 p-6 md:p-8 flex flex-col gap-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-black text-slate-800 tracking-tight">Today's Summary</h3>
                                        <button
                                            onClick={() => setIsStatsOpen(false)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <p className="text-slate-400 text-xs font-semibold -mt-4 leading-relaxed">
                                        Here is your global workspace financial performance for today.
                                    </p>

                                    <div className="flex flex-col gap-3 py-2">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <span className="text-xs font-bold text-slate-500">Brought Fwd</span>
                                            <span className="text-sm font-black text-slate-800">{globalTotals.opening.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <span className="text-xs font-bold text-slate-500">Send</span>
                                            <span className="text-sm font-black text-emerald-600">+{globalTotals.send.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <span className="text-xs font-bold text-slate-500">Paid</span>
                                            <span className="text-sm font-black text-indigo-600">-{globalTotals.paid.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <span className="text-xs font-bold text-slate-500">Deposit</span>
                                            <span className="text-sm font-black text-emerald-600">-{globalTotals.deposit.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-brand-50/50 rounded-2xl border border-brand-100/50 mt-1">
                                            <span className="text-xs font-bold text-brand-700">Net Balance</span>
                                            <span className="text-sm font-black text-brand-600">{globalTotals.balance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            {/* ── Platform Ledgers ── */}
            <div className="w-full">
                <PlatformBalanceTable platforms={myBalances} loading={balancesLoading} isClosed={isClosed} />
            </div>

            {/* ── Excel Platform Tables (Side-by-Side Spreadsheet View) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start mt-4">
                {excelPlatforms.map((platform) => {
                    const platformKey = getPlatformKey(platform);
                    const platformMonth = selectedMonths[platformKey] || startOfMonth(new Date());
                    const pMonthKey = format(platformMonth, 'yyyy-MM');
                    const rows = tableData[platformKey]?.[pMonthKey] || buildMonthRows(platformMonth);

                    return (
                        <ExcelPlatformTable
                            key={platformKey}
                            platform={platform}
                            rows={rows}
                            onRowChange={() => {}} // Read-only representation on dashboard
                            selectedMonth={platformMonth}
                            onPrevMonth={() => setSelectedMonths((prev) => ({ ...prev, [platformKey]: subMonths(platformMonth, 1) }))}
                            onNextMonth={() => setSelectedMonths((current) => ({ ...current, [platformKey]: addMonths(platformMonth, 1) }))}
                            readOnly={true}
                        />
                    );
                })}
            </div>
            {/* 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[300px]">
                <div>
                    <RevenueAnalyticsChart 
                        data={[]} 
                        loading={false} 
                        stats={stats} 
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Shift Overview</h3>
                            <p className="text-neutral-500 mb-6 max-w-xs">Monitor your active shift performance and platform reconciliations.</p>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Platforms</span>
                                    <span className="text-2xl font-black text-brand-600">{myBalances.length}</span>
                                </div>
                                <div className="w-px h-10 bg-neutral-100 mx-2" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Global Status</span>
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Operational
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            */}


            <div className="mt-6">
                <LedgerHistoryExplorer />
            </div>
        </div>
    );
};

export default UserDashboard;
