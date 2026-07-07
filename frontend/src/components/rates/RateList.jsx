import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const flagMap = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'BDT': 'bd', 'INR': 'in',
    'PKR': 'pk', 'NPR': 'np', 'LKR': 'lk', 'AED': 'ae', 'SAR': 'sa', 'AUD': 'au', 'CAD': 'ca', 'SGD': 'sg', 'JPY': 'jp', 'CHF': 'ch'
};

const currencyNames = {
    'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound', 'BDT': 'Bangladeshi Taka',
    'INR': 'Indian Rupee', 'PKR': 'Pakistani Rupee', 'NPR': 'Nepalese Rupee',
    'AUD': 'Australian Dollar', 'CAD': 'Canadian Dollar', 'SGD': 'Singapore Dollar',
    'JPY': 'Japanese Yen', 'CHF': 'Swiss Franc'
};

const RateList = ({ rates = [], onEdit }) => {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Current Exchange Rates</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {rates.map((r, index) => {
                        const flagCode = flagMap[r.sourceCurrency.toUpperCase()] || 'un';
                        const fullName = currencyNames[r.sourceCurrency.toUpperCase()] || r.sourceCurrency;
                        // Mocking trend for visual similarity to request
                        const trend = Math.random() > 0.5 ? 'up' : 'down';
                        const change = (Math.random() * 2).toFixed(2);

                        return (
                            <motion.div
                                key={r.id || r.sourceCurrency}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                onClick={() => onEdit && onEdit(r)}
                                className="group p-5 rounded-2xl border border-slate-50 hover:border-brand-100 hover:shadow-md transition-all cursor-pointer bg-slate-50/20"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 rounded shadow-sm overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img
                                                src={`https://flagcdn.com/w160/${flagCode}.png`}
                                                alt={r.sourceCurrency}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-800 text-[16px]">{r.sourceCurrency}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.sourceCurrency} / {r.targetCurrency}</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-400">{fullName}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-[16px] font-black text-slate-800">
                                            EUR (€) {r.rate.toFixed(2)}
                                        </div>
                                        <div className={`flex items-center justify-end gap-1 text-[11px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {trend === 'up' ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                                            {change}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RateList;

