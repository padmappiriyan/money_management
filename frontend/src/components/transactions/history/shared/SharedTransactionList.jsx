import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMoreHorizontal, FiEye, FiCheckCircle, FiEdit3, FiDownload, FiClock, FiXCircle, FiList } from 'react-icons/fi';

const SharedTransactionList = ({ 
    transactions = [], 
    loading = false, 
    timeRange = 'all', 
    setTimeRange,
    onViewDetail,
    isAdmin = false,
    onExport,
    isExporting
}) => {
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState(null);

    const TABS = [
        { id: 'all', label: 'All' },
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'week', label: 'Last Week' },
        { id: 'month', label: 'Last Month' },
        { id: 'year', label: 'Last Year' }
    ];

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    const formatId = (id = '') => {
        if (!id) return '';
        const str = `0x${id.toString()}`;
        if (str.length <= 20) return str;
        return `${str.substring(0, 12)}...${str.substring(str.length - 12)}`;
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return { bg: 'bg-emerald-100/50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active', icon: <FiCheckCircle size={10} /> };
            case 'pending_change':
                return { bg: 'bg-amber-100/50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending', icon: <FiClock size={10} /> };
            case 'deleted':
                return { bg: 'bg-rose-100/50', text: 'text-rose-700', border: 'border-rose-200', label: 'Deleted', icon: <FiXCircle size={10} /> };
            default:
                return { bg: 'bg-slate-100/50', text: 'text-slate-700', border: 'border-slate-200', label: status || 'Unknown', icon: <FiCheckCircle size={10} /> };
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all w-full h-full">
            {/* Header section */}
            <div className="px-6 py-5 border-b border-slate-200/60 flex items-center justify-between bg-white">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Transactions History</h2>
                <div className="flex items-center gap-3">
                    {onExport && (
                        <button
                            onClick={onExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-900 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-brand-600 hover:border-brand-600 transition-all shadow-sm disabled:opacity-50"
                        >
                            <FiDownload size={14} /> {isExporting ? 'Preparing...' : 'Export CSV'}
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-4 bg-slate-50/30 border-b border-slate-200/60 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeRange(tab.id)}
                            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap shadow-sm border
                                ${timeRange === tab.id 
                                    ? 'bg-white text-brand-600 border-slate-200 shadow-sm ring-1 ring-brand-500/10' 
                                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto custom-scrollbar flex-1 relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <FiClock size={24} className="text-brand-500 animate-spin" />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Loading Records...</span>
                        </div>
                    </div>
                )}
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/60 text-left">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Transaction ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Date & Time</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Platform</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Type & Amount</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <AnimatePresence mode="popLayout">
                            {transactions.map((tx, idx) => {
                                const st = getStatusStyle(tx.status);
                                return (
                                <motion.tr
                                    key={tx.id || tx._id}
                                    layout
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="group transition-all duration-200 hover:bg-brand-50/30 hover:shadow-[inset_4px_0_0_0_#4f46e5] cursor-pointer"
                                    onClick={() => onViewDetail(tx)}
                                >
                                    <td className="px-6 py-4 font-bold text-slate-800 text-[13px] tracking-tight whitespace-nowrap">
                                        {formatId(tx.id || tx._id)}
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[12px] font-semibold text-slate-600 tracking-tight bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 tabular-nums">
                                            {formatDate(tx.createdAt)}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-[12px] font-bold text-slate-800">
                                            {(tx.platform || 'System').toUpperCase()}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 flex justify-center whitespace-nowrap items-center h-full pt-5">
                                        <span className={`px-2.5 py-1 rounded-full ${st.bg} ${st.text} ${st.border} border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm`}>
                                            {st.icon} {st.label}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                                                {tx.type || 'Transaction'}
                                            </span>
                                            <span className={`text-[14px] font-black tabular-nums ${tx.type?.toLowerCase() === 'receive' ? 'text-emerald-600' : 'text-brand-600'}`}>
                                                € {Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                        <div className="flex items-center justify-end">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === (tx.id || tx._id) ? null : (tx.id || tx._id));
                                                }}
                                                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-all shadow-sm"
                                            >
                                                <FiMoreHorizontal size={16} />
                                            </button>
                                            
                                            {openMenuId === (tx.id || tx._id) && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} />
                                                    <div className="absolute right-6 top-10 mt-1 w-44 bg-white rounded-xl border border-slate-100 shadow-xl z-20 py-1.5 overflow-hidden" onClick={e => e.stopPropagation()}>
                                                        <button 
                                                            onClick={() => { onViewDetail(tx); setOpenMenuId(null); }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                                                        >
                                                            <FiEye size={14} /> View Details
                                                        </button>
                                                        {!isAdmin && (tx.status === 'active' || !tx.status) && (
                                                            <button 
                                                                onClick={() => { navigate(`/dashboard/transactions/${tx.id || tx._id}/change-request`); setOpenMenuId(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                            >
                                                                <FiEdit3 size={14} /> Request Change
                                                            </button>
                                                        )}
                                                        {isAdmin && (
                                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-brand-600 hover:bg-brand-50 transition-colors">
                                                                <FiCheckCircle size={14} /> Action Record
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                        
                        {transactions.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6">
                                    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner">
                                            <FiList size={26} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">No Transactions</h3>
                                        <p className="text-xs font-medium text-slate-500 text-center max-w-sm">No transaction records found for the selected timeframe.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SharedTransactionList;
