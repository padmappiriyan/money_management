import { useEffect, useState, useCallback } from 'react';
import {
    FiActivity, FiLogIn, FiLogOut, FiUserPlus, FiLock, FiShield,
    FiSettings, FiSearch, FiRefreshCw, FiChevronDown, FiClock, FiUser, FiInfo, FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useActivities from '../../../hooks/useActivities';
import useAuthRoles from '../../../hooks/useAuthRoles';
import { getAllUsers } from '../../../api/userApi';

const getActionMeta = (type) => {
    const actionMap = {
        'LOGIN': { icon: FiLogIn, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        'LOGOUT': { icon: FiLogOut, color: 'text-neutral-500', bg: 'bg-neutral-50' },
        'USER_CREATE': { icon: FiUserPlus, color: 'text-brand-600', bg: 'bg-brand-50' },
        'USER_UPDATE': { icon: FiShield, color: 'text-amber-600', bg: 'bg-amber-50' },
        'PASSWORD_CHANGE': { icon: FiLock, color: 'text-red-500', bg: 'bg-red-50' },
        'REFRESH_TOKEN': { icon: FiRefreshCw, color: 'text-blue-500', bg: 'bg-blue-50' }
    };
    return actionMap[type] || { icon: FiActivity, color: 'text-neutral-400', bg: 'bg-neutral-50' };
};

const ActivityPage = () => {
    const { isAdminOrSupervisor } = useAuthRoles();
    const { activities, pagination, isLoading, fetchActivities } = useActivities();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState('ALL');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [usersList, setUsersList] = useState([]);

    const actionFilters = isAdminOrSupervisor 
        ? ['ALL', 'LOGIN', 'LOGOUT', 'USER_CREATE', 'RATE_UPDATE', 'USER_UPDATE', 'PASSWORD_CHANGE']
        : ['ALL', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE'];

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = { page: 1, search: searchTerm, userId: selectedUserId };
            if (selectedAction !== 'ALL') params.actionType = selectedAction;
            fetchActivities(params);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedAction, selectedUserId, fetchActivities]);

    useEffect(() => {
        if (isAdminOrSupervisor) {
            getAllUsers({ limit: 100 }).then(data => setUsersList(data.users || []));
        }
    }, [isAdminOrSupervisor]);

    const handleLoadMore = () => {
        if (pagination.page < pagination.totalPages) {
            const params = { page: pagination.page + 1, search: searchTerm, userId: selectedUserId };
            if (selectedAction !== 'ALL') params.actionType = selectedAction;
            fetchActivities(params);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* ── Left Column: Role-Based Info ── */}
                <div className="lg:col-span-4 space-y-10 pt-4">
                    <div className="rounded-[3rem] border border-neutral-100 p-10 relative overflow-hidden group transition-all duration-700 hover:border-brand-200/50">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50/20 blur-[100px] -z-10 rounded-full" />
                        <div className="space-y-8">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm border border-brand-100 animate-pulse">
                                <FiActivity size={32} />
                            </div>
                            <div className="space-y-4 ">
                                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter leading-tight">
                                    {isAdminOrSupervisor ? 'System' : 'My Activity'}
                                    <span className="text-brand-600"> Logs</span>
                                </h1>
                                <div className="w-12 h-1.5 bg-brand-600 rounded-full" />
                            </div>
                            <div className="space-y-6 text-sm font-medium text-neutral-500 leading-relaxed">
                                <p>
                                    {isAdminOrSupervisor 
                                        ? 'Monitor all system events, including authentication activity and configuration changes in real-time.' 
                                        : 'Review your session history and critical account actions to ensure the highest level of security.'
                                    }
                                </p>
                                <p>
                                    {isAdminOrSupervisor 
                                        ? 'This timeline provides a full forensic trail of administrative and user actions across the platform.'
                                        : 'Only you can see this timeline, reflecting your individual footprint on the system.'
                                    }
                                </p>
                            </div>
                            <div className="pt-4 border-t border-neutral-50">
                                <span className="text-[10px] font-black uppercase text-neutral-300 flex items-center gap-3">
                                    <FiShield className="text-brand-500" /> 
                                    {isAdminOrSupervisor ? 'Administrative Console' : 'Secure User Environment'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column: Timeline & Filters ── */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="relative group flex-1">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-600 z-10" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-11 pl-12 pr-6 rounded-2xl bg-white border border-neutral-100 shadow-sm font-bold focus:ring-4 focus:ring-brand-50/30 outline-none w-full text-sm"
                                />
                            </div>
                            {isAdminOrSupervisor && (
                                <select 
                                    value={selectedUserId} 
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="h-11 px-4 rounded-xl border border-neutral-100 bg-white text-xs font-black text-neutral-600 outline-none appearance-none pr-10 relative cursor-pointer shadow-sm"
                                >
                                    <option value="">All Users</option>
                                    {usersList.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                            {actionFilters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setSelectedAction(filter)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                        ${selectedAction === filter ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'text-neutral-400 hover:bg-neutral-50'}
                                    `}
                                >
                                    {filter.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-12 w-[2px] bg-gradient-to-b from-brand-600/30 via-neutral-100 to-transparent z-0" />
                        <div className="space-y-16 lg:space-y-8 relative z-10">
                            <AnimatePresence mode="popLayout">
                                {activities.length > 0 ? (
                                    activities.map((log, index) => {
                                        const meta = getActionMeta(log.actionType);
                                        const isEven = index % 2 === 0;
                                        return (
                                            <motion.div
                                                key={log._id || index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: index % 10 * 0.05 }}
                                                className={`flex flex-col lg:flex-row w-full items-start lg:items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                                            >
                                                <div className="w-full lg:w-[45%] pl-14 lg:pl-0">
                                                    <div className={`p-4 rounded-[2rem] bg-white border border-neutral-100 shadow-md hover:shadow-xl transition-all duration-500 group relative ${isEven ? 'lg:mr-8' : 'lg:ml-8'}`}>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`p-2 rounded-xl ${meta.bg} ${meta.color}`}>
                                                                    <meta.icon size={16} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-neutral-300 uppercase ">
                                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">
                                                                    {log.actionType.replace('_', ' ')}
                                                                </h4>
                                                                <p className="text-[12px] font-bold text-neutral-400 leading-relaxed ">
                                                                    "{log.description}"
                                                                </p>
                                                                
                                                                {/* Render Bulk Upload Errors if present */}
                                                                {log.details?.type === 'BULK_UPLOAD' && log.details.failedCount > 0 && (
                                                                    <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-100/50">
                                                                        <p className="text-[10px] font-black uppercase text-rose-600 mb-2 flex items-center gap-2">
                                                                            <FiAlertCircle size={12} /> Failure Details ({log.details.failedCount})
                                                                        </p>
                                                                        <ul className="space-y-1">
                                                                            {log.details.errors?.map((err, idx) => (
                                                                                <li key={idx} className="text-[10px] font-bold text-rose-500 list-disc list-inside">
                                                                                    {err}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 pt-3 border-t border-neutral-50">
                                                                <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center font-black text-[9px] text-brand-600 uppercase">
                                                                    {log.user?.name?.charAt(0) || 'S'}
                                                                </div>
                                                                <span className="text-[11px] font-bold text-neutral-400">{log.user?.name || 'System'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 top-10 lg:top-auto w-4 h-4 rounded-full bg-white border-4 border-brand-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] z-20 group-hover:scale-125 transition-transform" />
                                                <div className={`hidden lg:flex w-[45%] items-center ${isEven ? 'pl-10 justify-start' : 'pr-10 justify-end'}`}>
                                                    <div className="bg-gradient-to-r from-brand-600 to-violet-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-lg shadow-brand-100/50">
                                                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : !isLoading && (
                                    <div className="py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 mx-auto mb-6">
                                            <FiInfo size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-neutral-400 italic">No activity logs matching these filters.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8">
                        {isLoading ? (
                            <FiRefreshCw className="animate-spin text-brand-600" />
                        ) : (pagination?.page < pagination?.totalPages) && (
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 rounded-2xl bg-white border border-neutral-100 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
                            >
                                Fetch Older Logs
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;
