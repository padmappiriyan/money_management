import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { FiGlobe, FiBell, FiSearch } from 'react-icons/fi';

const DashboardLayout = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Map routes to display titles
  const routeTitles = {
    '/dashboard': 'System Overview',
    '/dashboard/activity-timeline': 'System Logs',
    '/dashboard/users': 'User Governance',
    '/dashboard/transactions': 'Financial Ledger',
    '/dashboard/profile': 'Identity Management',
    '/dashboard/audit-logs': 'Audit Logs',
    '/dashboard/platforms': 'Source Classification',
    '/dashboard/rates': 'Global Rates Management',
    '/dashboard/reports': 'Business Intelligence',
    '/dashboard/user-records': 'User Records',
    '/dashboard/excel': 'Excel Workspace'
  };

  const pageTitle = routeTitles[location.pathname] || 'System Management';

  return (
    <div className="flex h-screen w-screen bg-[#F8F9FA] overflow-hidden">
      {/* ── Sidebar (Left) ── */}
      <Sidebar />

      {/* ── Main Content Area (Right) ── */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative transition-all duration-300 ease-in-out bg-neutral-50/20 flex flex-col">

        {/* ── Reusable Top Navigation Bar ── */}
        <header className="sticky bg-white top-0 z-50 backdrop-blur-xl shadow-sm flex items-center justify-between px-6 py-3 transition-all border-b border-slate-100">
          <div className="flex items-center gap-8">
            <h1 className="text-[17px] font-bold text-brand-600 tracking-tight flex items-center gap-4">
              {pageTitle}
              <span className="w-[1px] h-5 bg-slate-200" />
            </h1>

            <div className="flex items-center gap-2 text-slate-400 font-medium text-[13px]">
              <FiGlobe className="text-slate-300" size={16} />
              <span className="tabular-nums">
                {currentTime.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })} | {currentTime.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Search Bar - Common for all pages */}
            <div className="relative group hidden lg:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-all group-focus-within:text-brand-500" size={16} />
              <input
                type="text"
                placeholder="Search everything..."
                className="bg-slate-50/50 border border-slate-100/50 py-2 pl-11 pr-6 rounded-2xl text-[13px] w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-all group active:scale-95">
                <FiBell className="text-slate-400 group-hover:text-brand-600 transition-colors" size={20} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 w-full max-w-[1440px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
