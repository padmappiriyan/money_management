import React, { useState, useEffect } from 'react';
import { useAllUsersBalances } from '../../../queries/useUserBalance';
import { Search, Mail, Phone, User, MapPin, Loader2 } from 'lucide-react';
import { fetchUserPerformanceHistory } from '../../../api/reportsApi';
import AgentListItem from '../../../components/dashboard/admin/AgentListItem';
import UserPlatformBalances from '../../../components/dashboard/admin/UserPlatformBalances';
import UserSummarySidebar from '../../../components/dashboard/admin/UserSummarySidebar';
import UserLedgerExplorer from '../../../components/dashboard/admin/UserLedgerExplorer';
import UserReconciliationHistory from '../../../components/dashboard/admin/UserReconciliationHistory';

const UserRecordsPage = () => {
    const { data: allUsersResponse = {}, isPending: allUsersLoading } = useAllUsersBalances({ page: 1, size: 50 });
    const allUsersBalances = allUsersResponse.data || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);



    useEffect(() => {
        if (allUsersBalances.length > 0 && !selectedUser) {
            setSelectedUser(allUsersBalances[0]);
        }
    }, [allUsersBalances, selectedUser]);

    useEffect(() => {
        if (selectedUser) {
            loadUserHistory(selectedUser._id);
        }
    }, [selectedUser]);

    const loadUserHistory = async (userId) => {
        setHistoryLoading(true);
        try {
            const data = await fetchUserPerformanceHistory(userId);
            setHistoryData(data);
        } catch (error) {
            console.error('Failed to fetch user history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredUsers = allUsersBalances.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-brand-50 text-brand-600 border-brand-100',
            supervisor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            user: 'bg-slate-50 text-slate-500 border-slate-100'
        };
        const color = colors[role?.toLowerCase()] || colors.user;
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${color}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-6 -mt-2 animate-in fade-in duration-700 pb-10">
            {/* ── Page Header Description ── */}
            <div className="px-2 mb-10">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Records</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Monitor individual user accounts, track real-time platform balances, and analyze comprehensive financial performance history.
                </p>
            </div>

            {/* ── Top Row: Sidebar & Summary Cards ── */}
            <div className="flex flex-col lg:flex-row gap-6 shrink-0">
                {/* ── Left Sidebar: User List ── */}
                <div className="w-full lg:w-[340px] flex flex-col bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden shrink-0 h-[520px]">
                    <div className="p-6 border-b border-slate-100 bg-[#f8f9fc]">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-slate-900 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {allUsersLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <Loader2 className="text-brand-600 animate-spin" size={24} />
                                <p className="text-slate-400 font-medium text-xs">Loading Users...</p>
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all   cursor-pointer ${selectedUser?._id === user._id
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3 ">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border shadow-sm ${selectedUser?._id === user._id ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={`font-medium tracking-tight ${selectedUser?._id === user._id ? 'text-indigo-900' : 'text-slate-900'}`}>{user.name}</div>
                                                <div className="text-[10px] font-medium uppercase  text-slate-400">
                                                    {user.role?.toLowerCase() === 'user' ? 'Platform User' : user.role}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <div className="flex items-center gap-1.5 text-slate-500 truncate mr-2">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {user.status?.toLowerCase() === 'active' ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{user.status}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>{user.status || 'OFFLINE'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Middle Section: Platform Breakdown ── */}
                <UserPlatformBalances platformData={historyData} loading={historyLoading} />

                {/* ── Summary Cards Section (Now a Sidebar on the Right) ── */}
                <div className="w-full lg:w-[340px] shrink-0">
                    {selectedUser ? (
                        <UserSummarySidebar data={selectedUser} />
                    ) : (
                        <div className="w-full h-[520px] bg-white rounded-[24px] border border-dashed border-neutral-200 flex flex-col items-center justify-center p-8 text-center shadow-sm">
                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                                <User size={24} className="text-neutral-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">Select a user</h3>
                            <p className="text-neutral-300 text-[10px] uppercase tracking-widest mt-1">Metrics will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom Row: Full Width Ledger Explorer & History ── */}
            {selectedUser && (
                <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
                    <UserLedgerExplorer userId={selectedUser._id} />
                    <UserReconciliationHistory userId={selectedUser._id} />
                </div>
            )}
        </div>
    );
};

export default UserRecordsPage;
