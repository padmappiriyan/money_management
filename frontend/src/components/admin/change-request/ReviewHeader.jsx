import React from 'react';
import { FiArrowLeft, FiInfo, FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';

const ReviewHeader = ({ 
    transaction, 
    request, 
    navigate, 
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-100 transition-all shadow-sm"
                >
                    <FiArrowLeft size={18} />
                </button>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                            <FiActivity size={14} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                            TRX-{(transaction?.id || transaction?._id)?.slice(-8) || 'Unknown'}
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                            request.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            request.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                            {request.status}
                        </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Requested by <span className="text-slate-600">{request.requestedBy?.name}</span> • {format(new Date(request.createdAt), 'MMM dd, yyyy | HH:mm')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                    <FiInfo size={14} /> SYSTEM AUDIT LOG READY
                </span>
            </div>
        </div>
    );
};

export default ReviewHeader;
