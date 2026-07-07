import React from 'react';

const AdminOverviewMetrics = ({ data = {}, totalUsers = 0 }) => {
    const stats = [
        {
            label: 'TOTAL BROUGHT FWD',
            value: data.broughtFwd ?? 0,
            subtext: `Sum of ${totalUsers || 0} active branches`,
            color: 'text-brand-900',
        },
        {
            label: 'TOTAL SEND',
            value: data.totalSend ?? 0,
            subtext: 'Net customer collection',
            color: 'text-emerald-600',
        },
        {
            label: 'TOTAL DEPOSIT',
            value: data.totalDeposit ?? 0,
            subtext: '18% vs last today',
            color: 'text-emerald-600',
        },
        {
            label: 'TOTAL PAID',
            value: data.totalPaid ?? 0,
            subtext: '4% vs last today',
            color: 'text-indigo-600',
        }
    ];

    const platformNet = {
        label: 'PLATFORM NET',
        value: data.platformNet ?? 0,
        subtext: 'Stable liquidity',
        color: 'text-brand-600'
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 py-2 border-b border-neutral-100 pb-4">
            {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                    <span className="text-[10px] font-bold text-brand-800">
                        {stat.label}
                    </span>
                    <span className={`text-sm font-black ${stat.color} mt-0.5 tracking-tight`}>
                        {typeof stat.value === 'number' 
                            ? stat.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) 
                            : stat.value}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400/80 mt-0.5 leading-none">
                        {stat.subtext}
                    </span>
                </div>
            ))}

            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-brand-800">
                    {platformNet.label}
                </span>
                <span className={`text-sm font-black ${platformNet.color} mt-0.5 tracking-tight`}>
                    EUR {typeof platformNet.value === 'number' 
                        ? platformNet.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) 
                        : platformNet.value}
                </span>
                <span className="text-[8px] font-bold text-brand-500 mt-0.5 leading-none">
                    {platformNet.subtext}
                </span>
            </div>
        </div>
    );
};

export default AdminOverviewMetrics;
