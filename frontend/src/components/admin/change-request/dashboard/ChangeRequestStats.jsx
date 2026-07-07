import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

/**
 * Single stat cell — matches the reference image's bordered quadrant style.
 * Top: icon + label
 * Bottom: big number + unit + badge
 */
const StatCell = ({ icon, label, value, unit, badge, badgeColor, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="flex flex-col justify-between gap-2 p-3.5"
    >
        {/* Icon + label row */}
        <div className="flex items-center gap-1.5 text-slate-400">
            {icon}
            <span className="text-[10px] font-semibold text-slate-500 tracking-wide">{label}</span>
        </div>

        {/* Value + badge row */}
        <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {value}
            </span>
            {unit && (
                <span className="text-[11px] font-semibold text-slate-400">{unit}</span>
            )}
            {badge && (
                <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}
                >
                    {badge}
                </span>
            )}
        </div>
    </motion.div>
);

const ChangeRequestStats = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 divide-x divide-y divide-slate-100">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[130px] animate-pulse bg-slate-50" />
                ))}
            </div>
        );
    }

    const total       = stats.total   || 0;
    const approved    = stats.approved || 0;
    const rejected    = stats.rejected || 0;
    const pending     = stats.pending  || 0;
    const today       = stats.today    || 0;
    const completed   = approved + rejected;
    const successRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
    const resRatio    = total > 0 ? ((completed / total) * 100).toFixed(0) : '0';

    const cells = [
        {
            icon: <FiTrendingUp size={14} />,
            label: 'Total Volume',
            value: completed,
            unit: 'requests',
            badge: '+8%',
            badgeColor: 'bg-emerald-50 text-emerald-600',
        },
        {
            icon: <FiXCircle size={14} />,
            label: 'Expired Proposals',
            value: rejected,
            unit: 'Failed',
            badge: rejected > 0 ? `+${rejected}` : null,
            badgeColor: 'bg-rose-50 text-rose-500',
        },
        {
            icon: <FiCheckCircle size={14} />,
            label: 'Completed Proposals',
            value: approved,
            unit: 'Completed',
            badge: today > 0 ? `+${today}` : null,
            badgeColor: 'bg-emerald-50 text-emerald-600',
        },
        {
            icon: <FiClock size={14} />,
            label: 'Avg. Resolution',
            value: `${resRatio}%`,
            unit: null,
            badge: pending > 0 ? `-${pending} pending` : null,
            badgeColor: 'bg-amber-50 text-amber-600',
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-2 divide-slate-100"
             style={{ gridTemplateRows: '1fr 1fr' }}>
            {cells.map((cell, idx) => (
                <div
                    key={idx}
                    className={`${idx % 2 === 0 ? 'border-r' : ''} ${idx < 2 ? 'border-b' : ''} border-slate-100`}
                >
                    <StatCell {...cell} delay={idx * 0.08} />
                </div>
            ))}
        </div>
    );
};

export default ChangeRequestStats;
