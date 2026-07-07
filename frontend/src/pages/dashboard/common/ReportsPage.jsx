import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiInfo, FiActivity } from 'react-icons/fi';
import { fetchPlatformHistory } from '../../../api/reportsApi';
import PlatformHistoryCard from '../../../components/reports/PlatformHistoryCard';
import toast from 'react-hot-toast';

const ReportsPage = () => {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await fetchPlatformHistory();
                setHistories(data);
            } catch (error) {
                console.error("Failed to fetch platform history:", error);
                toast.error("Telemetry link failed. Historical data unavailable.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const handleExport = () => {
        toast.success("Preparing universal financial telemetry export...");
    };

    return (
        <div className="flex flex-col gap-10">
            {/* ── Header Section ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-neutral-900 tracking-tighter">
                        Platform <span className="text-brand-600">History</span>
                    </h2>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-[0.25em] opacity-80 italic">
                        Detailed historical ledgers separated by platform
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    className="flex items-center gap-3 bg-white border-2 border-neutral-100 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                    <FiDownload className="text-neutral-400 group-hover:text-brand-600 transition-colors" />
                    <span className="text-sm font-black text-neutral-600 uppercase tracking-widest">Export All</span>
                </motion.button>
            </div>

            {/* ── Content Grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[500px] bg-white rounded-[3rem] border border-neutral-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-1">
                    {histories.map((platform, idx) => (
                        <PlatformHistoryCard 
                            key={platform.slug} 
                            platformData={platform} 
                            index={idx} 
                        />
                    ))}

                    {histories.length === 0 && (
                        <div className="col-span-full bg-white rounded-[3rem] p-20 border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-brand-50 rounded-[2rem] flex items-center justify-center mb-8">
                                <FiActivity className="w-12 h-12 text-brand-600" />
                            </div>
                            <h3 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">No Financial Footprints</h3>
                            <p className="text-neutral-500 max-w-lg font-medium leading-relaxed">
                                We couldn't find any historical transaction data for the active platforms. Start processing transactions to see your platform metrics here.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Footer Insight ── */}
            <div className="flex items-center gap-3 px-6 py-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 max-w-fit self-center">
                <FiInfo className="text-blue-500" />
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    All historical balances are calculated post-hoc from verified transactional telemetry.
                </p>
            </div>
        </div>
    );
};

export default ReportsPage;
