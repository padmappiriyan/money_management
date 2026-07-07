import React from 'react';
import { motion } from 'framer-motion';
import { MdOutlineAccountBalance } from 'react-icons/md';
import { FiUser, FiServer, FiActivity, FiRefreshCw } from 'react-icons/fi';

// Import Images
import CountImg from '../../assets/TranSection/Count.png';
import AvailablePlatformsImg from '../../assets/TranSection/Avaliable_Platforms.png';
import SuccessImg from '../../assets/TranSection/Success.png';

const StatCard = ({ title, value, imgSrc, asBg = false, icon: Icon, topIcon: TopIcon, color = 'bg-white', textWhite = false, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className={`${color} p-8 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden h-[130px]`}
    >
        {/* Full Background Image Mode (kept for flexibility but won't be used for Active Platforms/Success Rate) */}
        {asBg && imgSrc && (
            <div className="absolute inset-0 z-0">
                <img
                    src={imgSrc}
                    alt="Background"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-20"
                />
                <div className="absolute inset-0 bg-neutral-900/10" />
            </div>
        )}

        {/* Top-Left Small Circle Icon */}
        {TopIcon && (
            <div className={`absolute top-6 left-6 w-10 h-10 rounded-full ${asBg ? 'bg-brand-600 border-brand-500 text-white' : 'bg-neutral-50/80 border-neutral-100 text-neutral-400'} backdrop-blur-sm border flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:text-brand-600 group-hover:bg-brand-50`}>
                <TopIcon size={18} />
            </div>
        )}

        {/* Background Decorative Icon (Watermark) */}
        {Icon && !asBg && (
            <div className={`absolute -right-6 -bottom-8 ${textWhite ? 'text-white' : 'text-brand-600'} opacity-[0.08] group-hover:opacity-[0.12] transition-all duration-500 pointer-events-none rotate-12 group-hover:scale-110`}>
                <Icon size={160} />
            </div>
        )}

        {!asBg && imgSrc && (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 overflow-hidden relative z-10">
                <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
        )}

        {/* Dynamic Side Accent line */}
        {!imgSrc && !TopIcon && (
            <div className={`absolute top-0 left-0 w-1.5 h-full ${textWhite ? 'bg-white' : 'bg-brand-600'} opacity-20 group-hover:opacity-100 transition-opacity`} />
        )}

        <div className={`relative z-10 ${TopIcon ? 'mt-8' : ''}`}>
            <p className={`text-[10px] font-black tracking-widest ${textWhite ? 'text-white/60' : 'text-neutral-400'} mb-1 uppercase`}>{title}</p>
            <h3 className={`text-2xl font-black ${textWhite ? 'text-white' : 'text-neutral-900'} tracking-tighter`}>{value}</h3>
        </div>
    </motion.div>
);


const TransactionStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
                title="Total Payout Volume"
                value={`EUR (€) ${stats.totalVolume?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}`}
                icon={MdOutlineAccountBalance}
                color="bg-brand-700"
                textWhite
                delay={0.1}
            />


            <StatCard
                title="Transaction Count"
                value={stats.totalCount || '0'}
                topIcon={FiUser}
                color="bg-white"
                delay={0.2}
            />

            <StatCard
                title="Active Platforms"
                value={stats.activePlatforms || '5'}
                topIcon={FiServer}
                color="bg-white"
                delay={0.3}
            />
            <StatCard
                title="Success Rate"
                value="100%"
                topIcon={FiActivity}
                color="bg-white"
                delay={0.4}
            />
        </div>
    );
};

export default TransactionStats;


