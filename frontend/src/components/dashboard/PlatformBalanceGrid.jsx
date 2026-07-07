import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTrendingDown, FiPlusCircle, FiGlobe, FiSend,
    FiArrowUpRight, FiMoreVertical, FiActivity, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import TransactionEntry from '../transactions/TransactionEntry';

const PlatformBalanceGrid = ({ platforms, loading }) => {
    const [expandedPlatformId, setExpandedPlatformId] = useState(null);

    if (loading && platforms.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
                ))}
            </div>
        );
    }

    // Helper to get stylized icon based on platform name
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
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            displayName: name
        };
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((platform) => {
                const style = getPlatformStyle(platform.name);

                return (
                    <motion.div
                        key={platform.platformId || platform.id}
                        layout
                        className={`bg-white rounded-[1.5rem] p-5 border border-neutral-100 shadow-xl flex flex-col justify-between group relative overflow-hidden transition-all hover:shadow-2xl hover:border-brand-100 ${expandedPlatformId === (platform.platformId || platform.id) ? 'md:col-span-3 ring-2 ring-brand-500' : ''}`}
                    >
                        {/* Header: Platform identity */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110`}>
                                    {style.icon}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-[#1E293B] tracking-tight">{style.displayName}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-600">Active connection</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50 rounded-full transition-colors cursor-pointer">
                                <FiMoreVertical />
                            </button>
                        </div>

                        {/* Breakdown sections - Hide when expanded to save space, or keep them? Keeping them but maybe in a row if expanded? Let's keep them as is for now, but maybe flex row if expanded. */}
                        <div className={`mt-4 ${expandedPlatformId === (platform.platformId || platform.id) ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-2.5 px-1'}`}>
                            <div className="flex justify-between items-center group/row">
                                <p className="text-xs font-bold text-neutral-400 group-hover/row:text-neutral-600 transition-colors">Brought Fwd</p>
                                <p className="text-sm font-bold text-neutral-900 tracking-tight uppercase">
                                    <span className="text-[12px] text-neutral-400 mr-2">€</span>
                                    {platform.openingBalanceLkr?.toLocaleString() || '0'}
                                </p>
                            </div>

                            <div className="flex justify-between items-center group/row">
                                <p className="text-xs font-bold text-neutral-400 group-hover/row:text-neutral-600 transition-colors">Send</p>
                                <p className="text-sm font-bold text-rose-500 tracking-tight uppercase">
                                    <span className="text-[12px] text-rose-300 mr-2 group-hover/row:mr-3 transition-all ">+ €</span>
                                    {platform.todaySendLkr?.toLocaleString() || '0'}
                                </p>
                            </div>

                            <div className="flex justify-between items-center group/row">
                                <p className="text-xs font-bold text-neutral-400 group-hover/row:text-neutral-600 transition-colors">Paid</p>
                                <p className="text-sm font-bold text-brand-500 tracking-tight uppercase">
                                    <span className="text-[12px] text-brand-300 mr-2">- €</span>
                                    {platform.todayPaidLkr > 0 ? platform.todayPaidLkr?.toLocaleString() : '0'}
                                </p>
                            </div>

                            <div className="flex justify-between items-center group/row pb-1">
                                <p className="text-xs font-bold text-neutral-400 group-hover/row:text-neutral-600 transition-colors">Deposit</p>
                                <p className="text-sm font-bold text-emerald-500 tracking-tight uppercase">
                                    <span className="text-[12px] text-emerald-300 mr-2">+ €</span>
                                    {platform.todayDepositLkr?.toLocaleString() || '0'}
                                </p>
                            </div>
                        </div>

                        {/* Final Balance Recap */}
                        <div className={`mt-4 bg-[#fef7f8] px-4 py-3 rounded-xl flex justify-between items-center border border-[#F9F1E7] ${expandedPlatformId === (platform.platformId || platform.id) ? 'max-w-md' : ''}`}>
                            <p className="text-[12px] font-bold text-[#D49D66] uppercase tracking-tight">Balance</p>
                            <p className="text-lg font-bold text-[#8B4513] tracking-tight uppercase">
                                <span className="text-[12px] text-[#D49D66] mr-2">€</span>
                                {platform.currentBalanceLkr?.toLocaleString() || '0'}
                            </p>
                        </div>

                        {/* Action Button: Initiate */}
                        <div className="mt-5">
                            <button
                                onClick={() => setExpandedPlatformId(expandedPlatformId === (platform.platformId || platform.id) ? null : (platform.platformId || platform.id))}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl shadow-brand-600/30 group/btn active:scale-[0.98] cursor-pointer font-bold uppercase text-sm"
                            >
                                {expandedPlatformId === (platform.platformId || platform.id) ? (
                                    <FiChevronUp size={20} className="transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
                                ) : (
                                    <FiChevronDown size={20} className="transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                                )}
                                <span>
                                    {expandedPlatformId === (platform.platformId || platform.id) ? 'Close Form' : `Initiate via ${style.displayName}`}
                                </span>
                            </button>
                        </div>

                        {/* Expanded Form Area */}
                        <AnimatePresence>
                            {expandedPlatformId === (platform.platformId || platform.id) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-6 pt-6 border-t border-neutral-100"
                                >
                                    <TransactionEntry
                                        initialPlatform={platform.slug || platform.platformId}
                                        onComplete={() => setExpandedPlatformId(null)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                );
            })}
        </div>
    );
};

export default PlatformBalanceGrid;
