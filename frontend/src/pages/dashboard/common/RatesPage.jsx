import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiZap, FiRefreshCw, FiInfo } from 'react-icons/fi';
import useSettings from '../../../hooks/useSettings';
import RateForm from '../../../components/rates/RateForm';
import RateList from '../../../components/rates/RateList';
import QuickConverter from '../../../components/rates/QuickConverter';
import AuditTrail from '../../../components/rates/AuditTrail';
import { ROLES } from '../../../constants/roles';
import { toast } from 'react-hot-toast';

const RatesPage = () => {
    const { userInfo } = useAuthContext();
    const isAdmin = userInfo?.role === ROLES.ADMIN;

    const {
        globalRates,
        loading,
        error,
        success,
        loadRates,
        upsertRate,
        syncRates,
        resetStatus
    } = useSettings();

    const [formRate, setFormRate] = useState({
        sourceCurrency: 'USD',
        rate: ''
    });

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    useEffect(() => {
        if (success) {
            setFormRate({ sourceCurrency: 'USD', rate: '' });
            resetStatus();
            toast.success('System rates updated successfully');
            loadRates();
        }
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [success, error, resetStatus, loadRates]);

    const handleChange = (e) => {
        setFormRate({ ...formRate, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        upsertRate(formRate);
    };

    const handleQuickEdit = (rateObj) => {
        if (!isAdmin) return;
        setFormRate({
            sourceCurrency: rateObj.sourceCurrency,
            rate: rateObj.rate.toString()
        });
        const section = document.getElementById('management-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSync = () => {
        syncRates();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 pb-32 px-4 md:px-8"
        >
            {/* ── Page Header ── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-800">Daily Market Rates</h1>
                    <p className="text-[14px] font-bold text-neutral-400">
                        Live exchange rates and conversion against Sri Lankan Rupee (LKR)
                    </p>
                </div>
                
                <button 
                    onClick={handleSync}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-slate-600 font-bold text-sm"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
                    Refresh Rates
                </button>
            </header>

            {/* ── Main Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Sidebar: Converter + Disclaimer */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <QuickConverter rates={globalRates} />
                    
                    {/* Disclaimer Box */}
                    <div className="flex-grow bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FiInfo size={14} />
                        </div>
                        <p className="text-[13px] leading-relaxed text-blue-800 font-medium">
                            These rates are indicative mid-market rates intended for internal reference. 
                            Actual transaction rates applied to customers may vary depending on the chosen platform 
                            and daily margins.
                        </p>
                    </div>
                </div>

                {/* Right Content: Rates Grid */}
                <div className="lg:col-span-8 flex flex-col">
                    <RateList
                        rates={globalRates}
                        onEdit={isAdmin ? handleQuickEdit : null}
                    />
                </div>
            </div>

            {/* ── Administrative Management Section (Admin Only) ── */}
            {isAdmin && (
                <section id="management-section" className="pt-16 space-y-12">
                    <div className="px-6 border-l-4 border-brand-600">
                        <h2 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tighter">Rate Governance Console</h2>
                        <p className="text-neutral-500 font-medium">Control market margins and manual overrides across the system.</p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                        {/* Control Form */}
                        <div className="xl:col-span-5 space-y-8">
                            <div className="bg-brand-50/50 p-8 rounded-[3rem] border border-brand-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <FiZap size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-brand-900 uppercase">Live Command</h3>
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-8">
                                    Update specific currency pairs manually to respond to local market volatility or maintain target spreads.
                                </p>
                                <RateForm
                                    formData={formRate}
                                    onChange={handleChange}
                                    onSubmit={handleSubmit}
                                    loading={loading}
                                    onSync={handleSync}
                                />
                            </div>
                        </div>

                        {/* Audit Logs */}
                        <div className="xl:col-span-7">
                            <AuditTrail />
                        </div>
                    </div>
                </section>
            )}
        </motion.div>
    );
};

export default RatesPage;
