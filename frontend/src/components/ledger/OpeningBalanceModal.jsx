import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import { openLedger } from '../../api/ledgerApi';

const OpeningBalanceModal = ({ isOpen, suggestedAmount, onOpenSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && suggestedAmount !== undefined) {
            setAmount(suggestedAmount.toString());
        }
    }, [isOpen, suggestedAmount]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || parseFloat(amount) < 0) {
            setError('Please enter a valid opening balance');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await openLedger({ openingBalance: parseFloat(amount), currency: 'EUR' });
            onOpenSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to open ledger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4">
                                <FiDollarSign size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Open Your Shift</h2>
                            <p className="text-sm font-medium text-slate-500 mt-1">Please enter your starting cash balance</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                type="number"
                                label="Opening Balance (EUR €)"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                icon={FiDollarSign}
                                error={error}
                                autoFocus
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={loading}
                                    size="lg"
                                    className="rounded-2xl"
                                >
                                    Start Session
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                Secure Ledger Initialization
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OpeningBalanceModal;
