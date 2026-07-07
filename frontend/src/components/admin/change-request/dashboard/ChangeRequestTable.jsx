import React from 'react';
import { FiArrowRight, FiCheckCircle, FiClock, FiXCircle, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
    const config = {
        pending: {
            bg: 'bg-amber-100/50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: <FiClock size={12} />,
            label: 'Pending'
        },
        approved: {
            bg: 'bg-emerald-100/50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: <FiCheckCircle size={12} />,
            label: 'Approved'
        },
        rejected: {
            bg: 'bg-rose-100/50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: <FiXCircle size={12} />,
            label: 'Rejected'
        }
    };

    const { bg, text, border, icon, label } = config[status] || config.pending;

    return (
        <span className={`px-2.5 py-1 rounded-full ${bg} ${text} ${border} border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm transition-all`}>
            {icon} {label}
        </span>
    );
};

const ChangeRequestTable = ({ requests, loading, onRowClick }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 8;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [requests]);

    if (loading && requests.length === 0) {
        return (
            <div className="w-full h-80 bg-white rounded-3xl border border-slate-100 p-10 flex items-center justify-center animate-pulse shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiClock className="animate-spin" /> Scanning Ledger Records...
                </span>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="w-full h-80 bg-white rounded-3xl border border-slate-100 p-10 flex flex-col items-center justify-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner">
                    <FiMessageSquare size={26} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">No Requests Found</h3>
                <p className="text-xs font-medium text-slate-500 text-center max-w-sm">All data synchronization points are currently stable. No change requests matching your criteria.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = requests.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all">
            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200/60 text-left">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase  text-brand-800 whitespace-nowrap">Transaction ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase  text-brand-800">Requester</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase  text-brand-800">Attribute</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase  text-brand-800">Modification</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-brand-800 text-center">Timeline</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase  text-brand-800 text-center">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-brand-800 text-right">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedRequests.map((request, idx) => {
                            const isApproved = request.status === 'approved' || request.status === 'rejected';

                            return (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={request.id || request._id}
                                    className={`group transition-all duration-200 ${isApproved ? 'bg-slate-50/30 cursor-not-allowed opacity-90' : 'hover:bg-brand-50/30 hover:shadow-[inset_4px_0_0_0_#4f46e5] cursor-pointer'}`}
                                    onClick={() => {
                                        if (!isApproved) {
                                            onRowClick(request);
                                        }
                                    }}
                                >

                                <td className="px-6 py-4 font-bold text-brand-800 text-[13px]  whitespace-nowrap">
                                    TRX-{(request.transactionId?.id || request.transactionId?._id)?.slice(-8) || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[11px] shadow-sm">
                                            {request.requestedBy?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-brand-800 tracking-tight leading-none mb-1">{request.requestedBy?.name}</span>
                                            <span className="text-[10px] font-semibold text-brand-800 uppercase tracking-widest">{request.requestedBy?.role}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-bold text-slate-600 capitalize border border-slate-200 shadow-sm">
                                        {request.field}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3 bg-slate-50/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                                        <span className="text-[12px] font-bold text-rose-500 line-through opacity-60 tabular-nums">{request.oldValue}</span>
                                        <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100">
                                            <FiArrowRight size={10} className="text-slate-400" />
                                        </div>
                                        <span className="text-[12px] font-bold text-emerald-600 tabular-nums">{request.newValue}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <span className="text-[11px] font-semibold text-slate-600 tracking-tight bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                        {format(new Date(request.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center whitespace-nowrap">
                                    <StatusBadge status={request.status} />
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-all shadow-sm">
                                        <FiExternalLink size={14} />
                                    </button>
                                </td>
                            </motion.tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-white flex justify-between items-center border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, requests.length)}</span> of <span className="text-slate-900 font-bold">{requests.length}</span> records
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                        Previous
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeRequestTable;
