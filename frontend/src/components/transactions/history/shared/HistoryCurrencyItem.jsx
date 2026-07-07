import React from 'react';

const HistoryCurrencyItem = ({ data, typeFilter }) => {
    // Filter the breakdown data based on send/receive
    const displayData = typeFilter === 'all' 
        ? data.types.reduce((acc, t) => ({ count: acc.count + t.count, totalLkr: acc.totalLkr + t.totalLkr }), { count: 0, totalLkr: 0 })
        : data.types.find(t => t.type === typeFilter) || { count: 0, totalLkr: 0 };

    return (
        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-sm text-neutral-500 group-hover:bg-white transition-colors">
                    {data._id.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-black text-neutral-900 uppercase">{data._id}</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{displayData.count} Institutional Entries</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black text-neutral-900">
                    <span className="text-neutral-300 text-[10px] mr-2">EUR</span>
                    {displayData.totalLkr.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-brand-500/60 uppercase">Market Weighted Value</p>
            </div>
        </div>
    );
};

export default HistoryCurrencyItem;
