import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactionById } from '../../../queries/useTransactions';
import { useRequestChange } from '../../../queries/useChangeRequests';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import TransactionOverviewCard from '../../../components/change-request/TransactionOverviewCard';
import ModificationForm from '../../../components/change-request/ModificationForm';
import ProtocolSidebar from '../../../components/change-request/ProtocolSidebar';

const ChangeRequestPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: transactionResponse = {}, isPending: txLoading } = useTransactionById(id);
    const transaction = transactionResponse.data || transactionResponse;

    const { mutate: requestChange, isPending: crLoading, isSuccess: success, error: errorObj, reset: resetChangeRequestStatus } = useRequestChange();
    const error = errorObj?.message;

    useEffect(() => {
        if (success) {
            // Navigate back or show success state
            const timer = setTimeout(() => {
                resetChangeRequestStatus();
                navigate('/dashboard/change-requests');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate, resetChangeRequestStatus]);

const handleSubmit = (formData) => {
    requestChange({
        transactionId: id,
        field: formData.field,
        newValue: formData.newValue,
        reason: formData.reason
    });
};

    if (txLoading || !transaction) {
        return (
            <div className=" flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 bg-slate-200 rounded-3xl" />
                    <span className="text-[12px] font-black tracking-widest uppercase text-slate-400">Loading Transaction Data...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-5 lg:p-6 max-w-[1500px] mx-auto flex flex-col gap-8"
        >
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-600 tracking-widest uppercase transition-all mb-4 group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />   Back to History
                    </button>

                </div>
            </div>

            {/* ── Main Layout Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8 items-start">

                {/* ── Action Section (Left) ── */}
                <div className="flex flex-col gap-8">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-rose-600 font-bold text-sm flex items-center gap-4">
                            <span className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500 font-black">!</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-emerald-600 font-bold text-sm flex items-center gap-4">
                            <span className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500 font-black">✓</span>
                            Request submitted successfully. Redirecting...
                        </div>
                    )}

                    <ModificationForm
                        transaction={transaction}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(-1)}
                        loading={crLoading}
                    />
                </div>

                {/* ── Context & Audit Sidebar (Right) ── */}
                <div className="flex flex-col gap-8 sticky top-8">
                    <TransactionOverviewCard transaction={transaction} />
                    <ProtocolSidebar
                        auditTrail={[
                            { action: 'TRANSCATION CAPTURED', detail: 'Verified by System', time: 'Oct 24, 2023 | 14:25:00' },
                            { action: 'INITIAL CAPTURE', detail: `Agent: ${transaction.staffId?.name || 'Unknown'}`, time: format(new Date(transaction.createdAt), 'MMM dd, yyyy | HH:mm:ss') }
                        ]}
                    />
                </div>
            </div>

        </motion.div>
    );
};

export default ChangeRequestPage;
