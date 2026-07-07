import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, User, Shield, Briefcase, Mail } from 'lucide-react';
import UserDetailModal from './UserDetailModal';

const UserLedgerTable = ({ data, loading, pagination, onRefresh, onPageChange, embedded = false }) => {
    const { totalRecords = 0, totalPages = 1, currentPage = 1 } = pagination || {};
    const [selectedUser, setSelectedUser] = useState(null);

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return <Shield size={14} className="text-brand-600" />;
            case 'supervisor': return <Briefcase size={14} className="text-indigo-600" />;
            default: return <User size={14} className="text-slate-500" />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'Admin';
            case 'supervisor': return 'Supervisor';
            case 'user': return 'User';
            default: return role || 'User';
        }
    };

    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    const getStatusStyles = (status) => {
        if (status?.toLowerCase() === 'active') {
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
        return 'bg-slate-50 text-slate-400 border-slate-100';
    };

    return (
        <div className={embedded ? "border-t border-neutral-100" : "bg-white rounded-4xl shadow-sm border border-neutral-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700"}>
            {/* Table Header */}
            {!embedded && (
                <div className="p-8 flex items-center justify-between border-b border-neutral-50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">User Account Records</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Individual performance per platform agent</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100 hidden md:block">
                            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Total Records: </span>
                            <span className="text-xs font-black text-brand-600">{totalRecords}</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-100 hover:bg-neutral-50 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all active:scale-95 shadow-sm"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
                        </button>
                    </div>
                </div>
            )}

            {/* Table Content with Scrollbar */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                <table className="w-full text-[11px] border-collapse border border-neutral-200 bg-white">
                    <thead className="sticky top-0 z-20 bg-slate-50/80 border-b border-neutral-200">
                        <tr className="text-[10px] font-black uppercase tracking-wider text-brand-700">
                            <th className="border border-neutral-200 px-3 py-2 text-left">User Details</th>
                            <th className="border border-neutral-200 px-3 py-2 text-right">Brought Forward</th>
                            <th className="border border-neutral-200 px-3 py-2 text-right">Total Send</th>
                            <th className="border border-neutral-200 px-3 py-2 text-right">Total Paid</th>
                            <th className="border border-neutral-200 px-3 py-2 text-right">Total Deposit</th>
                            <th className="border border-neutral-200 px-3 py-2 text-right">Net Balance</th>
                            <th className="border border-neutral-200 px-3 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-bold text-neutral-400 animate-pulse">Syncing user Details...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-8 py-20 text-center text-neutral-400 font-medium ">
                                    No user records found matching the current filters.
                                </td>
                            </tr>
                        ) : (
                            data.map((user, idx) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedUser(user)}
                                    className="hover:bg-brand-50/50 transition-all duration-200 group cursor-pointer"
                                >
                                    <td className="border border-neutral-200 px-3 py-1.5">
                                        <div className="flex items-center">
                                            <span className="text-[11px] font-bold text-brand-700 flex items-center gap-1.5">
                                                <Mail size={12} className="text-slate-400" /> {user.email || 'No email'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="border border-neutral-200 px-3 py-1.5 text-right font-medium text-brand-900 tabular-nums">
                                        {formatCurrency(user.broughtFwd)}
                                    </td>
                                    <td className="border border-neutral-200 px-3 py-1.5 text-right font-medium text-rose-700 tabular-nums">
                                        {user.totalSend > 0 ? `+${formatCurrency(user.totalSend)}` : '0'}
                                    </td>
                                    <td className="border border-neutral-200 px-3 py-1.5 text-right font-medium text-indigo-700 tabular-nums">
                                        {user.totalPaid > 0 ? `-${formatCurrency(user.totalPaid)}` : '0'}
                                    </td>
                                    <td className="border border-neutral-200 px-3 py-1.5 text-right font-medium text-emerald-700 tabular-nums">
                                        {user.totalDeposit > 0 ? `-${formatCurrency(user.totalDeposit)}` : '0'}
                                    </td>
                                    <td className="border border-neutral-200 px-3 py-1.5 text-right font-black text-brand-900 tabular-nums">
                                        {formatCurrency(user.netBalance)}
                                    </td>
                                    <td className="border border-neutral-200 px-3 py-1.5 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusStyles(user.status)}`}>
                                            • {user.status || 'OFFLINE'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Footer */}
            <div className="px-8 py-4 bg-neutral-50/50 border-t border-neutral-100">
                <p className="text-[12px] text-neutral-400 font-bold">
                    Showing <span className="text-brand-900">{data.length}</span> active records
                </p>
            </div>

            {/* User Detail Modal */}
            <UserDetailModal 
                isOpen={!!selectedUser} 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
            />
        </div>
    );
};

export default UserLedgerTable;
