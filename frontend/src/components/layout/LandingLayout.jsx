import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiGlobe, FiKey } from 'react-icons/fi';
import { motion } from 'framer-motion';
import LogoMain from '../../assets/login/bontech.png';

const LandingLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans">
            {/* ── Top Header Navigation ── */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <img src={LogoMain} alt="BONTECH" className="h-10 object-contain" />
                    <div className="flex flex-col">
                        <span className="font-black text-xl leading-none text-slate-900 tracking-tight">BONTECH</span>
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">FOREIGN EXCHANGE SERVICES</span>
                    </div>
                </div>

                {/* Navigation Toggle */}
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl md:min-w-[320px] shadow-inner">
                    <NavLink
                        to="/public-rates"
                        className={({ isActive }) => `
                            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 select-none
                            ${isActive ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}
                        `}
                    >
                        <FiGlobe size={16} />
                        Public Rates
                    </NavLink>
                    <NavLink
                        to="/login"
                        className={({ isActive }) => `
                            flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 select-none
                            ${isActive ? 'bg-brand-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}
                        `}
                    >
                        <FiKey size={16} />
                        Login
                    </NavLink>
                </div>
            </header>

            {/* ── Page Content (Outlet) ── */}
            <main className="flex-1 w-full bg-slate-50 overflow-y-auto">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full max-w-7xl mx-auto"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default LandingLayout;
