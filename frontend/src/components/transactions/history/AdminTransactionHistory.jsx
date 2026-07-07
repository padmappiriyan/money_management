import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLedgerTransactions, useTransactionStats } from '../../../queries/useTransactions';
import {
    FiDownload
} from 'react-icons/fi';

import { exportTransactions } from '../../../api/transactionApi';
import TransactionDetailModal from '../modals/TransactionDetailModal';
import SharedTransactionList from './shared/SharedTransactionList';
import TransactionSummaryCard from './shared/TransactionSummaryCard';
import QuickStatsGrid from './shared/QuickStatsGrid';

const AdminTransactionHistory = () => {
    const { data: listResponse = {}, isPending: listLoading } = useLedgerTransactions({ range: timeRange, pageNumber: 1, pageSize: 50 });
    const list = listResponse.transactions || listResponse.data || [];
    const { data: statsResponse = {}, isPending: statsLoading } = useTransactionStats({ range: timeRange });
    const stats = statsResponse.data || statsResponse || {};

    // Synchronize UI loading feel
    const dashboardLoading = listLoading || statsLoading;

    const [selectedTx, setSelectedTx] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportTransactions({ range: timeRange });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ADMIN_Audit_${timeRange}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-1000">
            {/* Top Row: Quick Multi-Metric Analysis */}
            <QuickStatsGrid stats={stats} loading={dashboardLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Mid-Row Left: Activity Summary (Balance Matrix Style) */}
                <div className="lg:col-span-5">
                    <TransactionSummaryCard stats={stats} loading={dashboardLoading} />
                </div>

                {/* Mid-Row Right: Transactions Ledger */}
                <div className="lg:col-span-7 flex flex-col">
                    <SharedTransactionList 
                        transactions={list} 
                        loading={dashboardLoading} 
                        timeRange={timeRange} 
                        setTimeRange={setTimeRange} 
                        onViewDetail={setSelectedTx} 
                        isAdmin={true} 
                        onExport={handleExport}
                        isExporting={isExporting}
                    />
                </div>
            </div>

            <AnimatePresence>
                {selectedTx && (
                    <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTransactionHistory;

