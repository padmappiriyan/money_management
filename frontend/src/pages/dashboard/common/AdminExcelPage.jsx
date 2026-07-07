import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FiFileText, FiSearch, FiUser, FiUsers, FiRefreshCw } from 'react-icons/fi';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
    addMonths,
    subMonths,
} from 'date-fns';
import { useAuthContext } from '../../../contexts/AuthContext';
import useSettings from '../../../hooks/useSettings';
import ExcelPlatformTable from '../../../components/excel/ExcelPlatformTable';
import ExcelEntryForm from '../../../components/excel/ExcelEntryForm';
import UserReconciliationHistory from '../../../components/dashboard/admin/UserReconciliationHistory';
import { sortPlatformsByKnownOrder } from '../../../utils/platformStyles';
import {
    parseAmount,
    applyEntryToRow,
    findPlatformByValue,
    getPlatformKey,
    getFieldForEntryType,
} from '../../../utils/excelLedger';
import {
    loadLedgerTableData,
    loadLedgerTableDataForUser,
    loadLedgerTableDataForAllUsers,
    saveLedgerTableData,
    LEDGER_UPDATED_EVENT,
    syncLedgerWithBackendTransactionsForUser
} from '../../../utils/excelLedgerStorage';
import { getAllUsers } from '../../../api/userApi';
import { getTransactions } from '../../../api/transactionApi';
import toast from 'react-hot-toast';

const buildEmptyRow = (date) => ({
    date,
    dateKey: format(date, 'yyyy-MM-dd'),
    bf: '',
    send: '',
    paid: '',
    deposit: '',
    balance: 0,
});

const buildMonthRows = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return eachDayOfInterval({ start, end }).map(buildEmptyRow);
};

const getInitials = (name = '', email = '') => {
    if (name) {
        const parts = name.trim().split(' ');
        return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
    'bg-violet-100 text-violet-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-sky-100 text-sky-600',
    'bg-indigo-100 text-indigo-600',
];

const getAvatarColor = (str = '') => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const AdminExcelPage = () => {
    const { activePlatforms, loadActivePlatforms, loading } = useSettings();
    const { userInfo } = useAuthContext();

    // User list state
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Ledger state
    const [selectedMonths, setSelectedMonths] = useState({});
    const [tableData, setTableData] = useState({});

    const syncUserLedgerFromDb = useCallback(async (user) => {
        if (!user || user.id === 'ALL_USERS_SPECIAL_ID') return;
        try {
            const response = await getTransactions({ staffId: user.id || user._id, pageSize: 1000 });
            if (response && response.success && response.data) {
                syncLedgerWithBackendTransactionsForUser(user, response.data);
            }
        } catch (error) {
            console.error('Failed to sync user ledger from DB:', error);
        }
    }, []);

    // Reload ledger data whenever a different user is selected
    useEffect(() => {
        if (selectedUser) {
            if (selectedUser.id === 'ALL_USERS_SPECIAL_ID') {
                setTableData(loadLedgerTableDataForAllUsers(allUsers));
            } else {
                setTableData(loadLedgerTableDataForUser(selectedUser));
                syncUserLedgerFromDb(selectedUser);
            }
            setSelectedMonths({});
        } else {
            setTableData({});
        }
    }, [selectedUser, allUsers, syncUserLedgerFromDb]);

    useEffect(() => {
        const fetchUsers = async () => {
            setUsersLoading(true);
            try {
                const data = await getAllUsers({ limit: 200 });
                // Exclude admin accounts, show only regular users/supervisors
                const users = (data.users || []).filter(u => u.role !== 'admin' || u.id === userInfo?.id);
                setAllUsers(users);
            } catch (err) {
                toast.error('Failed to load users');
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, [userInfo?.id]);

    useEffect(() => {
        if (!selectedUser) return;
        const handleLedgerUpdate = () => {
            if (selectedUser.id === 'ALL_USERS_SPECIAL_ID') {
                setTableData(loadLedgerTableDataForAllUsers(allUsers));
            } else {
                setTableData(loadLedgerTableDataForUser(selectedUser));
            }
        };
        window.addEventListener(LEDGER_UPDATED_EVENT, handleLedgerUpdate);
        return () => window.removeEventListener(LEDGER_UPDATED_EVENT, handleLedgerUpdate);
    }, [selectedUser, allUsers]);

    useEffect(() => {
        loadActivePlatforms();
    }, [loadActivePlatforms]);

    const platforms = useMemo(
        () => sortPlatformsByKnownOrder(activePlatforms).slice(0, 3),
        [activePlatforms]
    );

    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return allUsers.filter(u =>
            u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        );
    }, [allUsers, searchQuery]);

    const activeUsers = filteredUsers.filter(u => u.status !== 'inactive');
    const inactiveUsers = filteredUsers.filter(u => u.status === 'inactive');

    const ALL_USERS_MOCK = {
        id: 'ALL_USERS_SPECIAL_ID',
        name: 'All Users (Total)',
        email: 'Aggregated view for active users',
        status: 'active'
    };

    const ensureMonthRows = useCallback((prev, platformId, monthDate) => {
        const key = format(monthDate, 'yyyy-MM');
        const existing = prev[platformId]?.[key];
        if (existing) return existing;
        return buildMonthRows(monthDate);
    }, []);

    useEffect(() => {
        if (!selectedUser) return;
        setTableData((prev) => {
            let changed = false;
            const next = { ...prev };
            platforms.forEach((platform) => {
                const platformKey = getPlatformKey(platform);
                const platformMonth = selectedMonths[platformKey] || startOfMonth(new Date());
                const pMonthKey = format(platformMonth, 'yyyy-MM');
                if (!next[platformKey]?.[pMonthKey]) {
                    next[platformKey] = {
                        ...(next[platformKey] || {}),
                        [pMonthKey]: buildMonthRows(platformMonth),
                    };
                    changed = true;
                }
            });
            // Do NOT write to localStorage here — this is read-only view of another user
            return next;
        });
    }, [platforms, selectedMonths, selectedUser]);

    const handleRowChange = useCallback((platformKey, dateKey, updatedRow) => {
        setTableData((prev) => {
            const entryDate = new Date(`${dateKey}T12:00:00`);
            const rowMonthKey = format(startOfMonth(entryDate), 'yyyy-MM');
            const next = {
                ...prev,
                [platformKey]: {
                    ...(prev[platformKey] || {}),
                    [rowMonthKey]: (prev[platformKey]?.[rowMonthKey] || []).map((row) =>
                        row.dateKey === dateKey ? updatedRow : row
                    ),
                },
            };
            saveLedgerTableData(next, { notify: false });
            return next;
        });
    }, []);

    const handleEntrySubmit = useCallback((formData) => {
        const platform = findPlatformByValue(platforms, formData.platform);
        if (!platform) { toast.error('Selected platform was not found.'); return false; }
        const amount = parseAmount(formData.amount);
        const field = getFieldForEntryType(formData.type);
        if (!field) return false;

        const platformKey = getPlatformKey(platform);
        const entryDate = formData.date ? new Date(`${formData.date}T12:00:00`) : new Date();
        const entryDateKey = format(entryDate, 'yyyy-MM-dd');
        const entryMonth = startOfMonth(entryDate);
        const entryMonthKey = format(entryMonth, 'yyyy-MM');

        setTableData((prev) => {
            const rows = ensureMonthRows(prev, platformKey, entryMonth).map((row) =>
                row.dateKey === entryDateKey ? applyEntryToRow(row, formData.type, amount) : row
            );
            const next = { ...prev, [platformKey]: { ...(prev[platformKey] || {}), [entryMonthKey]: rows } };
            saveLedgerTableData(next, { notify: false });
            return next;
        });

        const typeLabel = formData.type.charAt(0).toUpperCase() + formData.type.slice(1);
        toast.success(`${typeLabel} entry of €${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} added.`);
        return true;
    }, [platforms, ensureMonthRows, selectedMonths]);

    const isLoading = loading && platforms.length === 0;

    const UserListItem = ({ user }) => {
        const selectedId = selectedUser?.id || selectedUser?._id;
        const userId = user.id || user._id;
        const isSelected = !!(selectedUser && selectedId && userId && selectedId === userId);

        return (
            <button
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    isSelected
                        ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm'
                        : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                {user.name || 'No Name'}
            </button>
        );
    };

    return (
        <div className="px-4 py-2 md:px-8 mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                            <FiFileText size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tighter leading-none">
                            Excel <span className="text-brand-600">Workspace</span>
                        </h1>
                    </div>
                    <p className="text-neutral-400 font-bold text-[13px] opacity-80 mt-1">
                        Select a user to view and manage their platform ledger
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setSelectedMonths({})}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-600 transition-colors"
                >
                    <FiRefreshCw size={14} />
                    Reset Months
                </button>
            </div>

            {/* Split Panel Layout */}
            <div className="flex gap-4 h-[calc(100vh-200px)]">

                {/* ── LEFT: User List Panel ── */}
                <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-neutral-100 shadow-sm flex flex-col overflow-hidden">
                    {/* Panel Header */}
                    <div className="px-4 pt-5 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2 mb-3">
                            <FiUsers size={15} className="text-neutral-400" />
                            <h2 className="text-[13px] font-black text-neutral-700 uppercase tracking-widest">All Users</h2>
                        </div>
                        {/* Search */}
                        <div className="relative">
                            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 transition-all"
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-3 space-y-0.5">
                        {usersLoading ? (
                            <div className="space-y-2 px-2 pt-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 bg-neutral-50 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 py-2">Global</p>
                                <UserListItem user={ALL_USERS_MOCK} />
                                
                                {activeUsers.length > 0 && (
                                    <>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 py-2 mt-2">Active</p>
                                        {activeUsers.map(u => <UserListItem key={u.id || u._id} user={u} />)}
                                    </>
                                )}
                                {inactiveUsers.length > 0 && (
                                    <>
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-4 py-2 mt-2">Inactive</p>
                                        {inactiveUsers.map(u => <UserListItem key={u.id || u._id} user={u} />)}
                                    </>
                                )}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8 text-neutral-400 text-[12px] font-medium">
                                        No users found
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Ledger Panel ── */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {!selectedUser ? (
                        /* Empty State */
                        <div className="h-full bg-white rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center">
                                <FiUser size={28} className="text-neutral-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-[15px] font-bold text-neutral-500">Select a user to view their ledger</p>
                                <p className="text-[12px] text-neutral-400 font-medium mt-1">Click any user from the list on the left</p>
                            </div>
                        </div>
                    ) : (
                        /* Selected User's Ledger */
                        <div className="space-y-6">
                            {/* User Banner */}
                            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black ${getAvatarColor(selectedUser.email)}`}>
                                    {getInitials(selectedUser.name, selectedUser.email)}
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-neutral-800">{selectedUser.name || 'No Name'}</p>
                                    <p className="text-[12px] text-neutral-400 font-medium">{selectedUser.email}</p>
                                </div>
                                <span className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                                    selectedUser.status === 'inactive'
                                        ? 'bg-rose-50 text-rose-500 border-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                    {selectedUser.status || 'active'}
                                </span>
                            </div>

                            {/* Platform Tables */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-[420px] bg-neutral-50 animate-pulse rounded-2xl border border-neutral-100" />
                                    ))}
                                </div>
                            ) : platforms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center min-h-[280px] bg-white rounded-2xl border border-neutral-100">
                                    <p className="text-neutral-500 font-medium">No active platforms found.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-6">
                                        {platforms.map((platform) => {
                                            const platformKey = getPlatformKey(platform);
                                            const platformMonth = selectedMonths[platformKey] || startOfMonth(new Date());
                                            const pMonthKey = format(platformMonth, 'yyyy-MM');
                                            const rows = tableData[platformKey]?.[pMonthKey] || buildMonthRows(platformMonth);

                                            return (
                                                <ExcelPlatformTable
                                                    key={platformKey}
                                                    platform={platform}
                                                    rows={rows}
                                                    onRowChange={handleRowChange}
                                                    selectedMonth={platformMonth}
                                                    onPrevMonth={() => setSelectedMonths((prev) => ({ ...prev, [platformKey]: subMonths(platformMonth, 1) }))}
                                                    onNextMonth={() => setSelectedMonths((curr) => ({ ...curr, [platformKey]: addMonths(platformMonth, 1) }))}
                                                    readOnly={selectedUser.id === 'ALL_USERS_SPECIAL_ID'}
                                                />
                                            );
                                        })}
                                    </div>

                                    {selectedUser.id !== 'ALL_USERS_SPECIAL_ID' && (
                                        <div className="mb-4">
                                            <UserReconciliationHistory userId={selectedUser?.id || selectedUser?._id} />
                                        </div>
                                    )}

                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminExcelPage;
