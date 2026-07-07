import React from 'react';
import { FiTrendingUp, FiGlobe, FiActivity, FiSave, FiShield, FiRefreshCcw } from 'react-icons/fi';

const flagMap = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'BDT': 'bd', 'INR': 'in',
    'PKR': 'pk', 'NPR': 'np', 'LKR': 'lk', 'AED': 'ae', 'SAR': 'sa'
};

const RateForm = ({
    formData,
    onChange,
    onSubmit,
    loading,
    onSync
}) => {
    const flagCode = flagMap[formData.sourceCurrency?.toUpperCase()] || 'un';

    return (
        <div className="bg-white rounded-[2rem] p-6 border border-neutral-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-in fade-in slide-in-from-left-4 duration-700 h-fit">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-50/80">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100/30">
                        <FiTrendingUp size={18} />
                    </div>
                    <h2 className="text-[15px] font-black text-brand-600 tracking-tight leading-none uppercase">
                        Rate Command
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onSync}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-wider disabled:opacity-50 active:scale-95 group border border-brand-100/50 shadow-sm"
                >
                    {loading ? (
                        <div className="w-3.5 h-3.5 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
                    ) : (
                        <>
                            <FiRefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span>Sync Live</span>
                        </>
                    )}
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Currency Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest flex items-center justify-between">
                            Asset Currency
                            {formData.sourceCurrency && (
                                <img 
                                    src={`https://flagcdn.com/w40/${flagCode}.png`} 
                                    className="h-3 rounded-[2px] opacity-80"
                                    alt="flag"
                                />
                            )}
                        </label>
                        <div className="relative group">
                            <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-600 transition-colors pointer-events-none" size={14} />
                            <input
                                type="text"
                                name="sourceCurrency"
                                value={formData.sourceCurrency}
                                onChange={onChange}
                                placeholder="e.g., USD"
                                maxLength={3}
                                className="w-full pl-11 pr-5 py-3 rounded-xl bg-[#F8FAFC] border border-transparent focus:bg-white focus:border-neutral-200 outline-none focus:ring-4 focus:ring-brand-600/5 transition-all text-[13px] font-bold text-neutral-700 uppercase placeholder:text-neutral-300"
                            />
                        </div>
                    </div>

                    {/* Rate Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Exchange Rate</label>
                        <div className="relative group">
                            <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-600 transition-colors" size={14} />
                            <input
                                type="number"
                                name="rate"
                                step="0.001"
                                required
                                placeholder="0.000"
                                className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#F8FAFC] border border-transparent focus:bg-white focus:border-neutral-200 outline-none focus:ring-4 focus:ring-brand-600/5 transition-all text-[13px] font-bold text-neutral-700 placeholder:text-neutral-300 tabular-nums"
                                value={formData.rate}
                                onChange={onChange}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-neutral-300 tracking-widest leading-none">EUR (€)</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end pt-6 border-t border-neutral-50/80">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl text-[11px] font-black cursor-pointer shadow-lg shadow-brand-600/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 uppercase"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Update System Rate</span>
                                <FiSave size={16} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RateForm;

