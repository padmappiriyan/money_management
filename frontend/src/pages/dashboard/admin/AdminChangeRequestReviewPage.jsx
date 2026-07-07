import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useChangeRequestById, useApproveRequest, useRejectRequest } from '../../../queries/useChangeRequests';

import { AnimatePresence } from 'framer-motion';
import { FiInfo, FiActivity, FiFileText, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Sub-components
import ReviewHeader from '../../../components/admin/change-request/ReviewHeader';
import ReviewTabs from '../../../components/admin/change-request/ReviewTabs';
import OverviewTab from '../../../components/admin/change-request/OverviewTab';
import ActionItemsTab from '../../../components/admin/change-request/ActionItemsTab';
import ActivityTimeline from '../../../components/admin/change-request/ActivityTimeline';

const TABS = [
    { id: 'overview', label: 'OVERVIEW', icon: <FiInfo size={14} /> },
    { id: 'action', label: 'ACTION ITEMS', icon: <FiAlertCircle size={14} /> },
];

const AdminChangeRequestReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [remarks, setRemarks] = useState('');
    const { userInfo } = useAuthContext();
    const isAdmin = userInfo?.role === 'admin' || userInfo?.role === 'supervisor';

    const { data: requestResponse = {}, isPending: loading } = useChangeRequestById(id);
    const request = requestResponse.data || requestResponse;

    const { mutate: approve, isPending: approveLoading, isSuccess: approveSuccess, error: approveError, reset: resetApprove } = useApproveRequest();
    const { mutate: reject, isPending: rejectLoading, isSuccess: rejectSuccess, error: rejectError, reset: resetReject } = useRejectRequest();
    
    const actionLoading = approveLoading || rejectLoading;
    const success = approveSuccess || rejectSuccess;
    const error = approveError?.message || rejectError?.message;

    useEffect(() => {
        if (success && !loading) {
            toast.success('Request processed successfully');
            resetApprove();
            resetReject();
            navigate('/dashboard/change-requests');
        }
        if (error) {
            toast.error(error);
            resetApprove();
            resetReject();
        }
    }, [success, error, loading, navigate, resetApprove, resetReject]);

    const handleApprove = () => approve({ id, adminRemarks: remarks });

    const handleReject = () => {
        if (!remarks) {
            toast.error('Please provide remarks for rejection');
            return;
        }
        reject({ id, adminRemarks: remarks });
    };

    if (loading || !request) {
        return (
            <div className="flex items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                        <FiActivity className="text-brand-600 animate-spin" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Synchronizing Audit Data...</span>
                </div>
            </div>
        );
    }

    const transaction = request.transactionId;

    return (
        <div className=" bg-[#F8FAFC] p-6 lg:p-10 flex flex-col gap-8">
            <ReviewHeader
                transaction={transaction}
                request={request}
                navigate={navigate}
            />

            <ReviewTabs
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={`grid gap-8 items-stretch ${activeTab === 'overview' ? 'grid-cols-1 lg:grid-cols-[1fr_340px]' : 'grid-cols-1'}`}>
                <AnimatePresence mode="wait">
                    <div key={activeTab} className="flex flex-col">
                        {activeTab === 'overview' && (
                            <OverviewTab request={request} transaction={transaction} />
                        )}

                        {activeTab === 'action' && (
                            <ActionItemsTab
                                request={request}
                                transaction={transaction}
                                remarks={remarks}
                                onRemarksChange={setRemarks}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                actionLoading={actionLoading}
                            />
                        )}
                    </div>
                </AnimatePresence>

                {activeTab === 'overview' && (
                    <ActivityTimeline request={request} transaction={transaction} />
                )}
            </div>
        </div>
    );
};

export default AdminChangeRequestReviewPage;
