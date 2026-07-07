import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLedgerTransactions } from '../../../queries/useTransactions';
import { exportTransactions } from '../../../api/transactionApi';
import TransactionDetailModal from '../../../components/transactions/modals/TransactionDetailModal';
import SharedTransactionList from '../../../components/transactions/history/shared/SharedTransactionList';

const TransactionHistoryPage = () => {
    const { userInfo } = useAuthContext();
    const [timeRange, setTimeRange] = useState('all');

    const { data: listData = {}, isPending: listLoading } = useLedgerTransactions({ 
        range: timeRange, 
        pageNumber: 1, 
        pageSize: 50 
    });
    const list = listData?.transactions || listData?.data || [];

    const [selectedTx, setSelectedTx] = useState(null);


    const [isExporting, setIsExporting] = useState(false);
    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportTransactions({ range: timeRange });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            const prefix = userInfo?.role === 'admin' ? 'ADMIN' : (userInfo?.role === 'supervisor' ? 'SUP' : 'USER');
            link.setAttribute('download', `${prefix}_Audit_${timeRange}.xlsx`);
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
        <div className="px-4 py-2 md:px-8 mx-auto w-full">

            <main className="mt-8 animate-in fade-in duration-1000 h-[calc(100vh-120px)] pb-12">
                <SharedTransactionList 
                    transactions={list} 
                    loading={listLoading} 
                    timeRange={timeRange} 
                    setTimeRange={setTimeRange} 
                    onViewDetail={setSelectedTx} 
                    isAdmin={userInfo?.role === 'admin'} 
                    onExport={handleExport}
                    isExporting={isExporting}
                />
            </main>

            <AnimatePresence>
                {selectedTx && (
                    <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransactionHistoryPage;
