import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import useSettings from '../../hooks/useSettings';
import PublicRateList from '../../components/rates/PublicRateList';

const PublicRatesPage = () => {
    const {
        globalRates,
        loading,
        error,
        loadRates,
        syncRates
    } = useSettings();

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    const handleSync = () => {
        syncRates();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center py-10 px-4 md:px-8 w-full"
        >
            <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
                
                {/* ── Left Column (Rates List) ── */}
                <div className="flex flex-col w-full">
                    {/* Page Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between w-full mb-8 gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-[#123689]">Live Exchange Rates</h1>
                            <p className="text-[14px] font-bold text-slate-500">
                                Indicative mid-market rates against LKR
                            </p>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={loading}
                            className="flex items-center gap-2 bg-[#123689] text-white px-5 py-2.5 rounded-lg border-2 border-[#123689] hover:bg-white hover:text-[#123689] transition-all font-bold text-sm shadow-md"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                            Refresh
                        </button>
                    </header>

                    {/* Main Layout (Left List) */}
                    <div className="w-full border-4 border-[#a8ccdf]">
                        <PublicRateList rates={globalRates} />
                    </div>
                </div>

                {/* ── Right Column (Explanation) ── */}
                <div className="flex flex-col w-full bg-white p-8 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#a8ccdf] mt-2 lg:mt-[5.5rem] sticky top-28">
                    <h2 className="text-2xl font-black text-[#123689] mb-6 tracking-tight border-b-2 border-[#a8ccdf] pb-4">Understanding Our Rates</h2>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-[#1d4bb7] uppercase tracking-widest">Mid-Market Standard</h3>
                            <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
                                The rates provided here are indicative mid-market rates, representing the midpoint between the global buy and sell prices of foreign currencies.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-[#1d4bb7] uppercase tracking-widest">Live Updates</h3>
                            <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
                                Our platform continuously synchronizes with global financial markets to ensure that these figures accurately reflect the current macroeconomic climate without artificial inflation.
                            </p>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-[#a8ccdf]">
                            <p className="text-slate-500 text-[12px] italic leading-relaxed">
                                Please Note: Actual transacted exchange rates available within the authenticated user dashboard may differ based on daily operational margins.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center w-full max-w-3xl">
                    {error?.message || (typeof error === 'string' ? error : 'Failed to load rates')}
                </div>
            )}
        </motion.div>
    );
};

export default PublicRatesPage;
