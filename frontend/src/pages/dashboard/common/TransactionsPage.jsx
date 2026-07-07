/* 
import React, { useState, useEffect } from 'react';
import { FiClock, FiFileText, FiLock, FiAlertCircle } from 'react-icons/fi';
import TransactionHistory from '../../../components/transactions/TransactionHistory';
import TransactionStats from '../../../components/transactions/TransactionStats';
import { getLedgerStatus } from '../../../api/ledgerApi';

/**
 * TransactionsPage Component
 * 
 * Displays the main transactions ledger interface, including a header with
 * a toggle for history (currently hardcoded) and the TransactionHistory component.
 * /
const TransactionsPage = () => {
    // State to store ledger summary/status data
    const [ledger, setLedger] = useState(null);

    /**
     * Fetches the current ledger status for EUR currency
     * and updates the local state.
     * /
    const fetchLedger = async () => {
        try {
            const res = await getLedgerStatus({ currency: 'EUR' });
            setLedger(res.data);
        } catch (err) {
            console.error('Failed to fetch ledger:', err);
        }
    };

    // Fetch ledger data on component mount
    useEffect(() => {
        fetchLedger();
    }, []);

    return (
        <div className="px-4 py-2 md:px-8 mx-auto">

            {/* ── Page Header (Compacted for Single Window View) ── * /}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                <div>
                    {/* Main Title * /}
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter leading-none">Transactions <span className="text-brand-600">Ledger</span></h1>
                    {/* Subtitle / Node Description * /}
                    <p className="text-neutral-400 font-bold tracking-[0.2em] mt-2 text-[9px] uppercase italic opacity-80">Monitoring & Governance Node</p>
                </div>

                {/* Tab Switcher - currently contains only a static History button * /}
                <div className="flex bg-neutral-100 p-1.25 rounded-2xl border border-neutral-200">
                    <button
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all font-black text-[10px] tracking-widest bg-white text-[#00426d] shadow-lg shadow-neutral-200`}
                    >
                        <FiClock size={16} /> History
                    </button>
                </div>
            </div>

            {/* ── Active Content ── * /}
            <main className="mt-8">
                {/* Renders the history table/list of transactions * /}
                <TransactionHistory />
            </main>

        </div>
    );
};

export default TransactionsPage;
*/

const TransactionsPage = () => null;
export default TransactionsPage;

