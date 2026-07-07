import React from 'react';
import { LayoutGrid, TrendingUp, TrendingDown, ArrowRight, Download } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';

const UserPlatformBalances = ({ platformData, loading }) => {
    const formatCurrency = (val) => {
        const num = Number(val) || 0;
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Extract current balance (latest) for each platform
    const balances = (platformData || []).map(platform => {
        const latest = platform.history && platform.history.length > 0
            ? platform.history[0]
            : { balance: 0, send: 0, deposit: 0, paid: 0 };

        return {
            name: platform.name,
            slug: platform.slug,
            currentBalance: latest.balance,
            todaySend: latest.send,
            todayDeposit: latest.deposit,
            todayPaid: latest.paid
        };
    });

    if (loading) {
        return (
            <div className="flex-1 bg-[#f1f5f9] border border-slate-200 shadow-inner rounded-[24px] overflow-hidden h-[520px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-white border-t-indigo-500 rounded-full animate-spin shadow-sm" />
                    <span className="text-[10px] font-medium text-slate-400 uppercase ">Calculating Balances...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#f1f5f9] border border-slate-200 shadow-inner rounded-[24px] overflow-hidden h-[520px] flex flex-col p-6">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LayoutGrid size={16} className="text-indigo-500" />
                    Platform Distribution
                </h3>
                <span className="text-[10px] font-medium text-slate-400 uppercase  bg-white/50 px-3 py-1 rounded-full border border-white/20 shadow-sm">
                    {balances.length} Platforms
                </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {balances.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                            <LayoutGrid size={24} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-medium text-sm">No platform data available</p>
                    </div>
                ) : (
                    balances.map((plat) => (
                        <div key={plat.slug} className="py-4 border-b border-slate-200/60 last:border-0 group transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div>
                                        <div className="text-[12px] font-medium text-slate-800 tracking-tight leading-none mb-1.5">{plat.name}</div>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Tooltip content="Send Amount">
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-default">
                                                    <TrendingUp size={10} /> +{formatCurrency(plat.todaySend)}
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Paid Amount">
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50/80 px-2 py-0.5 rounded-full border border-rose-100 hover:bg-rose-100 transition-colors cursor-default">
                                                    <TrendingDown size={10} /> -{formatCurrency(plat.todayPaid)}
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Deposit Amount">
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors cursor-default">
                                                    <TrendingDown size={10} /> -{formatCurrency(plat.todayDeposit)}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[15px] font-medium text-indigo-700 tracking-tighter leading-none">
                                        {formatCurrency(plat.currentBalance)}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-400 uppercase mt-1.5 opacity-60">EUR (€) Balance</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 p-6 bg-white/50 border border-white rounded-[24px] shadow-sm backdrop-blur-md">
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-4">
                    You can download the PDF related all users every day balance with each platform details with every day until now.
                </p>
                <button
                    className="w-full flex items-center justify-center gap-3 py-3 bg-white cursor-pointer border border-slate-100 rounded-2xl text-[12px] font-bold text-indigo-700 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
                    onClick={() => alert('PDF generation feature is coming soon!')}
                >
                    <Download size={16} /> Download File
                </button>
            </div>
        </div>
    );
};

export default UserPlatformBalances;
