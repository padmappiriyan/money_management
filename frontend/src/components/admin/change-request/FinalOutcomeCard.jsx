import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const FinalOutcomeCard = ({ request }) => {
    const isPending = request.status === 'pending';

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <FiCheckCircle size={14} />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 tracking-widest uppercase">Final Outcome</h3>
            </div>

            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-50 flex flex-col gap-2">
                <h4 className="text-[18px]  text-slate-900 tracking-tight">
                    {isPending ? 'Pending Verification' : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </h4>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                    {isPending
                        ? `The amendment for "${request?.field?.toUpperCase() || 'DATA'}" is currently awaiting administrative validation.`
                        : `Verification protocol concluded. Result: ${request?.status?.toUpperCase() || 'UNKNOWN'}.`
                    }
                </p>
                {request.reason && (
                    <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Justification</span>
                        <p className="text-[12px] text-slate-600 italic font-medium leading-snug">"{request.reason}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinalOutcomeCard;
