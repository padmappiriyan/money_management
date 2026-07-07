import React from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, colorClass, bgColorClass, iconColorClass }) => {
    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            {/* Background Accent */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform ${bgColorClass}`} />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">{label}</span>
                    <div className={`p-2 rounded-xl ${bgColorClass} ${iconColorClass}`}>
                        <Icon size={16} />
                    </div>
                </div>
                
                <div className="flex items-baseline gap-1">
                    <h4 className={`text-xl font-black tracking-tight ${colorClass}`}>
                        {label.toUpperCase().includes('PAID') || label.toUpperCase().includes('DEPOSIT') ? '-' : label.toUpperCase().includes('SEND') ? '+' : value >= 0 ? '+' : '-'}
                        {formatCurrency(value)}
                    </h4>
                </div>
            </div>
        </div>
    );
};

const PerformanceSummaryCards = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Total Send" 
                value={data.totalSend} 
                icon={ArrowUpRight} 
                colorClass="text-rose-600"
                bgColorClass="bg-rose-50"
                iconColorClass="text-rose-500"
            />
            <StatCard 
                label="Total Deposit" 
                value={data.totalDeposit} 
                icon={ArrowDownRight} 
                colorClass="text-emerald-600"
                bgColorClass="bg-emerald-50"
                iconColorClass="text-emerald-500"
            />
            <StatCard 
                label="Total Paid" 
                value={data.totalPaid} 
                icon={CreditCard} 
                colorClass="text-blue-600"
                bgColorClass="bg-blue-50"
                iconColorClass="text-blue-500"
            />
            <StatCard 
                label="Net Balance" 
                value={data.netBalance} 
                icon={Wallet} 
                colorClass="text-brand-600"
                bgColorClass="bg-brand-50"
                iconColorClass="text-brand-500"
            />
        </div>
    );
};

export default PerformanceSummaryCards;
