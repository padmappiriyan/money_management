import React, { useState, useEffect, useRef } from 'react';
import { FiRefreshCw, FiArrowDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-4 rounded-2xl flex items-center justify-between gap-2 shadow-sm transition-all font-bold text-sm active:scale-95 focus:outline-none"
            >
                <span className="truncate">{selectedOption ? selectedOption.label : value}</span>
                <FiArrowDown className={`transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute z-[100] mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-2 max-h-[190px] overflow-y-auto"
                        style={{ top: '100%' }}
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange({ target: { value: opt.value } });
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-6 py-3 text-[13px] font-bold transition-all hover:bg-slate-50 ${
                                    value === opt.value ? 'bg-brand-50 text-brand-600' : 'text-slate-600'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const QuickConverter = ({ rates = [] }) => {
    const [amount, setAmount] = useState(100);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState(0);

    const currencyOptions = [
        { value: 'EUR', label: 'EUR - Euro' },
        ...rates.map(r => ({
            value: r.sourceCurrency,
            label: `${r.sourceCurrency} - ${r.sourceCurrencyName || r.sourceCurrency}`
        }))
    ];

    useEffect(() => {
        const fromRate = fromCurrency === 'EUR' ? 1 : rates.find(r => r.sourceCurrency === fromCurrency)?.rate || 1;
        const toRate = toCurrency === 'EUR' ? 1 : rates.find(r => r.sourceCurrency === toCurrency)?.rate || 1;

        let lkrValue = amount;
        if (fromCurrency !== 'EUR') {
            lkrValue = amount * fromRate;
        }

        let finalValue = lkrValue;
        if (toCurrency !== 'EUR') {
            finalValue = lkrValue / toRate;
        }

        setConvertedAmount(finalValue);
    }, [amount, fromCurrency, toCurrency, rates]);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="bg-white rounded-[1rem] p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                    <FiRefreshCw size={16} />
                </div>
                <h3 className="text-[16px] font-bold text-slate-800">Quick Converter</h3>
            </div>

            <div className="space-y-3.5">
                <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-[16px] font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-mono"
                    />
                </div>

                <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">From Currency</label>
                    <CustomSelect
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                        options={currencyOptions}
                    />
                </div>

                <div className="flex justify-center -my-2.5 relative z-10">
                    <button
                        onClick={handleSwap}
                        className="w-8 h-8 bg-white hover:bg-slate-50 shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-600 transition-all"
                    >
                        <FiArrowDown size={14} />
                    </button>
                </div>

                <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">To Currency</label>
                    <CustomSelect
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                        options={currencyOptions}
                    />
                </div>

                <div className="pt-3.5 border-t border-slate-50">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Converted Amount</span>
                    <div className="flex flex-col">
                        <span className="text-[22px] font-black text-brand-600 tracking-tight leading-none">
                            {toCurrency === 'EUR' ? 'EUR (€) ' : ''}
                            {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {toCurrency !== 'EUR' ? ` ${toCurrency}` : ''}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1">
                            1 {fromCurrency} = {(convertedAmount / amount).toFixed(4)} {toCurrency}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickConverter;

