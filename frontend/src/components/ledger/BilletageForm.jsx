import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

const BilletageForm = ({ onTotalChange, initialCounts = {}, disabled = false }) => {
    const [counts, setCounts] = useState(() => {
        const initial = {};
        DENOMINATIONS.forEach(d => initial[d] = initialCounts[d] || '');
        return initial;
    });

    const calculateSubtotal = (denom, count) => {
        const num = parseFloat(count) || 0;
        return denom * num;
    };

    const total = DENOMINATIONS.reduce((acc, denom) => {
        return acc + calculateSubtotal(denom, counts[denom]);
    }, 0);

    useEffect(() => {
        onTotalChange(total, counts);
    }, [total, counts, onTotalChange]);

    const handleInputChange = (denom, value) => {
        // Only allow positive integers
        if (value !== '' && (!/^\d+$/.test(value))) return;
        
        setCounts(prev => ({
            ...prev,
            [denom]: value
        }));
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Denomination</span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 text-right">Subtotal</span>
            </div>

            <div className="divide-y divide-slate-50">
                {DENOMINATIONS.map((denom) => (
                    <div key={denom} className="px-6 py-3 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 text-sm font-black text-slate-800">
                                {denom}
                            </div>
                            <div className="text-slate-300 font-bold">×</div>
                            <input
                                type="text"
                                value={counts[denom]}
                                onChange={(e) => handleInputChange(denom, e.target.value)}
                                disabled={disabled}
                                placeholder="0"
                                className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-center transition-all disabled:opacity-50"
                            />
                        </div>
                        <div className="text-sm font-black text-slate-400 group-hover:text-slate-900 transition-colors">
                            {calculateSubtotal(denom, counts[denom]).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-brand-50/50 px-6 py-5 flex justify-between items-center mt-2 border-t border-brand-100">
                <span className="text-sm font-black text-brand-700 uppercase tracking-widest italic">Total Physical Cash</span>
                <motion.span 
                    key={total}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-black text-brand-600 tracking-tighter"
                >
                    {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </motion.span>
            </div>
        </div>
    );
};

export default BilletageForm;
