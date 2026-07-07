import React, { useState, useEffect } from 'react';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
    addMonths,
    subMonths
} from 'date-fns';
import { fetchReconciliationHistory } from '../../../api/ledgerApi';

const UserReconciliationHistory = ({ userId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                const apiUserId = (userId === 'ALL_USERS_SPECIAL_ID') ? null : userId;
                const data = await fetchReconciliationHistory(apiUserId);
                setHistory(data || []);
            } catch (error) {
                console.error("Failed to fetch user reconciliation history:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [userId]);

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '-';
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Group history by date string 'yyyy-MM-dd' for quick day-by-day matching
    const historyMap = React.useMemo(() => {
        const map = {};
        history.forEach(record => {
            if (record.date) {
                const dateStr = format(new Date(record.date), 'yyyy-MM-dd');
                map[dateStr] = record;
            }
        });
        return map;
    }, [history]);

    // Generate all days for the selected month
    const daysOfMonth = React.useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(selectedMonth),
            end: endOfMonth(selectedMonth)
        });
    }, [selectedMonth]);

    return (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in duration-500 mt-4 mb-4">
            {/* Header with Month Navigator */}
            <div className="bg-slate-50 px-3 py-1.5 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                    Past Reconciliation Records
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedMonth(prev => subMonths(prev, 1))}
                        className="px-1.5 py-0.5 hover:bg-neutral-200 rounded text-slate-600 transition-colors text-[9px] font-black cursor-pointer border border-neutral-300"
                    >
                        &lt;
                    </button>
                    <span className="text-[10px] font-bold text-brand-800 min-w-22.5 text-center">
                        {format(selectedMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        type="button"
                        onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}
                        className="px-1.5 py-0.5 hover:bg-neutral-200 rounded text-slate-600 transition-colors text-[9px] font-black cursor-pointer border border-neutral-300"
                    >
                        &gt;
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center space-y-2">
                        <div className="w-5 h-5 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium text-[10px]">Loading records...</p>
                    </div>
                ) : (
                    <table className="w-full text-center border-collapse border border-neutral-200">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr className="bg-slate-50 text-[9px] font-bold text-brand-800 uppercase tracking-wider border-b border-neutral-200">
                                <th className="border border-neutral-200 px-2 py-1">Date</th>
                                <th className="border border-neutral-200 px-2 py-1">Total Amount</th>
                                <th className="border border-neutral-200 px-2 py-1">Cash</th>
                                <th className="border border-neutral-200 px-2 py-1">C/B</th>
                                <th className="border border-neutral-200 px-2 py-1">Deposit</th>
                                <th className="border border-neutral-200 px-2 py-1">Credit</th>
                                <th className="border border-neutral-200 px-2 py-1 text-right">Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daysOfMonth.map((day) => {
                                const dateKey = format(day, 'yyyy-MM-dd');
                                const record = historyMap[dateKey];

                                if (record) {
                                    const rowBalance = ((record.actualClosing || 0) + (record.depositAmount || 0) - (record.creditAmount || 0));
                                    const totalTransactionNet = record.totalTransactionNet || 0;
                                    const rowDiff = Math.abs(rowBalance - totalTransactionNet) > 0.01;

                                    return (
                                        <tr key={dateKey} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                                {format(day, 'dd/MM/yyyy')}
                                            </td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-bold text-slate-900">
                                                {formatCurrency(totalTransactionNet)}
                                            </td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                                                {formatCurrency(record.actualClosing)}
                                            </td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                                                {formatCurrency(record.cbAmount)}
                                            </td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
                                                -{formatCurrency(record.depositAmount)}
                                            </td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-rose-600">
                                                -{formatCurrency(record.creditAmount)}
                                            </td>
                                            <td className={`border border-neutral-200 px-2 py-0.5 text-[9px] font-black text-right ${rowDiff ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {formatCurrency(rowBalance - totalTransactionNet)}
                                            </td>
                                        </tr>
                                    );
                                } else {
                                    return (
                                        <tr key={dateKey} className="hover:bg-slate-50/50 transition-colors opacity-60">
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] font-medium text-slate-400">
                                                {format(day, 'dd/MM/yyyy')}
                                            </td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] text-slate-400">-</td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] text-slate-400">-</td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] text-slate-400">-</td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] text-slate-400">-</td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] text-slate-400">-</td>
                                            <td className="border border-neutral-200 px-2 py-0.5 text-[9px] text-slate-400 text-right">-</td>
                                        </tr>
                                    );
                                }
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserReconciliationHistory;
