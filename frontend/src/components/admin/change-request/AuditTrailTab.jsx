import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

const AuditTrailTab = ({ request, transaction }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col gap-8">
            <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Transaction Audit History</h3>
            <div className="flex flex-col border-l-2 border-slate-100 ml-3 gap-8">
                <div className="relative pl-8">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <FiCheck size={10} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Amendment Requested</span>
                        <span className="text-sm font-bold text-slate-800 tracking-tight">System validation passed</span>
                        <span className="text-[10px] font-bold text-slate-400">
                            {format(new Date(request.createdAt), 'MMM dd, yyyy | HH:mm:ss')}
                        </span>
                    </div>
                </div>
                <div className="relative pl-8 opacity-50">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Initial Capture</span>
                        <span className="text-sm font-bold text-slate-800 tracking-tight">Original transaction recorded</span>
                        <span className="text-[10px] font-bold text-slate-400">
                            {format(new Date(transaction?.createdAt || Date.now()), 'MMM dd, yyyy | HH:mm:ss')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditTrailTab;
