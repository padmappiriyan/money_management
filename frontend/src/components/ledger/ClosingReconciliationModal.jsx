import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';
import Button from '../common/Button';
import BilletageForm from './BilletageForm';
import { closeLedger } from '../../api/ledgerApi';

const ClosingReconciliationModal = ({ isOpen, ledger, onClose, onCloseSuccess }) => {
    const [actualClosing, setActualClosing] = useState(0);
    const [billetage, setBilletage] = useState({});
    const [discrepancyNote, setDiscrepancyNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const expectedClosing = ledger?.expectedClosing || 0;
    const difference = actualClosing - expectedClosing;
    const isMismatch = Math.abs(difference) > 0.01;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isMismatch && !discrepancyNote.trim()) {
            setError('A discrepancy note is required for the mismatched balance.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await closeLedger({
                billetage,
                actualClosing,
                discrepancyNote,
                currency: ledger.currency
            });
            onCloseSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to close ledger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Left Side: Billetage Entry */}
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight italic">Physical Cash Count</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Billetage Reconciliation</p>
                            </div>
                            
                            <BilletageForm 
                                onTotalChange={(total, counts) => {
                                    setActualClosing(total);
                                    setBilletage(counts);
                                }}
                            />
                        </div>

                        {/* Right Side: Reconciliation Summary */}
                        <div className="w-full md:w-80 bg-white border-l border-slate-50 p-8 flex flex-col justify-between">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight italic">Reconciliation</h3>
                                    <div className="mt-6 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected</span>
                                            <span className="text-lg font-black text-slate-700">{expectedClosing.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actual</span>
                                            <span className={`text-lg font-black ${isMismatch ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {actualClosing.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className={`mt-4 p-4 rounded-2xl border flex items-center justify-between ${isMismatch ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Difference</span>
                                            <span className="text-sm font-black">{difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                {isMismatch && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center gap-2 text-red-500">
                                            <FiAlertCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Mismatch Detected</span>
                                        </div>
                                        <textarea
                                            placeholder="Please provide an explanation for this discrepancy..."
                                            value={discrepancyNote}
                                            onChange={(e) => setDiscrepancyNote(e.target.value)}
                                            className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-200 transition-all resize-none"
                                        />
                                    </motion.div>
                                )}

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">
                                        <FiInfo size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-3">
                                <Button
                                    fullWidth
                                    size="lg"
                                    className={`rounded-2xl h-14 ${isMismatch ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}
                                    onClick={handleSubmit}
                                    isLoading={loading}
                                >
                                    Confirm & Close Day
                                </Button>
                                <button 
                                    onClick={onClose}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ClosingReconciliationModal;
