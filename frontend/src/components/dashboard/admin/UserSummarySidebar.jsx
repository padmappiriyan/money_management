import React from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, User as UserIcon } from 'lucide-react';

const SummaryItem = ({ label, value, icon: Icon, colorClass, bgColorClass, iconColorClass }) => {
    const formatCurrency = (val) => {
        const num = Math.abs(Number(val) || 0);
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getSign = () => {
        if (label.toUpperCase().includes('PAID') || label.toUpperCase().includes('DEPOSIT')) return '-';
        if (label.toUpperCase().includes('SEND')) return '+';
        return value >= 0 ? '+' : '-';
    };

    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-50/80 hover:bg-slate-50/80 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${bgColorClass} ${iconColorClass} flex items-center justify-center border border-transparent group-hover:border-white shadow-sm transition-all`}>
                    <Icon size={18} />
                </div>
                <div className="text-[13px] font-medium text-slate-400 tracking-tight leading-none ">{label}</div>
            </div>
            <div className={`text-[13px] font-medium tracking-tight ${colorClass}`}>
                {getSign()}{formatCurrency(value)}
            </div>
        </div>
    );
};

const UserSummarySidebar = ({ data }) => {
    if (!data) return null;

    return (
        <div className="w-full lg:w-[340px] flex flex-col bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden h-[520px] shrink-0">
            {/* Header Area styled like the User List header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                        <UserIcon size={16} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-900 tracking-tight leading-none">User Summary</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase  mt-1">Financial Overview</p>
                    </div>
                </div>
            </div>

            {/* Metrics List */}
            <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                <SummaryItem
                    label="Total Send"
                    value={data.totalSend}
                    icon={ArrowUpRight}
                    colorClass="text-rose-600"
                    bgColorClass="bg-rose-50"
                    iconColorClass="text-rose-500"
                />
                <SummaryItem
                    label="Total Deposit"
                    value={data.totalDeposit}
                    icon={ArrowDownRight}
                    colorClass="text-emerald-600"
                    bgColorClass="bg-emerald-50"
                    iconColorClass="text-emerald-500"
                />
                <SummaryItem
                    label="Total Paid"
                    value={data.totalPaid}
                    icon={CreditCard}
                    colorClass="text-blue-600"
                    bgColorClass="bg-blue-50"
                    iconColorClass="text-blue-500"
                />
                <SummaryItem
                    label="Net Balance"
                    value={data.netBalance}
                    icon={Wallet}
                    colorClass="text-indigo-600"
                    bgColorClass="bg-indigo-50"
                    iconColorClass="text-indigo-500"
                />
            </div>

            {/* Footer decoration */}
            <div className="p-4 pt-0">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-medium uppercase  text-slate-400">
                        <span>Current Status</span>
                        <span className="text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSummarySidebar;
