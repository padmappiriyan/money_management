import React, { useEffect, useState } from 'react';
import { FiClock, FiUser, FiActivity, FiRefreshCcw, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';

/**
 * AuditTrail Component
 * Displays a professional timeline of rate synchronization and manual updates
 */
const AuditTrail = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/activities/rate-sync-history');
            if (data.success) {
                setHistory(data.data || []);
            }
        } catch (err) {
            setError('Failed to load audit logs');
            console.error('AuditTrail Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // Refresh every 5 minutes to keep it active
        const interval = setInterval(fetchHistory, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading && history.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-1/4 mb-4" />
                <div className="space-y-4">
                    <div className="h-20 bg-slate-50 rounded-2xl w-full" />
                    <div className="h-20 bg-slate-50 rounded-2xl w-full" />
                </div>
            </div>
        );
    }

    if (error && history.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-8 border border-red-50 text-red-400 text-center">
                <FiAlertCircle size={24} className="mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
        );
    }

    // Format description to be "Industry Standard" (removing sensitive/verbose parts if needed)
    const formatDescription = (desc) => {
        // Example: "Admin user@example.com triggered a global sync..." -> "Global synchronization triggered"
        if (desc.includes('triggered a global sync')) {
            return 'Global asset valuation synchronized with external exchange provider.';
        }
        return desc;
    };

    return (
        <div className="bg-[#eef2ff] rounded-[2.25rem] p-8 border border-neutral-100/60 shadow-[0_10px_40px_rgba(0,0,0,0.02)] animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-50">
                <div>
                    <h2 className="text-[13px] font-black uppercase text-brand-600  mb-1">Audit Trail</h2>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase  leading-none">Synchronization Governance</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchHistory}
                        className="p-2 text-neutral-300 hover:text-brand-600 transition-colors"
                        title="Refresh Logs"
                    >
                        <FiRefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-400 border border-slate-100/50">
                        <FiActivity size={18} />
                    </div>
                </div>
            </div>

            <div className="pr-2">
                <div className="relative pl-9 group">
                    {/* Status Node */}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-400  border-green-600 shadow-sm z-10 transition-transform group-hover:scale-110" />

                    {history.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <FiClock size={12} className="text-green-300" />
                                <span>{new Date(history[0].timestamp).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>

                            <h3 className="text-[14px] font-black leading-tight text-slate-800">
                                Latest Valuation Update
                            </h3>

                            <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-md">
                                {formatDescription(history[0].description)}
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm overflow-hidden text-[9px] font-black">
                                    {history[0].user?.name?.[0]?.toUpperCase() || <FiUser size={12} />}
                                </div>
                                <div className="leading-none">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{history[0].user?.name || 'Automated System'}</p>
                                    <p className="text-[9px] font-medium text-slate-300 truncate max-w-[150px]">{history[0].user?.role?.toLowerCase() || 'service-role'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-2 italic text-neutral-300 text-xs">
                            No synchronization records found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditTrail;
