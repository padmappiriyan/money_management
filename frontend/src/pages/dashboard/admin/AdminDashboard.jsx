import { useState, useEffect, useRef, useMemo } from 'react';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
    addMonths,
    subMonths,
} from 'date-fns';
import ExcelPlatformTable from '../../../components/excel/ExcelPlatformTable';
import { sortPlatformsByKnownOrder } from '../../../utils/platformStyles';
import { getPlatformKey } from '../../../utils/excelLedger';
import {
    loadLedgerTableDataForAllUsers,
    loadLedgerTableDataForUser,
    LEDGER_UPDATED_EVENT,
    syncLedgerWithBackendTransactionsForUser
} from '../../../utils/excelLedgerStorage';
import { getTransactions } from '../../../api/transactionApi';
import { BarChart2, Zap, Users, Search } from 'lucide-react';
import { getUserStats, getAllUsers } from '../../../api/userApi';
import CircularRoleChart, { ChartLegend } from '../../../components/dashboard/CircularRoleChart';
import SelectDropdown from '../../../components/common/SelectDropdown';
import StatCircles from '../../../components/dashboard/StatCircles';
import AdminOverviewMetrics from '../../../components/dashboard/AdminOverviewMetrics';
// import PlatformDistributionChart from '../../../components/dashboard/admin/PlatformDistributionChart';
import AdminFilterPanel from '../../../components/dashboard/admin/AdminFilterPanel';
import UserLedgerTable from '../../../components/dashboard/admin/UserLedgerTable';
import UserReconciliationHistory from '../../../components/dashboard/admin/UserReconciliationHistory';
import { getGlobalPlatformBalances } from '../../../api/userBalanceApi';
import { useAllUsersBalances } from '../../../queries/useUserBalance';
import useSettings from '../../../hooks/useSettings';

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

const ALL_USERS_MOCK = {
    id: 'ALL_USERS_SPECIAL_ID',
    name: 'All Users (Total)',
    email: 'Aggregated view for active users',
    status: 'active'
};

const AdminDashboard = ({ userInfo }) => {
    const { loadActivePlatforms, activePlatforms } = useSettings();

    const [stats, setStats] = useState({ admin: 0, supervisor: 0, user: 0, total: 0 });
    const [globalBalances, setGlobalBalances] = useState(null);
    const [loading, setLoading] = useState(true);

    // Excel spreadsheet state
    const [selectedMonths, setSelectedMonths] = useState({});
    const [tableData, setTableData] = useState({});
    const [selectedUser, setSelectedUser] = useState(ALL_USERS_MOCK);
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);


    const [filters, setFilters] = useState({
        page: 1,
        name: '',
        email: '',
        role: 'all',
        status: 'all',
        broughtFwd: null,
        totalSend: null,
        totalPaid: null,
        totalDeposit: null,
        netBalance: null,
        lastUpdated: '',
        platformId: 'all',
        updatedFrom: '',
        updatedTo: ''
    });

    const isFirstRender = useRef(true);

    const { data: allUsersResponse = {}, isPending: allUsersLoading } = useAllUsersBalances({ ...filters, size: 50 });
    const allUsersBalances = allUsersResponse.data || [];
    const allUsersPagination = allUsersResponse.pagination || {};

    const syncUserLedgerFromDb = async (user) => {
        if (!user || user.id === 'ALL_USERS_SPECIAL_ID') return;
        try {
            const response = await getTransactions({ staffId: user.id || user._id, pageSize: 1000 });
            if (response && response.success && response.data) {
                syncLedgerWithBackendTransactionsForUser(user, response.data);
            }
        } catch (error) {
            console.error('Failed to sync user ledger from DB:', error);
        }
    };

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
    }, [selectedUser, allUsers]);

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

    const excelPlatforms = useMemo(
        () => sortPlatformsByKnownOrder(activePlatforms).slice(0, 3),
        [activePlatforms]
    );

    const dropdownOptions = useMemo(() => {
        const optionsList = [
            { value: 'ALL_USERS_SPECIAL_ID', label: 'All Users (Total)' }
        ];

        const activeItems = allUsers
            .filter(u => u.status !== 'inactive')
            .map(u => ({ value: u.id || u._id, label: u.name || u.email }));

        if (activeItems.length > 0) {
            optionsList.push({
                group: 'Active Users',
                items: activeItems
            });
        }

        const inactiveItems = allUsers
            .filter(u => u.status === 'inactive')
            .map(u => ({ value: u.id || u._id, label: `${u.name || u.email} (Inactive)` }));

        if (inactiveItems.length > 0) {
            optionsList.push({
                group: 'Inactive Users',
                items: inactiveItems
            });
        }

        return optionsList;
    }, [allUsers]);

    useEffect(() => {
        fetchInitialData();
        loadActivePlatforms();
        // Initial load
        isFirstRender.current = false;
    }, []);

    // Automatic filtering when dropdowns change
    useEffect(() => {
        if (isFirstRender.current) return;
        applyFilters(1);
    }, [filters.role, filters.status, filters.platformId, filters.updatedFrom, filters.updatedTo]);

    const fetchInitialData = async () => {
        try {
            const statsRes = await getUserStats();
            setStats(statsRes);

            const balanceRes = await getGlobalPlatformBalances();
            setGlobalBalances(balanceRes);

            // Fetch users for selector
            setUsersLoading(true);
            const usersData = await getAllUsers({ limit: 200 });
            const users = (usersData.users || []).filter(u => u.role !== 'admin' || u.id === userInfo?.id);
            setAllUsers(users);
        } catch (error) {
            console.error('Failed to fetch initial admin data:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const applyFilters = (page = 1) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handlePageChange = (newPage) => {
        applyFilters(newPage);
    };

    const handleClearFilters = () => {
        const cleared = {
            name: '',
            email: '',
            role: 'all',
            status: 'all',
            broughtFwd: null,
            totalSend: null,
            totalPaid: null,
            totalDeposit: null,
            netBalance: null,
            lastUpdated: '',
            platformId: 'all',
            updatedFrom: '',
            updatedTo: '',
            page: 1
        };
        setFilters(cleared);
    };



    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* ── Admin Overview Metrics ── */}
            {/* ── Section 1: Financial Intelligence & Core Metrics ── */}
            <section className="px-1">
                <AdminOverviewMetrics
                    totalUsers={stats.total}
                    data={globalBalances ? {
                        broughtFwd: globalBalances.totalOpeningBalance,
                        totalSend: globalBalances.totalSend,
                        totalDeposit: globalBalances.totalDeposit,
                        totalPaid: globalBalances.totalPaid,
                        platformNet: globalBalances.totalCurrentBalance
                    } : {}}
                />
            </section>

            {/* ── Excel Workspace Section ── */}
            <section className="px-1">
                {/* Selector Bar */}
                <div className="flex items-center justify-between bg-white px-4 py-4 rounded-xl border border-neutral-200 shadow-sm mb-4">
                    <div className="flex items-center gap-2">
                        <Users size={15} className="text-slate-400" />
                        <span className="text-[10px] font-bold uppercase text-brand-800  mr-1">Select Users:</span>
                        <SelectDropdown
                            value={selectedUser?.id || selectedUser?._id || 'ALL_USERS_SPECIAL_ID'}
                            onChange={(val) => {
                                if (val === 'ALL_USERS_SPECIAL_ID') {
                                    setSelectedUser(ALL_USERS_MOCK);
                                } else {
                                    const found = allUsers.find(u => (u.id || u._id) === val);
                                    if (found) setSelectedUser(found);
                                }
                            }}
                            options={dropdownOptions}
                            className="w-56"
                        />
                    </div>
                    {selectedUser && selectedUser.id !== 'ALL_USERS_SPECIAL_ID' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected User:</span>
                            <span className="text-[11px] font-black text-slate-700">{selectedUser.name}</span>
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{selectedUser.email}</span>
                        </div>
                    )}
                </div>

                {/* Grid of Excel platform tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                    {excelPlatforms.map((platform) => {
                        const platformKey = getPlatformKey(platform);
                        const platformMonth = selectedMonths[platformKey] || startOfMonth(new Date());
                        const pMonthKey = format(platformMonth, 'yyyy-MM');
                        const rows = tableData[platformKey]?.[pMonthKey] || buildMonthRows(platformMonth);

                        return (
                            <ExcelPlatformTable
                                key={platformKey}
                                platform={platform}
                                rows={rows}
                                onRowChange={() => {}} // Read-only representation on dashboard
                                selectedMonth={platformMonth}
                                onPrevMonth={() => setSelectedMonths((prev) => ({ ...prev, [platformKey]: subMonths(platformMonth, 1) }))}
                                onNextMonth={() => setSelectedMonths((current) => ({ ...current, [platformKey]: addMonths(platformMonth, 1) }))}
                                readOnly={true}
                            />
                        );
                    })}
                </div>

                {/* Past Reconciliation Records Table */}
                {selectedUser && (
                    <div className="mt-4">
                        <UserReconciliationHistory userId={selectedUser?.id || selectedUser?._id} />
                    </div>
                )}
            </section>

            {/* ── Section 2: Platform Distribution Analytics (hidden for now) ── */}
            {/* <div className="px-1">
                <PlatformDistributionChart />
            </div> */}

            {/* ── Combined Filter & User Ledger Panel ── */}
            <section className="px-1 mt-8">
                <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden">
                    <AdminFilterPanel
                        filters={filters}
                        setFilters={setFilters}
                        onApply={() => applyFilters(1)}
                        onClear={handleClearFilters}
                        platforms={activePlatforms}
                        embedded={true}
                    />
                    <UserLedgerTable
                        data={allUsersBalances}
                        loading={allUsersLoading}
                        pagination={allUsersPagination}
                        onRefresh={() => applyFilters(1)}
                        onPageChange={handlePageChange}
                        embedded={true}
                    />
                </div>
            </section>

            {/* ── New Minimal Stat Circles ── */}
            {/* <section className="p-10 mx-1">
                <StatCircles stats={stats} loading={loading} />
            </section> */}

            {/* ── Visual Insight Section ── */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                <div className="lg:col-span-5 bg-white rounded-[3.5rem] border border-neutral-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[480px] group transition-all hover:shadow-lg">
                    <div className="w-full mb-10">
                        <h3 className="text-xl font-bold flex items-center gap-3 tracking-tight">
                            <BarChart2 size={24} className="text-brand-600" /> Infrastructure Balance
                        </h3>
                        <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Normalized Role Ratios</p>
                    </div>

                    <CircularRoleChart stats={stats} loading={loading} />
                    <ChartLegend stats={stats} />
                </div>
            </div> */}
        </div>
    );
};

export default AdminDashboard;
