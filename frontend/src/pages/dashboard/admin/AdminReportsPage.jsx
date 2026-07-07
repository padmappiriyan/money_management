import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBarChart2, FiDownload, FiInfo, FiActivity } from 'react-icons/fi';
import { fetchGlobalPlatformHistory } from '../../../api/reportsApi';
import ReportSummaryCards from '../../../components/reports/ReportSummaryCards';
import ReportAnalytics from '../../../components/reports/ReportAnalytics';
import toast from 'react-hot-toast';

const AdminReportsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global-master');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchGlobalPlatformHistory();
        setData(result);
        if (result.length > 0) {
          setActiveTab('global-master');
        }
      } catch (error) {
        console.error("Failed to fetch global history:", error);
        toast.error("Telemetry failure. Aggregated data unavailable.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activePlatform = data.find(p => p.slug === activeTab);

  if (loading) {
    return (
      <div className="flex flex-col gap-10 animate-pulse px-1">
        <div className="h-20 bg-white rounded-3xl w-1/3" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-[2.5rem]" />)}
        </div>
        <div className="h-[500px] bg-white rounded-[3.5rem]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-neutral-900 tracking-tighter">
            Platform <span className="text-brand-600">Reports</span>
          </h2>
          <p className="text-neutral-500 text-xs font-bold  opacity-80 ">
            Consolidated financial telemetry across all users
          </p>
        </div>

        <button className="flex items-center gap-3 bg-white border-2 border-neutral-100 px-8 py-4 rounded-[2rem] shadow-sm hover:shadow-md transition-all group font-black text-[11px] uppercase tracking-widest text-neutral-600 hover:text-brand-600 hover:border-brand-100">
          <FiDownload /> Export Master Ledger
        </button>
      </div>

      {/* ── Tabs Section ── */}
      <div className="bg-white p-2 rounded-[2.5rem] border border-neutral-100 shadow-sm inline-flex flex-wrap gap-2 self-start px-1">
        {data.map(platform => (
          <button
            key={platform.slug}
            onClick={() => setActiveTab(platform.slug)}
            className={`
              px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === platform.slug
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 scale-105'
                : 'text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'}
            `}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* ── Summary Cards ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-summary`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="px-1"
        >
          <ReportSummaryCards platform={activePlatform} />
        </motion.div>
      </AnimatePresence>

      {/* ── Analytics (Chart & Table) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-analytics`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="px-1"
        >
          <ReportAnalytics platform={activePlatform} />
        </motion.div>
      </AnimatePresence>

      {/* ── Footer Insight ── */}
      <div className="flex items-center gap-3 px-6 py-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 max-w-fit self-center">
        <FiInfo className="text-blue-500" />
        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
          Reporting engine utilizes aggregated transactional rollups from all active agent ledgers.
        </p>
      </div>
    </div>
  );
};

export default AdminReportsPage;
