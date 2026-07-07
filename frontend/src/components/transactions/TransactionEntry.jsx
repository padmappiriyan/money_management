import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecordTransaction } from '../../queries/useTransactions';
import { useMyBalances } from '../../queries/useUserBalance';
import useSettings from '../../hooks/useSettings';
import { appendLedgerEntry } from '../../utils/excelLedgerStorage';

// Section Components
import SourceClassification from './sections/SourceClassification';
import ParticipantVerification from './sections/ParticipantVerification';
import FinancialComputation from './sections/FinancialComputation';

const TransactionEntry = ({ onComplete, ledger, initialPlatform }) => {
    const { mutate: recordTransaction, isPending: loading, error: errorObj, isSuccess: success, reset: resetTransactionStatus } = useRecordTransaction();
    const error = errorObj?.message;
    
    const isShiftClosed = ledger?.status === 'closed' || ledger?.status === 'locked';
    const isShiftNotOpen = !ledger?.status;
    const isLocked = isShiftClosed || isShiftNotOpen;

    const {
        activePlatforms,
        loadActivePlatforms,
    } = useSettings();

    const { data: myBalances = [] } = useMyBalances();

    const [formData, setFormData] = useState({
        platform: initialPlatform || '',
        type: 'send',
        senderName: '',
        receiverName: '',
        amount: '',
        currency: 'EUR',
        exchangeRate: 1.0,
        fees: 0,
        remarks: ''
    });

    const [totalPayout, setTotalPayout] = useState(0);

    useEffect(() => {
        loadActivePlatforms();
    }, [loadActivePlatforms]);

    // Calculate total payout in real-time
    useEffect(() => {
        const amount = parseFloat(formData.amount) || 0;
        const rate = parseFloat(formData.exchangeRate) || 0;
        const fees = parseFloat(formData.fees) || 0;
        const total = (amount * rate) + fees;
        setTotalPayout(total.toFixed(2));
    }, [formData.amount, formData.exchangeRate, formData.fees]);

    // EUR-only: exchange rate is always 1.0 — no LKR conversion needed

    // Handle form reset and status cleanup on success
    useEffect(() => {
        if (success) {
            appendLedgerEntry({
                platformKey: formData.platform,
                type: formData.type,
                amount: formData.amount,
                date: new Date(),
            });

            // balances are invalidated automatically

            setFormData({
                platform: '',
                type: 'send',
                senderName: '',
                receiverName: '',
                amount: '',
                currency: 'EUR',
                exchangeRate: 1.0,
                fees: 0,
                remarks: ''
            });
            const timer = setTimeout(() => {
                resetTransactionStatus();
                if (onComplete) onComplete(); // Return to history view
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, onComplete, resetTransactionStatus]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlatformSelect = (platformId) => {
        setFormData(prev => ({ ...prev, platform: platformId }));
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, type }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.platform) {
            alert('Selection Required: Please pick a platform to continue.');
            return;
        }

        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
            exchangeRate: parseFloat(formData.exchangeRate),
            fees: parseFloat(formData.fees)
        };

        recordTransaction(data);
    };

    const handleDiscard = () => {
        if (window.confirm('Discard this entry? All unsaved data will be lost.')) {
            setFormData({
                platform: '',
                type: 'send',
                senderName: '',
                receiverName: '',
                amount: '',
                currency: 'EUR',
                exchangeRate: 1.0,
                fees: 0,
                remarks: ''
            });
            resetTransactionStatus();
        }
    };

    const selectedPlatformData = myBalances.find(p => p.slug === formData.platform || p.platformId === formData.platform);

    return (
        <div className="md:p-4 space-y-12 animate-in fade-in duration-700">
            {/* 🛡️ Platform Liquidity Badge */}
            <AnimatePresence>
                {selectedPlatformData && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 px-6 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl w-fit"
                    >
                        <div className={`w-2 h-2 rounded-full ${selectedPlatformData.currentBalanceLkr < 10000 ? 'bg-rose-500 animate-pulse' : 'bg-brand-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            Your Personal {selectedPlatformData.name} Vault: 
                            <span className="text-neutral-900 ml-2">EUR (€) {selectedPlatformData.currentBalanceLkr?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* ── Top Grid (Modular Sections) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <SourceClassification
                        platform={formData.platform}
                        type={formData.type}
                        platformList={activePlatforms}
                        onPlatformSelect={handlePlatformSelect}
                        onTypeSelect={handleTypeSelect}
                        hidePlatformSelection={!!initialPlatform}
                    />

                    <ParticipantVerification
                        senderName={formData.senderName}
                        receiverName={formData.receiverName}
                        remarks={formData.remarks}
                        type={formData.type}
                        onChange={handleChange}
                    />

                </div>

                {/* ── Bottom Section (Modular Section) ── */}
                <FinancialComputation
                    currency={formData.currency}
                    amount={formData.amount}
                    exchangeRate={formData.exchangeRate}
                    fees={formData.fees}
                    totalPayout={totalPayout}
                    onChange={handleChange}
                />

                {/* ── Action Panel ── */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-8 pt-6 pb-20">
                    <button
                        type="button"
                        onClick={handleDiscard}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-rose-500 transition-colors"
                    >
                        <FiX size={18} /> Discard Protocol Entry
                    </button>

                    <motion.button
                        whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                        disabled={loading || isLocked}
                        type="submit"
                        className={`
                            flex items-center gap-4 px-12 py-5 rounded-2xl font-bold uppercase text-sm text-white shadow-2xl transition-all
                            ${loading ? 'bg-neutral-800 cursor-wait' : isLocked ? 'bg-neutral-300 cursor-not-allowed shadow-none' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'}
                        `}
                    >
                        {loading ? 'Successfully Saved...' : isLocked ? <><FiLock size={20} /> Shift Protocol Locked</> : <><FiCheckSquare size={20} /> Save & Lock Transaction</>}
                    </motion.button>
                </div>
            </form>

            {/* ── Global Feedback (Toast) ── */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 inset-x-0 mx-auto w-fit bg-neutral-900 text-white p-6 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-6 z-[200] border border-white/10"
                    >
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 font-bold">
                            <FiCheckCircle className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-tighter">DATA SECURED</p>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Node synchronized with institutional ledger</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mt-8 p-6 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center italic border border-rose-100 flex items-center justify-center gap-3 shadow-inner">
                    <FiInfo /> PROTOCOL EXCEPTION: {error}
                </div>
            )}

        </div>
    );
};

export default TransactionEntry;
