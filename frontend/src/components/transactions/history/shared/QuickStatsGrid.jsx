import React from 'react';
import { motion } from 'framer-motion';
import { 
    FiArrowUpRight, FiArrowDownLeft, FiLayers, 
    FiActivity, FiTrendingUp, FiTrendingDown 
} from 'react-icons/fi';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
    const colorVariants = {
        brand: 'text-brand-600 bg-brand-50 border-brand-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    };

    const sparklineColors = {
        brand: '#0ea5e9',
        emerald: '#10b981',
        rose: '#f43f5e',
        amber: '#f59e0b',
        indigo: '#6366f1'
    };

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className={`p-4 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between h-full group hover:shadow-xl hover:shadow-neutral-200/40 transition-all duration-500`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${colorVariants[color] || colorVariants.brand} transition-transform duration-500 group-hover:scale-110`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1.5">
                    {title}
                </p>
                <div className="flex items-baseline gap-1 overflow-hidden">
                    <h3 className="text-lg font-black text-neutral-900 truncate tracking-tight tabular-nums leading-none">
                        {value}
                    </h3>
                    {subtitle && <span className="text-[8px] font-black text-neutral-400 truncate tracking-tighter uppercase">{subtitle}</span>}
                </div>
            </div>

            {/* Subtle Canvas Sparkline Effect (UI Mockup) */}
            <div className="mt-3 pt-3 border-t border-neutral-50 flex items-center justify-between">
                <div className="h-4 w-16 opacity-30">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d">
                        <path 
                            d="M0 20 Q 20 5 40 25 T 80 10 T 100 20" 
                            fill="none" 
                            stroke={sparklineColors[color] || '#cbd5e1'} 
                            strokeWidth="3" 
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div className="text-[9px] font-bold text-neutral-300 uppercase tracking-tighter">Live</div>
            </div>
        </motion.div>
    );
};

const QuickStatsGrid = React.memo(({ stats, loading }) => {
    const { summary } = stats;

    const cards = [
        {
            title: "Total Balance",
            value: `€ ${summary.totalVolume.toLocaleString()}`,
            subtitle: "EUR",
            icon: FiActivity,
            color: "brand",
            trend: summary.totalVolume > 0 ? 12.5 : null
        },
        {
            title: "Total Paid",
            value: `€ ${summary.receiveAmount.toLocaleString()}`,
            subtitle: "EUR",
            icon: FiArrowDownLeft,
            color: "emerald",
            trend: summary.receiveAmount > 0 ? 8.2 : null
        },
        {
            title: "Total Sent",
            value: `€ ${summary.sendAmount.toLocaleString()}`,
            subtitle: "EUR",
            icon: FiArrowUpRight,
            color: "rose",
            trend: summary.sendAmount > 0 ? -4.1 : null
        },
        {
            title: "Active Records",
            value: summary.totalCount.toLocaleString(),
            subtitle: "Entries",
            icon: FiLayers,
            color: "indigo",
            trend: summary.totalCount > 0 ? 24.0 : null
        }
    ];

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
            {cards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    );
});

export default QuickStatsGrid;
