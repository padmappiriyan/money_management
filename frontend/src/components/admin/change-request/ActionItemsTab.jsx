import React from 'react';
import { FiCheck, FiX, FiClock, FiUser, FiArrowRight, FiMessageCircle, FiAlertCircle, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const ActionItemsTab = ({ request, transaction, remarks, onRemarksChange, onApprove, onReject, actionLoading }) => {
    if (!request) return null;

    const requestedBy = request.requestedBy || {};
    const createdAt = request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy | HH:mm') : 'N/A';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 items-start h-fit max-h-[calc(100vh-200px)]">

            {/* ── Left Column: CHANGE DETAILS (Compact) ── */}
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-md flex flex-col h-full"
            >
                <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                            <FiAlertCircle size={16} />
                        </div>
                        <h2 className="text-[18px] font-bold text-slate-800 tracking-tight">Modification</h2>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[12px] font-bold uppercase tracking-widest border border-amber-100/50">Pending</span>
                </div>

                <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                    {/* Transformation Card */}
                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100/50">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold text-rose-400/80 uppercase mb-1">Original</div>
                                <div className="p-2 rounded-lg bg-white border border-rose-50 text-rose-600 font-bold text-[12px] truncate shadow-sm">
                                    {request.oldValue || '—'}
                                </div>
                            </div>
                            <FiArrowRight size={14} className="text-slate-300 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold text-emerald-500/80 uppercase mb-1">Proposed</div>
                                <div className="p-2 rounded-lg bg-brand-50 border border-brand-100/30 text-brand-700 font-bold text-[12px] truncate shadow-sm">
                                    {request.newValue || '—'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">Target Field:</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[8px] font-bold uppercase tracking-wider">{request.field}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-50 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                <FiUser size={14} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[12px] font-bold text-slate-800 truncate">{requestedBy.name || 'Unknown'}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">{requestedBy.role || 'Staff'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-50 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                <FiClock size={14} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[12px] font-bold text-slate-800 truncate">{createdAt}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Timeline</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative p-4 rounded-xl bg-[#f8fafc] border border-slate-100">
                        <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Justification</h4>
                        <p className="text-[14px] text-black font-medium leading-relaxed ">
                            "{request.reason || 'No reason provided.'}"
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Right Column: DECISION CENTER (Ultra Compact) ── */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 flex flex-col gap-4"
            >
                <div>
                    <h3 className="text-[12px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-0.5">Command</h3>
                    <h2 className="text-[14px] font-bold text-slate-800 tracking-tight">Verdict Center</h2>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Remarks</label>
                        <span className="text-[12px] font-bold text-rose-500 uppercase tracking-tighter">* Required for rejection</span>
                    </div>
                    <textarea
                        value={remarks}
                        onChange={(e) => onRemarksChange(e.target.value)}
                        placeholder="Verdict rationale..."
                        className="w-full h-24 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-600 outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onApprove}
                        disabled={actionLoading}
                        className="group relative h-10 bg-brand-600 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/10 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {actionLoading ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <FiCheck size={14} className="shrink-0" />
                        )}
                        <span className="text-[10px] font-medium tracking-wider uppercase">Approve</span>
                    </button>

                    <button
                        onClick={onReject}
                        disabled={actionLoading}
                        className="group h-10 bg-white text-white rounded-lg border border-red-100 flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {actionLoading ? (
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                        ) : (
                            <FiX size={14} className="shrink-0 text-red-500" />
                        )}
                        <span className="text-[10px] font-medium text-red-500 tracking-wider uppercase">Reject</span>
                    </button>
                </div>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] pt-2 border-t border-slate-50">
                    Logged for Audit Compliance
                </p>
            </motion.div>
        </div>
    );
};

export default ActionItemsTab;

