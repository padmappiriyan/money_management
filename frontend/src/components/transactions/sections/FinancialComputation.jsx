import React, { useState } from 'react';
import { FiRepeat, FiLock, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Currencies: EUR is the only active one. Others are listed but marked NOT AVAILABLE.
const CURRENCIES = [
    { code: 'EUR', name: 'Eurozone Euro',    available: true  },
    { code: 'USD', name: 'US Dollar',        available: false },
    { code: 'GBP', name: 'British Pound',    available: false },
    { code: 'ETB', name: 'Ethiopian Birr',   available: false },
];

const FinancialComputation = ({
    currency, amount, exchangeRate, fees, totalPayout, onChange
}) => {
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

    const handleCurrencySelect = (code, available) => {
        if (!available) return;
        onChange({ target: { name: 'currency', value: code } });
        setIsCurrencyOpen(false);
    };

    return (
        <div className="bg-[#f2f4f6] rounded-[2rem] p-8 border border-neutral-100">
            <div className="flex items-center gap-3 text-brand-600 mb-10">
                <h3 className="text-lg font-bold">Financial Computation</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

                {/* ── Currency Unit — Custom Dropdown ── */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">
                        Currency Unit
                    </label>
                    <div className="relative">
                        {/* Trigger Button */}
                        <button
                            type="button"
                            onClick={() => setIsCurrencyOpen(prev => !prev)}
                            className="w-full bg-white border border-neutral-100 p-4 pr-10 rounded-xl font-bold text-[11px] uppercase flex items-center justify-between shadow-sm hover:bg-neutral-50 transition-all text-neutral-900 outline-none focus:ring-2 focus:ring-brand-500/20"
                        >
                            <span>{currency}</span>
                            <FiChevronDown
                                className={`text-neutral-300 transition-transform duration-300 ${isCurrencyOpen ? 'rotate-180' : ''}`}
                                size={14}
                            />
                        </button>

                        {/* Backdrop */}
                        {isCurrencyOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsCurrencyOpen(false)}
                            />
                        )}

                        {/* Dropdown Panel */}
                        <AnimatePresence>
                            {isCurrencyOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 4, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                    transition={{ duration: 0.18 }}
                                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-neutral-100 rounded-2xl shadow-2xl overflow-hidden py-1"
                                >
                                    {CURRENCIES.map((c) => (
                                        <button
                                            key={c.code}
                                            type="button"
                                            disabled={!c.available}
                                            onClick={() => handleCurrencySelect(c.code, c.available)}
                                            className={`
                                                w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors
                                                ${!c.available
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : currency === c.code
                                                        ? 'bg-brand-50'
                                                        : 'hover:bg-neutral-50'
                                                }
                                            `}
                                        >
                                            {/* Left: code + name + badge */}
                                            <span className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[11px] font-black uppercase ${!c.available ? 'text-neutral-400' : currency === c.code ? 'text-brand-600' : 'text-neutral-700'}`}>
                                                    {c.code}
                                                </span>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">
                                                    {c.name}
                                                </span>
                                                {!c.available && (
                                                    <span className="text-[7px] font-black tracking-widest bg-neutral-200 text-neutral-400 px-1.5 py-0.5 rounded-full uppercase leading-none">
                                                        NOT AVAILABLE
                                                    </span>
                                                )}
                                            </span>

                                            {/* Right: active dot */}
                                            {c.available && currency === c.code && (
                                                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Principal (Amount) ── */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">Principal (Amount)</label>
                    <div className="relative">
                        <input
                            type="number" name="amount" step="0.01" required value={amount} onChange={onChange}
                            placeholder="0.00"
                            className="w-full bg-white border border-neutral-100 px-5 py-4 rounded-xl font-bold text-sm outline-none shadow-sm focus:bg-white transition-all text-neutral-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-300">VAL</span>
                    </div>
                </div>

                {/* ── Exchange Multiplier ── */}
                <div className="space-y-3 opacity-80">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-tight block flex items-center gap-2">
                        Exchange Multiplier
                        <FiLock className="text-brand-600" size={10} />
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            name="exchangeRate"
                            step="0.0001"
                            required
                            disabled
                            value={exchangeRate}
                            placeholder="1.0000"
                            className="w-full bg-neutral-100/50 border border-neutral-100 px-5 py-4 rounded-xl font-bold text-sm outline-none cursor-not-allowed select-none text-brand-700"
                        />
                        <FiRepeat className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                    </div>
                </div>

                {/* ── Fee Component ── */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">Fee Component</label>
                    <div className="relative">
                        <input
                            type="number" name="fees" step="0.01" value={fees} onChange={onChange}
                            placeholder="0.00"
                            className="w-full bg-white border border-neutral-100 px-5 py-4 rounded-xl font-bold text-sm outline-none shadow-sm focus:bg-white transition-all text-neutral-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-200 leading-none">$</span>
                    </div>
                </div>
            </div>

            {/* ── Payout Row ── */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 py-10 border-t border-neutral-50">
                <div className="bg-[#e0e3e5] border border-amber-100 p-6 rounded-2xl flex items-center gap-5 max-w-xl group hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-amber-600 group-hover:scale-110 transition-transform">
                        <FiLock size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase">
                        Post-submission, this entry will be permanently locked for institutional audit.
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-neutral-400 uppercase mb-2 pr-1">TOTAL PAYOUT</p>
                    <div className="flex items-baseline justify-end gap-3 translate-x-1">
                        <span className="text-2xl font-black text-brand-600">€</span>
                        <span className="text-3xl font-black text-brand-600 tracking-tighter tabular-nums underline decoration-[#00426d]/10 underline-offset-8">
                            {totalPayout}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialComputation;

