import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBriefcase, FiSave, FiClock, FiAlertCircle, FiCheckCircle, FiPlus, FiMinus, FiCreditCard
} from 'react-icons/fi';
import { useAuthContext } from '../../contexts/AuthContext';
import { getLedgerStatus, saveReconciliation, fetchReconciliationHistory } from '../../api/ledgerApi';
import toast from 'react-hot-toast';

const DailyDrawerReconciliation = ({ isFinalized, isNotStarted, onSaveComplete }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [ledgerData, setLedgerData] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSavedLocally, setIsSavedLocally] = useState(false);

    const { userInfo } = useAuthContext();
    const userId = userInfo?._id || userInfo?.id || 'guest';
    const isAdmin = userInfo?.role === 'admin' || userInfo?.role === 'supervisor';

    // Form states
    const [formData, setFormData] = useState({
        actualClosing: '',
        cbAmount: 0, // C/B is read-only
        depositAmount: '',
        creditAmount: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const status = await getLedgerStatus();
            if (status.data) {
                setLedgerData(status.data);
                setFormData({
                    actualClosing: status.data.actualClosing || '',
                    cbAmount: status.data.cbAmount || 0,
                    depositAmount: status.data.depositAmount || '',
                    creditAmount: status.data.creditAmount || ''
                });
            }
            const hist = await fetchReconciliationHistory();
            setHistory(hist);
        } catch (error) {
            console.error("Failed to load reconciliation data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const todayIso = new Date().toISOString().split('T')[0];
        if (localStorage.getItem(`reconciled_${userId}_${todayIso}`) === 'true') {
            setIsSavedLocally(true);
        }
    }, [userId]);

    const handleChange = (e) => {
        setIsSavedLocally(false);
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : parseFloat(value)
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await saveReconciliation(formData);
            toast.success("Reconciliation saved successfully");
            
            // Refresh ledger data and history without repopulating the form inputs
            const status = await getLedgerStatus();
            if (status.data) {
                setLedgerData(status.data);
            }
            const hist = await fetchReconciliationHistory();
            setHistory(hist);

            // Reset form to default 0 state
            setFormData({
                actualClosing: '',
                cbAmount: 0,
                depositAmount: '',
                creditAmount: ''
            });
            setIsSavedLocally(true);
            const todayIso = new Date().toISOString().split('T')[0];
            localStorage.setItem(`reconciled_${userId}_${todayIso}`, 'true');
            
            if (onSaveComplete) {
                onSaveComplete();
            }
        } catch (error) {
            console.error("Failed to save reconciliation:", error);
            toast.error("Failed to save data");
        } finally {
            setSaving(false);
        }
    };

    // Calculation Logic
    const totalAmount = isSavedLocally ? 0 : (ledgerData?.totalTransactionNet || 0);
    const calculatedBalance = isSavedLocally ? 0 : ((Number(formData.actualClosing) || 0) + (Number(formData.depositAmount) || 0) - (Number(formData.creditAmount) || 0));
    const isReconciled = Math.abs(calculatedBalance - totalAmount) < 0.01;

    const formatCurrency = (val) => {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (loading && !ledgerData) {
        return (
            <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-xl animate-pulse">
                <div className="h-8 w-48 bg-slate-100 rounded-lg mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-40 bg-slate-50 rounded-2xl" />
                    <div className="h-40 bg-slate-50 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Main Reconciliation Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/30 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-brand-600 rounded-xl text-white">
                                    <FiBriefcase size={20} />
                                </div>
                                Daily Drawer Reconciliation
                            </h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">
                                Balance your physical cash with transaction records for {new Date().toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            <FiClock />
                            {showHistory ? "Hide History" : "View History"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT: Inputs */}
                        <div className={`space-y-6 ${isAdmin ? 'lg:col-span-7' : 'lg:col-span-12 max-w-3xl mx-auto w-full'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cash in Hand */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-slate-600 ml-1">Cash (In Hand)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[10px] font-black text-slate-400 group-focus-within:text-brand-500 transition-colors">
                                            EUR (€)
                                        </div>
                                        <input
                                            type="number"
                                            name="actualClosing"
                                            value={formData.actualClosing}
                                            onChange={handleChange}
                                            disabled={!isFinalized || isSavedLocally}
                                            className={`w-full pl-20 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all ${(!isFinalized || isSavedLocally) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="Enter manual count"
                                        />
                                    </div>
                                </div>

                                {/* C/B Credit */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-slate-600 ml-1">C/B (Credit/Balance)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <FiCreditCard />
                                        </div>
                                        <input
                                            type="number"
                                            name="cbAmount"
                                            value={formData.cbAmount}
                                            onChange={handleChange}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-400 outline-none cursor-not-allowed transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Deposit */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-emerald-600 ml-1">Deposit</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
                                            <FiMinus />
                                        </div>
                                        <input
                                            type="number"
                                            name="depositAmount"
                                            value={formData.depositAmount}
                                            onChange={handleChange}
                                            disabled={!isFinalized || isSavedLocally}
                                            className={`w-full pl-10 pr-4 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all ${(!isFinalized || isSavedLocally) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                </div>

                                {/* Credit */}
                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-rose-600 ml-1">Credit</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-rose-500">
                                            <FiMinus />
                                        </div>
                                        <input
                                            type="number"
                                            name="creditAmount"
                                            value={formData.creditAmount}
                                            onChange={handleChange}
                                            disabled={!isFinalized || isSavedLocally}
                                            className={`w-full pl-10 pr-4 py-4 bg-rose-50/50 border border-rose-100 rounded-2xl font-bold text-rose-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all ${(!isFinalized || isSavedLocally) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || !isFinalized || isSavedLocally}
                                className="w-full py-5 bg-slate-900 hover:bg-black text-white cursor-pointer rounded-[1.5rem] font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavedLocally ? (
                                    <>
                                        <FiCheckCircle />
                                        Already Saved Today
                                    </>
                                ) : saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FiSave />
                                        Save Reconciliation
                                    </>
                                )}
                            </button>
                        </div>

                        {/* RIGHT: Calculation Summary */}
                        {isAdmin && (
                            <div className="lg:col-span-5">
                                <div className={`h-full rounded-[2rem] p-8 border transition-all duration-500 ${isReconciled ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[13px] font-medium text-slate-500">Total Amount (Transactions)</span>
                                            <span className="text-[13px] font-medium text-slate-800 tracking-tight">EUR (€) {formatCurrency(totalAmount)}</span>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-6">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-medium text-slate-500">Calculated Balance</span>
                                                <span className="text-[13px] text-slate-400 font-medium">(Cash + Deposit - Credit)</span>
                                            </div>
                                            <span className={`text-[13px] font-medium text-slate-800 tracking-tight ${isReconciled ? 'text-emerald-600' : 'text-rose-600 animate-pulse'}`}>
                                                EUR (€) {formatCurrency(calculatedBalance)}
                                            </span>
                                        </div>

                                        <div className="mt-8">
                                            {isReconciled ? (
                                                <div className="flex items-center gap-3 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                                    <FiCheckCircle size={24} />
                                                    <div>
                                                        <p className="font-black uppercase tracking-wider text-[11px]">Perfectly Reconciled</p>
                                                        <p className="text-emerald-100 text-[10px] font-bold">The drawer balance matches the transaction ledger.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                                    <FiAlertCircle size={24} />
                                                    <div>
                                                        <p className="font-black uppercase tracking-wider text-[11px]">Difference Detected</p>
                                                        <p className="text-rose-100 text-[10px] font-bold">Difference: EUR (€) {formatCurrency(Math.abs(calculatedBalance - totalAmount))}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {!isFinalized && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-50 bg-white/40 backdrop-blur-[2px] flex items-center justify-center"
                        >
                            <div className="bg-white/90 p-8 rounded-3xl shadow-2xl border border-white max-w-sm text-center">
                                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">Reconciliation Locked</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                    {isNotStarted ? (
                                        <>This section will be available after you <span className="text-emerald-600 font-bold">START DAY</span> and later finish your shift.</>
                                    ) : (
                                        <>This section will be available after you click <span className="text-brand-600 font-bold">CLOSE DAY</span> to finish your shift.</>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* History Table */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <FiClock className="text-brand-600" />
                                    Past Reconciliation Records
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">C/B</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposit</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Difference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((row, idx) => {
                                            const rowBalance = (row.actualClosing + row.depositAmount - row.creditAmount);
                                            const rowDiff = Math.abs(rowBalance - row.totalTransactionNet) > 0.01;

                                            return (
                                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(row.date).toLocaleDateString('en-GB')}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(row.totalTransactionNet)}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrency(row.actualClosing)}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrency(row.cbAmount)}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">-{formatCurrency(row.depositAmount)}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-rose-600">-{formatCurrency(row.creditAmount)}</td>
                                                    <td className={`px-6 py-4 text-sm font-black text-right ${rowDiff ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {formatCurrency(rowBalance - row.totalTransactionNet)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {history.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No history available yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyDrawerReconciliation;
