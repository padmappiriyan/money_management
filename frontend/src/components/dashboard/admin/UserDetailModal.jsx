import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, Briefcase, User, Calendar, Activity } from 'lucide-react';

const UserDetailModal = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return <Shield size={16} className="text-brand-600" />;
            case 'supervisor': return <Briefcase size={16} className="text-indigo-600" />;
            default: return <User size={16} className="text-slate-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl z-[101] overflow-hidden border border-neutral-100"
                    >
                        {/* Header Section */}
                        <div className="relative p-8 overflow-hidden bg-gradient-to-br from-neutral-50 to-white border-b border-neutral-100">
                            {/* Background Pattern */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-60"></div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-400 hover:text-slate-900 hover:bg-neutral-100 transition-colors shadow-sm border border-neutral-100 z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 flex items-center justify-center text-brand-600 font-bold text-3xl shadow-inner border border-brand-100/50">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-2xl font-medium text-slate-900 tracking-tight">{user.name}</h2>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
                                            <Mail size={14} className="text-neutral-400" />
                                            {user.email || 'No email provided'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 capitalize ml-2">
                                            {getRoleIcon(user.role)}
                                            {user.role || 'User'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${user.status?.toLowerCase() === 'active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                            {user.status || 'OFFLINE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 bg-white">
                            <h3 className="text-[14px] font-medium    mb-6 flex items-center gap-2">
                                <Activity size={14} /> Financial Performance
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Brought Forward */}
                                <div className="p-5 rounded-2xl bg-neutral-50/50 border border-neutral-100 transition-all hover:bg-neutral-50">
                                    <span className="text-[11px] font-medium text-neutral-400 uppercase  block mb-1">Brought Forward</span>
                                    <span className="text-[14px] font-medium text-slate-700">{formatCurrency(user.broughtFwd)} <span className="text-sm font-medium text-neutral-400 ml-1">EUR (€)</span></span>
                                </div>

                                {/* Net Balance */}
                                <div className="p-5 rounded-2xl bg-brand-50/30 border border-brand-100/50 transition-all hover:bg-brand-50/50">
                                    <span className="text-[11px] font-medium text-brand-500 uppercase  block mb-1">Net Balance</span>
                                    <span className="text-[14px] font-medium text-brand-600">{formatCurrency(user.netBalance)} <span className="text-sm font-medium text-brand-400 ml-1">EUR (€)</span></span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mt-6">
                                {/* Total Deposit */}
                                <div className="p-5 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                                    <span className="text-[10px] font-medium text-emerald-500 uppercase  block mb-1">Total Deposit</span>
                                    <span className="text-[14px] font-medium text-emerald-600">-{formatCurrency(user.totalDeposit)}</span>
                                </div>

                                {/* Total Send */}
                                <div className="p-5 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                                    <span className="text-[10px] font-medium text-rose-500 uppercase  block mb-1">Total Send</span>
                                    <span className="text-[14px] font-medium text-rose-600">{user.totalSend > 0 ? `+${formatCurrency(user.totalSend)}` : '0'}</span>
                                </div>

                                {/* Total Paid */}
                                <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                                    <span className="text-[10px] font-medium text-indigo-500 uppercase  block mb-1">Total Paid</span>
                                    <span className="text-[14px] font-medium text-indigo-600">{user.totalPaid > 0 ? `-${formatCurrency(user.totalPaid)}` : '0'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="px-8 py-5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400">
                                <Calendar size={12} />
                                Last Updated: {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'Never'}
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-brand-600 text-white text-[11px] font-medium cursor-pointer uppercase rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UserDetailModal;
