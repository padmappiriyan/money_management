import React, { useEffect } from 'react';
import { FiRefreshCcw, FiTrendingUp } from 'react-icons/fi';
import useSettings from '../../hooks/useSettings';
import { motion } from 'framer-motion';

const LiveRatesWidget = () => {
    const { globalRates, loading, loadRates, syncRates } = useSettings();

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    // Targeted currencies mapping based on requirements
    const exchangeData = [
        { code: 'BDT', name: 'Bangladesh', flag: 'bd' },
        { code: 'INR', name: 'India', flag: 'in' },
        { code: 'PKR', name: 'Pakistan', flag: 'pk' },
        { code: 'LKR', name: 'Sri Lanka', flag: 'lk' },
        { code: 'NPR', name: 'Nepal', flag: 'np' }
    ];

    return (
        <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden max-w-md w-full mx-auto relative group">
            {/* Header Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
            
            {/* Header */}
            <div className="relative p-8 pb-4 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live FX Feed</span>
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Market Rates</h3>
                </div>
                <button 
                    onClick={syncRates} 
                    disabled={loading}
                    className="w-12 h-12 flex items-center justify-center bg-brand-50 text-brand-600 rounded-2xl hover:bg-brand-600 hover:text-white transition-all active:scale-90 shadow-sm"
                >
                    <FiRefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="relative px-8 pb-8 space-y-3">
                {exchangeData.map((item, index) => {
                    const rateObj = globalRates.find(r => r.sourceCurrency === item.code);
                    return (
                        <motion.div 
                            key={item.code}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-3xl bg-neutral-50/50 hover:bg-white border border-transparent hover:border-brand-100 hover:shadow-lg hover:shadow-brand-500/5 transition-all group/item"
                        >
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <img 
                                        src={`https://flagcdn.com/w160/${item.flag}.png`} 
                                        alt={item.name} 
                                        className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md group-hover/item:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-neutral-100">
                                        <FiTrendingUp className="text-brand-600 w-3 h-3" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black text-neutral-800 text-lg tracking-tight -mb-1">{item.name}</h4>
                                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">1 {item.code}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-brand-600 tracking-tighter leading-none mb-1">
                                    {rateObj ? rateObj.rate.toFixed(4) : '---'}
                                </div>
                                <div className="text-[10px] font-black text-neutral-300 uppercase tracking-widest italic">LKR / Market</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="bg-neutral-50/80 px-8 py-5 text-center border-t border-neutral-100 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[11px] text-neutral-500 font-bold leading-tight max-w-[200px] mx-auto opacity-70">
                        * FX rates are indicative and subject to global volatility.
                    </p>
                    <p className="text-[9px] text-brand-500 font-black mt-2 uppercase tracking-[0.2em]">
                        Last Updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
                {/* Background Text Decor */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                    <span className="text-7xl font-black italic">MTTMS</span>
                </div>
            </div>
        </div>
    );
};

export default LiveRatesWidget;
