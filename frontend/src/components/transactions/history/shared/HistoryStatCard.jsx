import React from 'react';

const HistoryStatCard = ({ title, value, subtitle, icon: Icon, color }) => {
    const colorMap = {
        brand: 'bg-brand-50 text-brand-600 border-brand-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };

    return (
        <div className={`p-6 rounded-3xl border ${colorMap[color]} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group`}>
            <div className={`w-12 h-12 rounded-2xl ${colorMap[color]} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                <Icon size={24} />
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <h4 className="text-2xl font-black text-neutral-900 tracking-tighter mb-1">{value}</h4>
            <p className="text-[10px] font-bold text-neutral-400 italic">{subtitle}</p>
        </div>
    );
};

export default HistoryStatCard;
