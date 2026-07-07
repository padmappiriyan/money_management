import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';

const PlatformHistoryTable = ({ history, platformColor = 'text-brand-500' }) => {
    return (
        <div className="w-full">
            {/* Scrollable Container if needed */}
            <div className="overflow-x-auto custom-scrollbar -mx-2 px-2">
                <div className="min-w-[480px]">
                    {/* ── Table Header ── */}
                    <div className="grid grid-cols-[90px_1fr_1fr_1fr_1fr_1fr] items-center mb-4 text-[10px] font-bold text-neutral-400/80 uppercase tracking-[0.15em] pb-2">
                        <div className="pl-1">Date</div>
                        <div className="text-right">B/F</div>
                        <div className="text-right">Send</div>
                        <div className="text-right">Paid</div>
                        <div className="text-right">Deposit</div>
                        <div className="text-right pr-1">Balance</div>
                    </div>

                    {/* ── Table Body ── */}
                    <div className="space-y-4">
                        {history.map((row, idx) => (
                            <div 
                                key={row.date} 
                                className="grid grid-cols-[90px_1fr_1fr_1fr_1fr_1fr] items-center group transition-colors hover:bg-neutral-50/50 py-1.5 -my-1.5 rounded-lg"
                            >
                                {/* Date Column */}
                                <div className="flex items-center gap-2 pl-1 font-sans">
                                    <FiCalendar className={`${platformColor} text-[14.5px] opacity-80`} />
                                    <span className="text-[12px] font-bold text-[#1E293B]">
                                        {format(new Date(row.date), 'dd MMM')}
                                    </span>
                                </div>

                                {/* Metrics Columns */}
                                <div className="text-right text-[12px] font-medium text-neutral-500">
                                    {row.bf?.toLocaleString() || '0'}
                                </div>
                                <div className="text-right text-[12px] font-semibold text-rose-500 tracking-tight">
                                    -{row.send?.toLocaleString() || '0'}
                                </div>
                                <div className="text-right text-[12px] font-semibold text-indigo-500 tracking-tight">
                                    -{row.paid?.toLocaleString() || '0'}
                                </div>
                                <div className="text-right text-[12px] font-semibold text-emerald-500 tracking-tight">
                                    -{row.deposit?.toLocaleString() || '0'}
                                </div>
                                
                                {/* Final Balance Column */}
                                <div className="text-right pr-1 text-[12px] font-black text-[#1E293B]">
                                    {row.balance?.toLocaleString() || '0'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {history.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center opacity-20 grayscale">
                        <FiCalendar className="text-4xl mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">No Ledger Activity</p>
                </div>
            )}
        </div>
    );
};

export default PlatformHistoryTable;
