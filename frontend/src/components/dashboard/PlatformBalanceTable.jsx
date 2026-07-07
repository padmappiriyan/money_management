import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGlobe, FiSend, FiArrowUpRight, FiActivity, FiChevronDown, FiChevronUp,
    FiFileText, FiChevronRight, FiArrowLeft, FiX, FiArrowRight
} from 'react-icons/fi';
import CompactTransactionEntry from '../transactions/CompactTransactionEntry';

const PlatformBalanceTable = ({ platforms, loading, isClosed }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlatformId, setSelectedPlatformId] = useState(null);
    const [isInitiating, setIsInitiating] = useState(false);

    const selectedPlatform = platforms.find(p => (p.platformId || p.id) === selectedPlatformId);

    if (loading && platforms.length === 0) {
        return (
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-center min-h-[120px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    // Helper to get stylized icon and color scheme based on platform name
    const getPlatformStyle = (name = '') => {
        const platform = name.toUpperCase();
        if (platform.includes('WESTERN UNION')) {
            return {
                icon: <FiGlobe />,
                bg: 'bg-[#FFF9E6]',
                text: 'text-[#D97706]',
                displayName: 'Western Union'
            };
        }
        if (platform.includes('MONEYGRAM')) {
            return {
                icon: <FiSend />,
                bg: 'bg-[#FFF1F2]',
                text: 'text-[#E11D48]',
                displayName: 'Moneygram'
            };
        }
        if (platform.includes('RIA')) {
            return {
                icon: <FiArrowUpRight />,
                bg: 'bg-[#FFF7ED]',
                text: 'text-[#EA580C]',
                displayName: 'Ria'
            };
        }
        return {
            icon: <FiActivity />,
            bg: 'bg-brand-50',
            text: 'text-brand-600',
            displayName: name
        };
    };

    const handleBackToPlatforms = () => {
        setIsInitiating(false);
        setSelectedPlatformId(null);
    };

    const handleBackToLedger = () => {
        setIsInitiating(false);
    };

    const handleClose = () => {
        setIsInitiating(false);
        setSelectedPlatformId(null);
        setIsModalOpen(false);
    };

    return (
        <div className="w-full">
            {/* ── Horizontal Selector Bar (Image 02) ── */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                        <FiFileText size={22} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-base font-bold text-slate-800 tracking-tight">Platform Finances</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">
                            View daily ledgers and initiate transactions for specific platforms.
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-2xl font-bold text-xs uppercase  flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                >
                    Select Platform <FiChevronRight size={14} />
                </button>
            </div>

            {/* ── Multi-Step Modals (Image 03 & 04 & Form View) ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-100/50"
                        >
                            {!selectedPlatform ? (
                                /* ── Step 1: Manage Platform Finances (Image 03) ── */
                                <div className="p-6 md:p-8 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Manage Platform Finances</h3>
                                        <button
                                            onClick={handleClose}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>

                                    <p className="text-slate-400 text-xs font-medium -mt-2 leading-relaxed">
                                        Select a platform below to view its daily ledger and initiate transactions.
                                    </p>

                                    <div className="flex flex-col gap-3 mt-2">
                                        {platforms.map((platform) => {
                                            const style = getPlatformStyle(platform.name);
                                            return (
                                                <button
                                                    key={platform.platformId || platform.id}
                                                    onClick={() => setSelectedPlatformId(platform.platformId || platform.id)}
                                                    className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-brand-500 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl ${style.bg} ${style.text} flex items-center justify-center text-base shadow-sm transition-transform group-hover:scale-105`}>
                                                            {style.icon}
                                                        </div>
                                                        <span className="font-bold text-slate-800">{style.displayName}</span>
                                                    </div>
                                                    <FiChevronRight className="text-slate-400 group-hover:text-brand-500 transition-colors" size={16} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : !isInitiating ? (
                                /* ── Step 2: Platform Details (Image 04) ── */
                                <div className="p-6 md:p-8 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Platform Details</h3>
                                        <button
                                            onClick={handleClose}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>

                                    <div className="-mt-2">
                                        <button
                                            onClick={handleBackToPlatforms}
                                            className="flex items-center gap-2 text-[12px]  text-slate-400 hover:text-brand-600 transition-colors cursor-pointer"
                                        >
                                            <FiArrowLeft size={14} /> Back to platforms
                                        </button>
                                    </div>

                                    {(() => {
                                        const platform = selectedPlatform;
                                        const style = getPlatformStyle(platform.name);

                                        return (
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg relative flex flex-col gap-4">
                                                {/* Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center text-lg shadow-sm`}>
                                                            {style.icon}
                                                        </div>
                                                        <h4 className="text-base font-black text-slate-800 tracking-tight">{style.displayName}</h4>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest border border-neutral-100 px-3 py-0.5 rounded-full">
                                                        Ledger
                                                    </span>
                                                </div>

                                                {/* Ledger Rows */}
                                                <div className="space-y-2.5 px-1 py-2">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs font-bold text-slate-400">Brought Fwd</p>
                                                        <p className="text-sm font-black text-slate-800">
                                                            {platform.openingBalanceLkr?.toLocaleString() || '0'}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs font-bold text-slate-400">Send</p>
                                                        <p className="text-sm font-black text-emerald-500">
                                                            + {platform.todaySendLkr?.toLocaleString() || '0'}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs font-bold text-slate-400">Paid</p>
                                                        <p className="text-sm font-black text-indigo-500">
                                                            - {platform.todayPaidLkr?.toLocaleString() || '0'}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs font-bold text-slate-400">Deposit</p>
                                                        <p className="text-sm font-black text-rose-500">
                                                            - {platform.todayDepositLkr?.toLocaleString() || '0'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Divider and Balance */}
                                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Balance</p>
                                                    <p className="text-base font-black text-slate-800">
                                                        <span className="text-xs font-bold mr-1 text-slate-400">EUR (€)</span>
                                                        {platform.currentBalanceLkr?.toLocaleString() || '0'}
                                                    </p>
                                                </div>

                                                {/* Action Button */}
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => setIsInitiating(true)}
                                                        className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 font-black uppercase text-xs tracking-widest cursor-pointer bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20"
                                                    >
                                                        <span>{isClosed ? 'View Ledger' : `Initiate via ${style.displayName}`}</span>
                                                        <FiArrowRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                /* ── Step 3: Initiate Transaction (Clean Non-Stretched Form View) ── */
                                <div className="p-6 md:p-8 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Initiate Transaction</h3>
                                        <button
                                            onClick={handleClose}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>

                                    <div className="-mt-2">
                                        <button
                                            onClick={handleBackToLedger}
                                            className="flex items-center gap-2 text-[12px] text-slate-400 hover:text-brand-600 transition-colors  cursor-pointer"
                                        >
                                            <FiArrowLeft size={14} /> Back to ledger
                                        </button>
                                    </div>

                                    {(() => {
                                        const platform = selectedPlatform;
                                        const style = getPlatformStyle(platform.name);

                                        return (
                                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg relative flex flex-col gap-4">
                                                {/* Header */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`w-8 h-8 rounded-xl ${style.bg} ${style.text} flex items-center justify-center text-sm shadow-sm`}>
                                                        {style.icon}
                                                    </div>
                                                    <span className="text-[12px]  text-slate-400 ">
                                                        New {style.displayName} Entry
                                                    </span>
                                                </div>

                                                {/* Compact Form */}
                                                <CompactTransactionEntry
                                                    initialPlatform={platform.slug}
                                                    onComplete={() => setIsInitiating(false)}
                                                    isClosed={isClosed}
                                                />

                                                {/* Back/Cancel CTA */}
                                                <button
                                                    onClick={handleBackToLedger}
                                                    className="w-full py-3.5 mt-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlatformBalanceTable;
