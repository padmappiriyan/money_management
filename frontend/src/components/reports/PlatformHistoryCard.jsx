import React from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiSend, FiArrowUpRight, FiClock } from 'react-icons/fi';
import PlatformHistoryTable from './PlatformHistoryTable';

const PlatformHistoryCard = ({ platformData, index }) => {
    const { name, slug, history } = platformData;

    const getPlatformStyle = (platformSlug = '') => {
        const slugLower = platformSlug.toLowerCase();
        if (slugLower.includes('western')) {
            return {
                icon: <FiGlobe />,
                bg: 'bg-[#FFF9E6]',
                text: 'text-[#D97706]',
            };
        }
        if (slugLower.includes('moneygram')) {
            return {
                icon: <FiSend />,
                bg: 'bg-[#FFF1F2]',
                text: 'text-[#E11D48]',
            };
        }
        if (slugLower.includes('ria')) {
            return {
                icon: <FiArrowUpRight />,
                bg: 'bg-[#FFF7ED]',
                text: 'text-[#EA580C]',
            };
        }
        return {
            icon: <FiClock />,
            bg: 'bg-brand-50',
            text: 'text-brand-600',
        };
    };

    const style = getPlatformStyle(slug);
    const latestBalance = history.length > 0 ? history[0].balance : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-[2rem] p-6 sm:p-8 border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden`}
        >
            {/* Header Identity */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-[26px] transition-transform hover:scale-105 duration-300`}>
                        {style.icon}
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-[26px] leading-none font-black text-[#1E293B] uppercase tracking-tight">{name}</h3>
                        <div className="flex items-center gap-1.5 opacity-40 mt-1">
                            <FiClock className="text-[11px]" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">History</span>
                        </div>
                    </div>
                </div>

                <div className="bg-neutral-50/80 px-4 py-2.5 rounded-[1.25rem] border border-neutral-100/80 text-right min-w-[120px]">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Latest Balance</p>
                    <p className="text-[18px] leading-none font-black text-[#1E293B] tracking-tight">
                        <span className="text-[11px] font-bold mr-1 opacity-50">EUR (€)</span>
                        {latestBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Historical Table */}
            <PlatformHistoryTable 
                history={history} 
                platformColor={style.text} 
            />
        </motion.div>
    );
};

export default PlatformHistoryCard;
