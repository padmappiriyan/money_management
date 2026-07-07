import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowUpRight, FiArrowDownLeft, FiMoreHorizontal,
    FiShield, FiTrendingUp, FiCheckCircle
} from 'react-icons/fi';

// Helper to get currency specific icons or colors
const getCurrencyColor = (symbol) => {
    switch (symbol.toUpperCase()) {
        case 'USD': return 'bg-blue-500';
        case 'EUR': return 'bg-indigo-500';
        case 'GBP': return 'bg-purple-500';
        case 'LKR': return 'bg-emerald-500';
        default: return 'bg-neutral-500';
    }
};

const TransactionSummaryCard = React.memo(({ stats, loading }) => {
    const [activeTab, setActiveTab] = useState('all'); // all, send, receive

    const { summary, breakdown } = stats;

    const filteredBreakdown = breakdown.map(curr => {
        const relevantTypes = curr.types.filter(t => activeTab === 'all' || t.type === activeTab);
        const totalLkr = relevantTypes.reduce((acc, t) => acc + (t.totalLkr || 0), 0);
        const totalOriginal = relevantTypes.reduce((acc, t) => acc + (t.totalOriginal || 0), 0);

        return {
            symbol: curr._id,
            totalLkr,
            totalOriginal,
            exists: relevantTypes.length > 0
        };
    }).filter(item => item.exists);

    // Get big main value for the header based on tab
    const mainAmount = activeTab === 'send' ? summary.sendAmount :
        activeTab === 'receive' ? summary.receiveAmount :
            summary.totalVolume;

    return (
        <div className={`bg-white rounded-[1.5rem] p-6 lg:p-8 border border-neutral-100 shadow-sm relative overflow-hidden group h-full flex flex-col transition-all duration-300 ${loading ? 'opacity-80' : 'opacity-100'}`}>
            {/* Subtle Gradient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/30 blur-[100px] rounded-full -z-10 transition-all duration-1000 group-hover:bg-brand-100/40" />

            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-tight text-brand-400">Activity Summary</span>
                    <FiShield className="text-brand-500 w-2.5 h-2.5" />
                    {loading && <div className="ml-2 w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                <button className="p-1.5 hover:bg-neutral-50 rounded-full transition-colors">
                    <FiMoreHorizontal className="text-neutral-400 w-4 h-4" />
                </button>
            </div>

            {/* Main Balance Display */}
            <div className="text-center mb-6">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-0.5"
                >
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                        <h2 className="text-xl font-black text-neutral-900 tracking-tighter tabular-nums leading-none">
                            {mainAmount.toLocaleString()}
                        </h2>
                        <span className="text-2xl font-black text-brand-600 leading-none">EUR (€)</span>
                    </div>
                </motion.div>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-50 border border-neutral-100 rounded-full">
                        <FiCheckCircle className="text-brand-500 w-2.5 h-2.5" />
                        <span className="text-[8px] font-bold text-neutral-400 tracking-tight uppercase leading-none">
                            Aggregated Node
                        </span>
                    </div>
                </div>
            </div>

            {/* View Selectors (SEND / PAID) */}
            <div className="flex gap-3 mb-5">
                {['send', 'receive'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(activeTab === type ? 'all' : type)}
                        className={`flex-1 py-2 px-3 rounded-3xl flex items-center justify-center gap-2 transition-all duration-300 font-bold text-[11px] tracking-tight
                            ${activeTab === type
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-100'
                                : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-100'
                            }`}
                    >
                        {type === 'send' ? <FiArrowUpRight size={14} /> : <FiArrowDownLeft size={14} />}
                        <span className="capitalize">{type === 'receive' ? 'Paid' : type}</span>
                    </button>
                ))}
            </div>

            {/* Currency Breakdown List */}
            <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredBreakdown.map((item) => (
                        <motion.div
                            layout
                            key={item.symbol}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group/row flex items-center justify-between p-4 rounded-3xl bg-neutral-50/50 border border-transparent hover:border-neutral-200 hover:bg-white hover:shadow-sm transition-all duration-300"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${getCurrencyColor(item.symbol)} flex items-center justify-center text-white font-black text-sm shadow-md transition-transform duration-500 group-hover/row:scale-110`}>
                                    {item.symbol[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 leading-none mb-1">{item.symbol}</h4>
                                    <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 leading-none uppercase tracking-tight">
                                        <FiTrendingUp className="w-1.5 h-1.5" /> Live Processed
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-neutral-900 tabular-nums leading-none mb-1.5">
                                    {item.totalOriginal.toLocaleString()} {item.symbol}
                                </p>
                                <p className="text-[10px] font-bold text-neutral-400 tabular-nums leading-none tracking-tight">
                                    ≈ EUR (€) {item.totalLkr.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {filteredBreakdown.length === 0 && !loading && (
                        <div className="py-10 text-center">
                            <p className="text-sm font-bold text-neutral-300 uppercase tracking-widest">No activity found</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

export default TransactionSummaryCard;
