import React, { useEffect } from 'react';
import useSettings from '../../hooks/useSettings';
import LiveRatesMarquee from './LiveRatesMarquee';
import RateList from './RateList';
import { motion } from 'framer-motion';
import { FiGlobe, FiBarChart2 } from 'react-icons/fi';

const GlobalMarketsSection = () => {
    const { globalRates, loadRates } = useSettings();

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-100">
                        <FiGlobe size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase italic">Global Markets</h2>
                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-1">Real-Time Currency Intelligence Feed</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3 text-brand-600 bg-brand-50 px-5 py-2 rounded-2xl border border-brand-100 italic font-black text-xs uppercase tracking-widest">
                    <FiBarChart2 size={16} /> Live Nodes Active
                </div>
            </div>

            {/* Compact Marquee Container */}
            <div className=" overflow-hidden  shadow-sm bg-white ">
                <div className="bg-brand-900 py-1.5 px-6">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Market Pulse</span>
                </div>
                <LiveRatesMarquee />
            </div>

            {/* Multi-Column Layout for Market Details */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white/40 backdrop-blur-sm rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                    <RateList rates={globalRates} />
                </div>
            </div>
        </section>
    );
};

export default GlobalMarketsSection;
