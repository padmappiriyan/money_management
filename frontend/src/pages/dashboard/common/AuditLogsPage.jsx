import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiShield, FiChevronLeft, FiChevronRight,
    FiCalendar, FiFilter, FiSend, FiArrowDownCircle,
    FiDatabase, FiActivity, FiClock, FiX, FiRefreshCw,
    FiGlobe
} from 'react-icons/fi';
import { getAuditLogs } from '../../../api/auditLogApi';
import useSettings from '../../../hooks/useSettings';
import { format, isToday, isYesterday, parseISO, isSameDay } from 'date-fns';

// ─── Event Type Config ───────────────────────────────────────────────────────
const EVENT_TYPES = [
    {
        value: 'send',
        label: 'Send',
        icon: FiSend,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
        value: 'receive',
        label: 'Paid',
        icon: FiArrowDownCircle,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        dot: 'bg-indigo-400',
        badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    {
        value: 'deposit',
        label: 'Deposit',
        icon: FiDatabase,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
    },
];

const getEventStyle = (type) =>
    EVENT_TYPES.find((e) => e.value === type) || {
        label: type?.toUpperCase() || 'ACTIVITY',
        icon: FiActivity,
        color: 'text-neutral-500',
        bg: 'bg-neutral-50',
        border: 'border-neutral-200',
        dot: 'bg-neutral-300',
        badge: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getDateLabel = (dateStr) => {
    try {
        const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
        if (isToday(d)) return 'Today';
        if (isYesterday(d)) return 'Yesterday';
        return format(d, 'dd MMMM yyyy');
    } catch {
        return 'Unknown Date';
    }
};

const groupLogsByDate = (logs) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;

    logs.forEach((log) => {
        const logDate = new Date(log.timestamp);
        if (!currentDate || !isSameDay(logDate, currentDate)) {
            currentDate = logDate;
            currentGroup = { date: logDate, label: getDateLabel(log.timestamp), entries: [] };
            groups.push(currentGroup);
        }
        currentGroup.entries.push(log);
    });

    return groups;
};

const getPlatformDisplayName = (slug = '') => {
    const map = {
        ria: 'Ria',
        moneygram: 'Moneygram',
        'western-union': 'Western Union',
        'western_union': 'Western Union',
    };
    return map[slug?.toLowerCase()] || slug?.replace(/-|_/g, ' ') || 'Unknown Platform';
};

// ─── Timeline Entry Card ─────────────────────────────────────────────────────
const TimelineEntry = ({ log, idx, isLast }) => {
    const rawType = log.details?.type || log.transactionId?.type || '';
    const style = getEventStyle(rawType);
    const Icon = style.icon;

    const platform =
        log.details?.platform || log.transactionId?.platform || '';
    const amount =
        log.details?.amount ?? log.transactionId?.amount ?? null;
    const currency = log.transactionId?.currency || 'EUR';
    const userEmail = log.userId?.email || 'System';
    const timeStr = format(new Date(log.timestamp), 'HH:mm:ss');
    
    const receiverName = log.details?.receiverName || log.transactionId?.receiverName;
    const senderName = log.details?.senderName || log.transactionId?.senderName;

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
            className="flex relative group min-h-[60px]"
        >
            {/* Time */}
            <div className="w-16 flex-shrink-0 text-right pr-4 pt-0.5">
                <p className="text-[11px] font-medium text-neutral-500 tabular-nums">{timeStr}</p>
            </div>

            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0 relative w-6">
                <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 mt-0.5 ${style.bg}`}>
                    <Icon size={10} className={style.color} />
                </div>
                {!isLast && (
                    <div className="w-px bg-neutral-200 flex-grow" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pl-3 pb-6 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[13px] text-cyan-500 font-medium">
                        {userEmail}
                    </span>
                    <span className="text-[13px] font-bold text-neutral-800">
                        {style.label} {platform ? `on ${getPlatformDisplayName(platform)}` : ''}
                    </span>
                    {amount !== null && (
                        <span className={`text-[12px] font-bold ml-auto ${style.color}`}>
                            € {Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-[12px] text-neutral-500 font-medium">
                    {receiverName && (
                        <span>Receiver: <span className="font-bold text-neutral-700">{receiverName}</span></span>
                    )}
                    {senderName && (
                        <span>Sender: <span className="font-bold text-neutral-700">{senderName}</span></span>
                    )}
                    {log.details?.ipAddress && (
                        <span className="text-[11px]">IP Address: {log.details.ipAddress}</span>
                    )}
                    {log.details?.ipAddress && log.details?.peer && <span className="text-[11px]">Peer: {log.details.peer}</span>}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Filter Checkbox Group ────────────────────────────────────────────────────
const FilterCheckbox = ({ checked, onChange, label, color = 'text-neutral-700' }) => (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
        <div
            onClick={onChange}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer
                ${checked
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-neutral-200 bg-white group-hover:border-indigo-300'
                }`}
        >
            {checked && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
        <span className={`text-[12px] font-semibold ${color} group-hover:text-neutral-900 transition-colors`}>
            {label}
        </span>
    </label>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const AuditLogsPage = () => {
    const { activePlatforms, loadActivePlatforms } = useSettings();

    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    // Sidebar filter state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEventTypes, setSelectedEventTypes] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    // Applied filters (only sent to API when user clicks Filter or clears)
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: '',
        endDate: '',
        eventTypes: [],
        platforms: [],
        pageNumber: 1,
        pageSize: 20,
    });

    useEffect(() => {
        loadActivePlatforms();
    }, [loadActivePlatforms]);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                pageNumber: appliedFilters.pageNumber,
                pageSize: appliedFilters.pageSize,
            };
            if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
            if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
            if (appliedFilters.eventTypes.length > 0)
                params.eventType = appliedFilters.eventTypes.join(',');
            if (appliedFilters.platforms.length > 0)
                params.platform = appliedFilters.platforms.join(',');

            const response = await getAuditLogs(params);
            setLogs(response.data || []);
            setMeta({
                page: response.page || 1,
                pages: response.pages || 1,
                total: response.total || 0,
            });
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleApplyFilters = () => {
        setAppliedFilters({
            startDate,
            endDate,
            eventTypes: selectedEventTypes,
            platforms: selectedPlatforms,
            pageNumber: 1,
            pageSize: 20,
        });
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedEventTypes([]);
        setSelectedPlatforms([]);
        setAppliedFilters({
            startDate: '',
            endDate: '',
            eventTypes: [],
            platforms: [],
            pageNumber: 1,
            pageSize: 20,
        });
    };

    const toggleEventType = (val) => {
        setSelectedEventTypes((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    };

    const togglePlatform = (slug) => {
        setSelectedPlatforms((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
        );
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.pages) {
            setAppliedFilters((prev) => ({ ...prev, pageNumber: newPage }));
        }
    };

    const hasActiveFilters =
        appliedFilters.startDate ||
        appliedFilters.endDate ||
        appliedFilters.eventTypes.length > 0 ||
        appliedFilters.platforms.length > 0;

    const grouped = groupLogsByDate(logs);

    return (
        <div className="p-4 md:p-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
                        <FiActivity size={16} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-neutral-900 tracking-tight">Audit Log</h1>
                        <p className="text-[11px] text-neutral-400 font-medium">Secure activity trail for all platform entries</p>
                    </div>
                </div>

                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-100 text-neutral-500 text-[11px] font-bold uppercase tracking-wider hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                >
                    <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* ── LEFT: Timeline Feed ── */}
                <div className="flex-1 min-w-0">

                    {/* Active filter pills */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {appliedFilters.eventTypes.map((t) => {
                                const s = getEventStyle(t);
                                return (
                                    <span key={t} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${s.badge}`}>
                                        {s.label}
                                        <FiX size={10} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => {
                                            setSelectedEventTypes(p => p.filter(v => v !== t));
                                            setAppliedFilters(p => ({ ...p, eventTypes: p.eventTypes.filter(v => v !== t), pageNumber: 1 }));
                                        }} />
                                    </span>
                                );
                            })}
                            {appliedFilters.platforms.map((slug) => (
                                <span key={slug} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-violet-50 text-violet-700 border-violet-200">
                                    <FiGlobe size={10} />
                                    {getPlatformDisplayName(slug)}
                                    <FiX size={10} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => {
                                        setSelectedPlatforms(p => p.filter(s => s !== slug));
                                        setAppliedFilters(p => ({ ...p, platforms: p.platforms.filter(s => s !== slug), pageNumber: 1 }));
                                    }} />
                                </span>
                            ))}
                            {(appliedFilters.startDate || appliedFilters.endDate) && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
                                    <FiCalendar size={10} />
                                    {appliedFilters.startDate || '…'} → {appliedFilters.endDate || '…'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Loading bar */}
                    {loading && (
                        <div className="h-1 w-full bg-indigo-50 rounded-full overflow-hidden mb-4">
                            <motion.div
                                className="h-full bg-indigo-500 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 min-h-[500px] max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <AnimatePresence mode="popLayout">
                            {!loading && logs.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center min-h-[400px] gap-4"
                                >
                                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                                        <FiShield size={40} />
                                    </div>
                                    <p className="text-lg font-black text-neutral-700 tracking-tight">No records found</p>
                                    <p className="text-sm text-neutral-400 font-medium text-center max-w-xs">
                                        No audit log entries match your current filters. Try clearing filters or adjusting the date range.
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {grouped.map((group, gIdx) => (
                                        <div key={gIdx} className="mb-4">
                                            {/* Date divider */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-100 px-3 py-1 rounded-full">
                                                    <FiClock size={11} className="text-neutral-400" />
                                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                                        {group.label}
                                                    </span>
                                                </div>
                                                <div className="flex-1 h-px bg-neutral-50" />
                                            </div>

                                            {/* Entries */}
                                            {group.entries.map((log, idx) => (
                                                <TimelineEntry
                                                    key={log._id}
                                                    log={log}
                                                    idx={idx}
                                                    isLast={idx === group.entries.length - 1 && gIdx === grouped.length - 1}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    <div className="mt-3 flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-neutral-100 shadow-sm">
                        <p className="text-[11px] font-bold text-neutral-400 tracking-wide">
                            Page <span className="text-neutral-800 font-black">{meta.page}</span> of {meta.pages || 1}
                            <span className="mx-3 text-neutral-200">|</span>
                            <span className="text-indigo-600 font-black">{meta.total}</span> entries
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(meta.page - 1)}
                                disabled={meta.page === 1 || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-100 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-all"
                            >
                                <FiChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => handlePageChange(meta.page + 1)}
                                disabled={meta.page === meta.pages || loading}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-30 transition-all"
                            >
                                <FiChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Sticky Filters Sidebar ── */}
                <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6 space-y-4">

                    <div className=" overflow-hidden">
                        {/* Sidebar Header */}
                        <div className="px-5 py-4 border-b border-neutral-50 bg-neutral-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiFilter size={14} className="text-indigo-500" />
                                <span className="text-[12px] font-black text-neutral-700 uppercase tracking-widest">Filters</span>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="text-[10px] font-bold text-rose-400 hover:text-rose-600 transition-colors uppercase tracking-wider"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="p-5 space-y-6">

                            {/* ① Filter by Time */}
                            <div>
                                <p className="text-[12px] font-bold mb-3 flex items-center gap-1.5">
                                    <FiClock size={11} />
                                    Filter by Time
                                </p>
                                <div className="space-y-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-400 ml-1">From</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-[12px] font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-400 ml-1">To</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-[12px] font-medium text-neutral-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[11px] font-bold  hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-neutral-50" />

                            {/* ② Filter by Event Type */}
                            <div>
                                <p className="text-[12px] font-bold mb-3 flex items-center gap-1.5">
                                    <FiActivity size={11} />
                                    Filter by Event Type
                                </p>
                                <div className="space-y-0.5">
                                    {EVENT_TYPES.map((evt) => (
                                        <FilterCheckbox
                                            key={evt.value}
                                            checked={selectedEventTypes.includes(evt.value)}
                                            onChange={() => {
                                                toggleEventType(evt.value);
                                            }}
                                            label={evt.label}
                                            color={evt.color}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-neutral-50" />

                            {/* ③ Filter by Platform */}
                            <div>
                                <p className="text-[12px] font-bold  mb-3 flex items-center gap-1.5">
                                    <FiGlobe size={11} />
                                    Filter by Platform
                                </p>
                                {activePlatforms.length === 0 ? (
                                    <p className="text-[11px] text-neutral-300 font-medium">No platforms available.</p>
                                ) : (
                                    <div className="space-y-0.5">
                                        {activePlatforms.map((platform) => {
                                            const slug = platform.slug || platform._id || platform.id;
                                            return (
                                                <FilterCheckbox
                                                    key={slug}
                                                    checked={selectedPlatforms.includes(slug)}
                                                    onChange={() => togglePlatform(slug)}
                                                    label={platform.name}
                                                    color="text-violet-600"
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Apply button (for event type + platform changes) */}
                            <button
                                onClick={handleApplyFilters}
                                className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-[11px] font-bold  hover:bg-neutral-800 transition-all shadow-md active:scale-[0.98]"
                            >
                                Apply All Filters
                            </button>
                        </div>
                    </div>

                    {/* Stats card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-600/20">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Records</p>
                        <p className="text-3xl font-black tracking-tight">{meta.total}</p>
                        <p className="text-[11px] opacity-60 font-medium mt-1">
                            {hasActiveFilters ? 'matching current filters' : 'all time entries'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;
