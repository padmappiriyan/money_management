import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FiGitPullRequest, FiSearch, FiFilter, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { useChangeRequests, useChangeRequestAnalytics } from '../../../queries/useChangeRequests';
import { useNavigate } from 'react-router-dom';

import ChangeRequestStats from '../../../components/admin/change-request/dashboard/ChangeRequestStats';
import ChangeRequestChart from '../../../components/admin/change-request/dashboard/ChangeRequestChart';
import ChangeRequestTable from '../../../components/admin/change-request/dashboard/ChangeRequestTable';

const ChangeRequestListPage = () => {
    const { userInfo } = useAuthContext();

    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: requestsResponse = {}, isPending: loading, refetch: refetchRequests } = useChangeRequests({ status: statusFilter });
    const requests = requestsResponse.requests || requestsResponse.data || [];
    
    const { data: analyticsResponse = {}, isPending: analyticsLoading, refetch: refetchAnalytics } = useChangeRequestAnalytics();
    const analytics = analyticsResponse.data || analyticsResponse || {};

    const navigate = useNavigate();

    const isAdmin = userInfo?.role === 'admin' || userInfo?.role === 'supervisor';

    const handleRefresh = () => {
        refetchRequests();
        refetchAnalytics();
    };

    const handleRowClick = (request) => {
        if (!request || request.status === 'approved') {
            // Disallow navigation for approved requests
            return;
        }

        navigate(`/dashboard/change-requests/${request.id || request._id}`);
    };

    const filteredRequests = requests.filter((req) => {
        const trxId = (req.transactionId?.id || req.transactionId?._id || '').toLowerCase();
        const requester = (req.requestedBy?.name || '').toLowerCase();
        return (
            trxId.includes(searchTerm.toLowerCase()) ||
            requester.includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-700">

            {/* ── Row 1: Page header ── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        Welcome back,{' '}
                        <span className="text-brand-600">{userInfo?.name?.split(' ')[0] || 'Admin'}!</span>
                    </h1>
                    <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                        <FiGitPullRequest className="text-brand-500" size={10} />
                        Integrity Control Dashboard
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        title="Refresh"
                        className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all"
                    >
                        <FiRefreshCw
                            size={14}
                            className={loading || analyticsLoading ? 'animate-spin' : ''}
                        />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 hover:border-slate-300 transition-all shadow-sm">
                        <FiCalendar size={12} className="text-slate-400" />
                        This Month
                        <span className="text-slate-300">▾</span>
                    </button>
                </div>
            </div>

            {/* ── Row 2: Chart (left) + 2×2 Stats grid (right) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* Left: Volume chart */}
                <ChangeRequestChart data={analytics?.chartData} loading={analyticsLoading} />

                {/* Right: 2×2 stat cards */}
                <ChangeRequestStats stats={analytics} loading={analyticsLoading} />
            </div>

            {/* ── Row 3: Full-width table with inline header ── */}
            <div className="flex flex-col gap-2">
                {/* Table toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        Change Requests
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Status tab pills */}
                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                            {[
                                { id: '', label: 'All' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'approved', label: 'Approved' },
                                { id: 'rejected', label: 'Rejected' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${statusFilter === tab.id
                                            ? 'bg-white text-brand-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <FiSearch
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={14}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all w-48"
                            />
                        </div>

                    </div>
                </div>

                {/* Table */}
                <ChangeRequestTable
                    requests={filteredRequests}
                    loading={loading}
                    onRowClick={handleRowClick}
                />
            </div>
        </div>
    );
};

export default ChangeRequestListPage;
