import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useSettings from '../../hooks/useSettings';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const RateCard = ({ rate, idx }) => {
    const isEven = idx % 2 === 0;

    const pair = `${rate.sourceCurrency} / LKR`;
    const symbol = {
        'USD': 'US', 'EUR': 'EU', 'GBP': 'GB', 'BDT': 'BD',
        'INR': 'IN', 'PKR': 'PK', 'NPR': 'NP', 'LKR': 'LK'
    }[rate.sourceCurrency.toUpperCase()] || rate.sourceCurrency.substring(0, 2);

    return (
        <div className="flex-shrink-0 w-64 bg-[#eef2ff]  rounded-2xl p-5 shadow-2xl relative overflow-hidden group hover:border-brand-500/50 transition-all duration-500">
            {/* Background Glow */}
            <div className={`absolute top-0 left-0 w-1 h-full ${isEven ? 'bg-emerald-500' : 'bg-rose-500'} opacity-80`} />

            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black ">{symbol}</span>
                        <span className="text-[10px] font-bold  uppercase tracking-widest">{pair}</span>
                    </div>
                </div>
                <img
                    src={`https://flagcdn.com/w40/${{
                        'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'BDT': 'bd',
                        'INR': 'in', 'PKR': 'pk', 'NPR': 'np', 'LKR': 'lk'
                    }[rate.sourceCurrency.toUpperCase()] || 'un'
                        }.png`}
                    className="h-4 rounded-sm object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                    alt="flag"
                />
            </div>

            <div className="space-y-1">
                <div className="text-3xl font-bold  tabular-nums tracking-tighter">
                    {rate.rate.toFixed(4)}
                </div>

                <div className={`flex items-center gap-1.5 ${isEven ? 'text-emerald-400' : 'text-rose-400'} text-[12px] font-bold`}>
                    {isEven ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}

                </div>
            </div>


        </div>
    );
};

const LiveRatesMarquee = () => {
    const { globalRates, loadRates } = useSettings();

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    if (!globalRates || globalRates.length === 0) return null;

    // Expand data for seamless scroll
    const marqueeRates = [...globalRates, ...globalRates, ...globalRates, ...globalRates];

    return (
        <div className="w-full bg-white overflow-hidden py-8 ">


            <div className="flex whitespace-nowrap">
                <motion.div
                    animate={{ x: [0, -2000] }}
                    transition={{
                        repeat: Infinity,
                        duration: 60,
                        ease: "linear"
                    }}
                    className="flex items-center gap-6"
                >
                    {marqueeRates.map((r, idx) => (
                        <RateCard key={idx} rate={r} idx={idx} />
                    ))}
                </motion.div>
            </div>


        </div>
    );
};

export default LiveRatesMarquee;
