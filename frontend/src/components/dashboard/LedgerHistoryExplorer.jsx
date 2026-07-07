import React, { useState, useEffect, useMemo } from 'react';
import { useMyBalances } from '../../queries/useUserBalance';
import { FiCalendar, FiActivity } from 'react-icons/fi';
import { fetchPlatformHistory } from '../../api/reportsApi';
import toast from 'react-hot-toast';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    formatCurrencyAmount,
    formatCurrencyWithLabel,
    formatChartAxisTick,
} from '../../utils/currency';

const LedgerHistoryExplorer = () => {
    const [rangeType, setRangeType] = useState('Last 7 Days'); // 'Last 7 Days', '30 Days', 'All Time', 'Custom'
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');

    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Global Master');
    const [refreshTrigger, setRefreshTrigger] = useState(0);


    const { data: myBalances = [] } = useMyBalances();
    const balancesKey = myBalances.map(b => (b.currentBalanceLkr || b.balance || 0)).join(',');

    useEffect(() => {
        const handleUpdate = () => {
            setRefreshTrigger(prev => prev + 1);
        };
        window.addEventListener('excel-ledger-updated', handleUpdate);
        return () => window.removeEventListener('excel-ledger-updated', handleUpdate);
    }, []);

    // Handle Quick Ranges
    useEffect(() => {
        const today = new Date();
        const end = today.toISOString().split('T')[0];

        if (rangeType === 'Last 7 Days') {
            const start = new Date();
            start.setDate(today.getDate() - 7);
            setHistoryStartDate(start.toISOString().split('T')[0]);
            setHistoryEndDate(end);
        } else if (rangeType === '30 Days') {
            const start = new Date();
            start.setDate(today.getDate() - 30);
            setHistoryStartDate(start.toISOString().split('T')[0]);
            setHistoryEndDate(end);
        } else if (rangeType === 'All Time') {
            setHistoryStartDate('');
            setHistoryEndDate('');
        }
    }, [rangeType]);

    // Data Fetcher
    useEffect(() => {
        // Skip fetching if Custom is selected but dates aren't fully filled.
        if (rangeType === 'Custom' && (!historyStartDate || !historyEndDate)) {
            return;
        }

        const loadHistory = async () => {
            try {
                setLoading(true);
                const params = {};
                if (historyStartDate) params.startDate = historyStartDate;
                if (historyEndDate) params.endDate = historyEndDate;
                const data = await fetchPlatformHistory(params);
                setHistories(data);
            } catch (error) {
                console.error("Failed to fetch platform history:", error);
                toast.error("Failed to load ledger history.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [rangeType, historyStartDate, historyEndDate, balancesKey, refreshTrigger]);

    // Compute Global Master
    const globalHistory = useMemo(() => {
        if (!histories || histories.length === 0) return [];
        const dateMap = {};
        histories.forEach(platform => {
            platform.history.forEach(day => {
                if (!dateMap[day.date]) {
                    dateMap[day.date] = { date: day.date, send: 0, paid: 0, deposit: 0, balance: 0, bf: 0, originalFormat: day.date };
                }
                dateMap[day.date].send += day.send;
                dateMap[day.date].paid += day.paid;
                dateMap[day.date].deposit += day.deposit;
                dateMap[day.date].balance += day.balance;
                dateMap[day.date].bf += day.bf;
            });
        });
        return Object.values(dateMap).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [histories]);

    const tabs = ['Global Master', ...histories.map(h => h.name)];

    // Enforce selection safety if platforms change
    useEffect(() => {
        if (!tabs.includes(activeTab)) {
            setActiveTab('Global Master');
        }
    }, [tabs, activeTab]);

    const activeData = useMemo(() => {
        if (activeTab === 'Global Master') return globalHistory;
        const target = histories.find(h => h.name === activeTab);
        return target ? target.history : [];
    }, [activeTab, globalHistory, histories]);

    // Pad activeData with missing dates for continuous chart/table display
    const paddedActiveData = useMemo(() => {
        if (!historyStartDate || !historyEndDate || !activeData) return activeData;
        
        const start = new Date(historyStartDate);
        const end = new Date(historyEndDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return activeData;

        // Generate all dates in range (descending order to match activeData)
        const dateRange = [];
        for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
            dateRange.push(d.toISOString().split('T')[0]);
        }

        const ascendingDates = [...dateRange].reverse();
        const dataMap = {};
        activeData.forEach(row => { dataMap[row.date] = row; });

        let currentBalance = 0;
        // Find the earliest available balance to carry forward
        if (activeData.length > 0) {
            currentBalance = activeData[activeData.length - 1].bf || 0; 
        }

        const ascendingPadded = [];
        ascendingDates.forEach(dateStr => {
            if (dataMap[dateStr]) {
                ascendingPadded.push(dataMap[dateStr]);
                currentBalance = dataMap[dateStr].balance;
            } else {
                ascendingPadded.push({
                    date: dateStr,
                    bf: currentBalance,
                    send: 0,
                    paid: 0,
                    deposit: 0,
                    balance: currentBalance,
                    originalFormat: dateStr
                });
            }
        });

        // Reverse back to descending for the table
        return ascendingPadded.reverse();
    }, [activeData, historyStartDate, historyEndDate]);

    // Aggregate values
    const totalDeposit = paddedActiveData.reduce((acc, row) => acc + row.deposit, 0);
    const totalSend = paddedActiveData.reduce((acc, row) => acc + row.send, 0);
    const totalPaid = paddedActiveData.reduce((acc, row) => acc + row.paid, 0);
    const endingBalance = paddedActiveData.length > 0 ? paddedActiveData[0].balance : 0;

    // Formatting Helpers
    const formatDateShort = (isoString) => {
        const parts = isoString.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return isoString;
    };

    // Chart Data Preparation - Chart needs to go forward chronologically left to right
    const chartData = useMemo(() => {
        return [...paddedActiveData].reverse().map(row => ({
            dateFormatted: formatDateShort(row.date),
            balance: row.balance || 0,
        }));
    }, [paddedActiveData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-neutral-100 p-3 rounded-lg shadow-lg">
                    <p className="text-brand-800 font-bold text-sm mb-1">{label}</p>
                    <p className="text-brand-600 font-bold text-[13px]">{formatCurrencyWithLabel(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-transparent mt-6 w-full animate-in fade-in duration-500">
            {/* Custom Range Picker */}
            {rangeType === 'Custom' && (
                <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-xl w-max shadow-sm border border-neutral-200">
                    <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg focus-within:border-brand-500 transition-all">
                        <FiCalendar className="text-neutral-400" size={12} />
                        <input
                            type="date"
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-neutral-700 outline-none"
                        />
                    </div>
                    <span className="text-neutral-400 font-bold text-[10px]">to</span>
                    <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg focus-within:border-brand-500 transition-all">
                        <FiCalendar className="text-neutral-400" size={12} />
                        <input
                            type="date"
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-neutral-700 outline-none"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            )}

            {/* ── WHITE CONTAINER CARD ── */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-sm">

                {/* Combined Controls Bar: Time Range Selector on the Left, Tabs on the Right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 mb-4 pb-2 gap-4">
                    {/* Time Range Selector */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-neutral-200 shadow-sm self-start sm:self-auto">
                        {['Last 7 Days', '30 Days', 'All Time', 'Custom'].map(range => (
                            <button
                                key={range}
                                onClick={() => setRangeType(range)}
                                className={`px-2 py-1 rounded text-[9px] font-bold uppercase  transition-all cursor-pointer ${rangeType === range
                                    ? 'bg-white text-brand-800  border border-neutral-100 ring-1 ring-brand-100'
                                    : 'text-neutral-500 hover:text-brand-800 hover:bg-neutral-50'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-6 pl-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-[10px] font-bold uppercase whitespace-nowrap pb-2 border-b-2 transition-all relative cursor-pointer ${activeTab === tab
                                        ? 'border-brand-600 text-brand-800'
                                        : 'border-transparent text-neutral-400 hover:text-neutral-800 hover:border-neutral-300'
                                        }`}
                                >
                                    {tab === 'Global Master' && <span className="mr-1.5 opacity-80 inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-500 shadow-sm"></span>}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-40 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-100 transition-all hover:shadow-sm">
                                <p className="text-[9px] text-brand-800 font-bold uppercase tracking-wider mb-1">Total Send</p>
                                <p className="text-sm font-bold text-emerald-600">{formatCurrencyWithLabel(totalSend)}</p>
                            </div>
                            <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-100 transition-all hover:shadow-sm">
                                <p className="text-[9px] text-brand-800 font-bold uppercase tracking-wider mb-1">Total Paid</p>
                                <p className="text-sm font-bold text-rose-600">{formatCurrencyWithLabel(totalPaid)}</p>
                            </div>
                            <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-100 transition-all hover:shadow-sm">
                                <p className="text-[9px] text-brand-800 font-bold uppercase tracking-wider mb-1">Total Deposit</p>
                                <p className="text-sm font-bold text-[#1E293B]">{formatCurrencyWithLabel(totalDeposit)}</p>
                            </div>
                        </div>

                        {/* CHART SECTION */}
                        <div className="border border-neutral-100 rounded-xl p-4 mb-4 relative">
                            <p className="text-[9px] font-bold text-brand-800 uppercase tracking-widest mb-4 border-b border-dashed border-neutral-200 pb-1.5">BALANCE TREND</p>

                            {chartData.length > 0 ? (
                                <div className="h-[160px] w-full mt-2 flex items-end">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="dateFormatted"
                                                axisLine={{ stroke: '#E5E7EB', strokeDasharray: '4 4' }}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                tickFormatter={formatChartAxisTick}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 500 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="balance"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorBalance)"
                                            />
                                            {/* Horizontal zero line for context */}
                                            <line x1="0" y1="0" x2="100%" y2="0" style={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[140px] flex items-center justify-center text-xs font-medium text-neutral-400">
                                    Not enough data points available.
                                </div>
                            )}
                        </div>

                        {/* RECORDS TABLE */}
                        <div>
                            <div className="flex items-center justify-between mb-2 mt-2 px-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-800">Detailed Records</h3>
                                <p className="text-[10px] text-brand-800 font-bold">Showing {paddedActiveData.length} records</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-center border-collapse border border-neutral-200 min-w-[700px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-[9px] font-bold text-brand-800 uppercase tracking-wider border-b border-neutral-200">
                                            <th className="border border-neutral-200 px-2 py-1">DATE</th>
                                            <th className="border border-neutral-200 px-2 py-1">B/F</th>
                                            <th className="border border-neutral-200 px-2 py-1">SEND</th>
                                            <th className="border border-neutral-200 px-2 py-1">PAID</th>
                                            <th className="border border-neutral-200 px-2 py-1">DEPOSIT</th>
                                            <th className="border border-neutral-200 px-2 py-1 text-right">BALANCE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {paddedActiveData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                                    {formatDateShort(row.date)}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                                                    {formatCurrencyAmount(row.bf)}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                                                    {formatCurrencyAmount(row.send)}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                                                    {formatCurrencyAmount(row.paid)}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                                                    {row.deposit === 0 ? '-' : formatCurrencyAmount(row.deposit)}
                                                </td>
                                                <td className={`border border-neutral-200 px-2 py-0.5 text-[9px] font-black text-right ${row.balance < 0 ? 'text-rose-500' : 'text-[#1E293B]'}`}>
                                                    {formatCurrencyAmount(row.balance)}
                                                </td>
                                            </tr>
                                        ))}
                                        {paddedActiveData.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="border border-neutral-200 py-6 text-center text-[10px] font-medium text-neutral-400">
                                                    No ledger entries exist for the selected period.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default LedgerHistoryExplorer;
