import { useEffect, useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FiUserPlus, FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserStats } from '../../../api/userApi';
import StatCircles from '../../../components/dashboard/StatCircles';
import UserRoleBarChart from '../../../components/dashboard/UserRoleBarChart';

//toast message
import toast from 'react-hot-toast';

// Specialized Hook
import useUsers from '../../../hooks/useUsers';

// Modular Components
import UserCreationModal from '../../../components/users/UserCreationModal';
import UserDirectoryFilters from '../../../components/users/UserDirectoryFilters';
import UserTableHeader from '../../../components/users/UserTableHeader';
import UserTableRow from '../../../components/users/UserTableRow';
import UserPagination from '../../../components/users/UserPagination';
import DeleteUserModal from '../../../components/users/DeleteUserModal';
import BulkUploadModal from '../../../components/users/BulkUploadModal';
import { FiUpload } from 'react-icons/fi';

const UsersPage = () => {
    // 1. Hook State & Methods
    const { users, pagination, isLoading, fetchUsers, handleToggleStatus, error: hookError } = useUsers();
    const { userInfo } = useAuthContext();

    // 2. Local UI State
    const [showForm, setShowForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [localError, setLocalError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, user: null });
    const [stats, setStats] = useState({ admin: 0, supervisor: 0, user: 0, total: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    // 3. Derived State
    const displayError = localError || hookError;

    // 4. Effects
    const fetchStats = async () => {
        try {
            const data = await getUserStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load system stats', error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchUsers({ page: 1, search: searchTerm, role: filter });
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, filter, fetchUsers]);

    // 5. Handlers
    const handlePageChange = (newPage) => {
        fetchUsers({ page: newPage, search: searchTerm, role: filter });
    };

    const onUpdateStatus = async (userId, newStatus) => {
        setLocalError(null);
        try {
            await handleToggleStatus(userId, newStatus);
            fetchStats();
        } catch (err) {
            toast.error('Failed to update user status');
            // Error managed by hook context
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const deletedUserName = confirmDelete.user?.name || 'User';
            // Consolidated to use handleToggleStatus with 'deleted' status
            await handleToggleStatus(confirmDelete.user.id || confirmDelete.user._id, 'deleted');
            setConfirmDelete({ isOpen: false, user: null });
            toast.success(`User ${deletedUserName} deleted successfully`);
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete user');
            setConfirmDelete({ isOpen: false, user: null });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        User <span className="text-brand-600 font-display">Management</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Managing {pagination.total} administrative and regular accounts.
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 font-medium">
                        Control access levels, audit permissions, and manage staff credentials for the entire organization.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowForm(true)}
                        className="h-10 px-6 rounded-xl text-sm font-bold flex items-center gap-2 bg-brand-600 text-white shadow-md shadow-brand-100 hover:bg-brand-700 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
                    >
                        <FiUserPlus size={16} />
                        Add New User
                    </button>

                    <button
                        onClick={() => setShowBulkUpload(true)}
                        className="h-10 px-6 rounded-xl text-sm font-bold flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 transition-all duration-300 shadow-sm whitespace-nowrap"
                    >
                        <FiUpload size={16} />
                        Bulk Upload
                    </button>

                    <button
                        onClick={() => fetchUsers({ page: pagination.page, search: searchTerm, role: filter })}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:shadow-md transition-all duration-300 active:rotate-180 shadow-sm"
                        title="Refresh List"
                    >
                        <FiRefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* ── Statistics Overview ── */}
            <div className="overflow-hidden relative group py-6 px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 relative z-10">
                    {/* Left: Stat Circles */}
                    <div className="lg:col-span-8 flex flex-col gap-5 group/bar">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase">Account <span className="text-brand-600">Dynamics</span></h3>
                            <div className="h-[1px] flex-1 bg-slate-100" />
                        </div>
                        <StatCircles stats={stats} loading={statsLoading} />
                    </div>

                    {/* Right: Small Bar Chart */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all duration-500 group/bar">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Distribution</h4>
                            <FiRefreshCw size={10} className="text-slate-300 group-hover/bar:rotate-180 transition-transform duration-700" />
                        </div>
                        <UserRoleBarChart stats={stats} loading={statsLoading} />
                    </div>
                </div>
            </div>

            {/* ── Error Notification ── */}
            <AnimatePresence>
                {displayError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center justify-between gap-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <FiAlertCircle size={20} />
                            <p className="text-sm font-bold tracking-tight">{displayError}</p>
                        </div>
                        <button onClick={() => setLocalError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                            <FiRefreshCw size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Search & Filters ── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="relative group max-w-md w-full">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 pl-12 pr-6 rounded-2xl bg-white border border-neutral-100 shadow-sm placeholder:text-neutral-300 text-sm font-medium focus:ring-4 focus:ring-brand-50/50 outline-none transition-all duration-300 w-full"
                    />
                </div>

                <UserDirectoryFilters currentFilter={filter} onFilterChange={setFilter} />
            </div>

            {/* ── Users Table ── */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <UserTableHeader />
                        <tbody className="divide-y divide-slate-100 px-2">
                            {isLoading && users.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-6 h-16 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <UserTableRow
                                        key={user.id || user._id}
                                        user={user}
                                        isSelf={userInfo?.id === (user.id || user._id)}
                                        onUpdateStatus={onUpdateStatus}
                                        onDeleteClick={() => setConfirmDelete({ isOpen: true, user })}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 shadow-inner">
                                                <FiAlertCircle size={24} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No users found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <UserPagination pagination={pagination} onPageChange={handlePageChange} />
            </div>

            {/* ── Modals ── */}
            <UserCreationModal

                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={() => {
                    setTimeout(() => setShowForm(false), 2000);
                    fetchUsers({ page: 1, role: filter });
                    fetchStats();
                }}
            />

            <DeleteUserModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, user: null })}
                user={confirmDelete.user}
                onConfirm={handleDeleteConfirm}
            />

            <BulkUploadModal
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
                onSuccess={() => {
                    // Logic for success can be added here if needed
                }}
            />
        </div>
    );
};

export default UsersPage;
