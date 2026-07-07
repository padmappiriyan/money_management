import React, { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiActivity } from 'react-icons/fi';
import { fetchUserPerformanceHistory } from '../../../api/reportsApi';
import toast from 'react-hot-toast';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    formatCurrencyAmount,
    formatCurrencyWithLabel,
    formatChartAxisTick,
} from '../../../utils/currency';

const UserLedgerExplorer = ({ userId }) => {
    const [rangeType, setRangeType] = useState('Last 7 Days');
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');

    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Global Master');

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
        if (!userId) return;
        if (rangeType === 'Custom' && (!historyStartDate || !historyEndDate)) return;

        const loadHistory = async () => {
            try {
                setLoading(true);
                const params = {};
                if (historyStartDate) params.startDate = historyStartDate;
                if (historyEndDate) params.endDate = historyEndDate;
                const data = await fetchUserPerformanceHistory(userId, params);
                setHistories(data);
            } catch (error) {
                console.error("Failed to fetch user performance history:", error);
                toast.error("Failed to load user ledger history.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [userId, rangeType, historyStartDate, historyEndDate]);

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

    const totalDeposit = activeData.reduce((acc, row) => acc + row.deposit, 0);
    const totalSend = activeData.reduce((acc, row) => acc + row.send, 0);
    const totalPaid = activeData.reduce((acc, row) => acc + row.paid, 0);
    const endingBalance = activeData.length > 0 ? activeData[0].balance : 0;

    const formatDateShort = (isoString) => {
        const parts = isoString.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return isoString;
    };

    const chartData = useMemo(() => {
        return [...activeData].reverse().map(row => ({
            dateFormatted: formatDateShort(row.date),
            balance: row.balance || 0,
        }));
    }, [activeData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-neutral-100 p-3 rounded-lg shadow-lg">
                    <p className="text-[#1E293B] font-bold text-sm mb-1">{label}</p>
                    <p className="text-brand-600 font-bold text-[13px]">{formatCurrencyWithLabel(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-transparent w-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[22px] font-black text-[#1E293B] flex items-center gap-2">
                        <FiActivity className="text-brand-600" /> Ledger History Explorer
                    </h2>
                    <p className="text-[13px] text-neutral-500 font-medium">Analyze user historical performance across all platforms.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-[12px] border border-neutral-200 shadow-sm self-start md:self-auto">
                    {['Last 7 Days', '30 Days', 'All Time', 'Custom'].map(range => (
                        <button
                            key={range}
                            onClick={() => setRangeType(range)}
                            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all ${rangeType === range
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {rangeType === 'Custom' && (
                <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl w-max shadow-sm border border-neutral-200">
                    <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl">
                        <FiCalendar className="text-neutral-400" />
                        <input
                            type="date"
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-neutral-700 outline-none w-full"
                        />
                    </div>
                    <span className="text-neutral-400 font-medium text-sm">to</span>
                    <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl">
                        <FiCalendar className="text-neutral-400" />
                        <input
                            type="date"
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-neutral-700 outline-none w-full"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm">
                <div className="flex overflow-x-auto no-scrollbar border-b border-neutral-100 mb-8 pb-1">
                    <div className="flex items-center gap-8 pl-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[14px] font-bold tracking-wide whitespace-nowrap pb-4 border-b-2 transition-all relative ${activeTab === tab
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                                    }`}
                            >
                                {tab === 'Global Master' && <span className="mr-2 inline-block w-2.5 h-2.5 rounded-full bg-indigo-500"></span>}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="h-60 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium text-xs">Fetching ledger history...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-neutral-50/50 p-6 rounded-[24px] border border-neutral-100 transition-all">
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Total Send</p>
                                <p className="text-2xl font-black text-slate-900">{formatCurrencyWithLabel(totalSend)}</p>
                            </div>
                            <div className="bg-neutral-50/50 p-6 rounded-[24px] border border-neutral-100 transition-all">
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Total Paid</p>
                                <p className="text-2xl font-black text-slate-900">{formatCurrencyWithLabel(totalPaid)}</p>
                            </div>
                            <div className="bg-neutral-50/50 p-6 rounded-[24px] border border-neutral-100 transition-all">
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Total Deposit</p>
                                <p className="text-2xl font-black text-slate-900">{formatCurrencyWithLabel(totalDeposit)}</p>
                            </div>
                            <div className="bg-neutral-50/50 p-6 rounded-[24px] border border-neutral-100 transition-all">
                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-2">Total Balance</p>
                                <p className="text-2xl font-black text-slate-900">{formatCurrencyWithLabel(endingBalance)}</p>
                            </div>
                        </div>

                        <div className="border border-neutral-50 rounded-[24px] p-8 mb-8 relative bg-neutral-50/10">
                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em] mb-8">Balance Trend</p>

                            {chartData.length > 0 ? (
                                <div className="h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="dateFormatted"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                tickFormatter={formatChartAxisTick}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="balance"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorBalance)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[160px] flex items-center justify-center text-sm font-medium text-neutral-400">
                                    Not enough data points available.
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-sm font-bold text-slate-800">Detailed Records</h3>
                                <div className="px-3 py-1 bg-neutral-100 rounded-full text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                    {activeData.length} Records
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-center border-collapse border border-neutral-200">
                                    <thead>
                                        <tr className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-neutral-200">
                                            <th className="border border-neutral-200 px-2 py-1">Date</th>
                                            <th className="border border-neutral-200 px-2 py-1">B/F</th>
                                            <th className="border border-neutral-200 px-2 py-1">Send</th>
                                            <th className="border border-neutral-200 px-2 py-1">Paid</th>
                                            <th className="border border-neutral-200 px-2 py-1">Deposit</th>
                                            <th className="border border-neutral-200 px-2 py-1 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {activeData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                                    {formatDateShort(row.date)}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-500">
                                                    {formatCurrencyAmount(row.bf)}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-rose-500">
                                                    {row.send > 0 ? `+${formatCurrencyAmount(row.send)}` : '0'}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-blue-500">
                                                    {row.paid > 0 ? `-${formatCurrencyAmount(row.paid)}` : '0'}
                                                </td>
                                                <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                                                    {row.deposit > 0 ? `-${formatCurrencyAmount(row.deposit)}` : '0'}
                                                </td>
                                                <td className={`border border-neutral-200 px-2 py-0.5 text-[9px] font-black text-right ${row.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                    {formatCurrencyAmount(row.balance)}
                                                </td>
                                            </tr>
                                        ))}
                                        {activeData.length === 0 && (
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

export default UserLedgerExplorer;
