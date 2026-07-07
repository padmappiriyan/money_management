import { FiUsers, FiActivity, FiShield, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SupervisorDashboard = ({ userInfo }) => {
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                        Supervisor <span className="text-brand-600">Portal</span>
                    </h1>
                    <p className="text-neutral-500 mt-1 font-medium italic">
                        Overseeing user operations and activity nodes.
                    </p>
                </div>
                
                <div className="bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-[0.2em] px-5 py-3 rounded-full border border-emerald-100 flex items-center gap-3">
                    <FiShield size={16} /> Operational Authority
                </div>
            </div>

            {/* ── Supervisor Widgets ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                
                {/* User Count Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[3rem] p-10 border border-neutral-100 shadow-sm flex flex-col items-center text-center group"
                >
                    <div className="w-16 h-16 rounded-3xl bg-neutral-50 flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-lg shadow-neutral-100">
                        <FiUsers size={32} />
                    </div>
                    <h3 className="text-4xl font-black text-neutral-900 mb-1 leading-none">Management</h3>
                    <p className="text-xs font-black text-neutral-300 uppercase tracking-widest leading-loose">User List Access</p>
                    <div className="mt-8 w-12 h-1 bg-brand-600 rounded-full group-hover:w-24 transition-all" />
                </motion.div>

                {/* Activity Status Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-neutral-900 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center text-center text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <FiActivity size={100} />
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:bg-brand-600 transition-all">
                        <FiActivity size={32} />
                    </div>
                    <h3 className="text-4xl font-black mb-1 leading-none">Activity</h3>
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest leading-loose">Timeline Auditing</p>
                    <div className="mt-8 w-12 h-1 bg-brand-600 rounded-full group-hover:w-24 transition-all" />
                </motion.div>

                {/* Productivity Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-brand-50 rounded-[3rem] p-10 border border-brand-100 shadow-sm flex flex-col items-center text-center group"
                >
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-lg shadow-brand-100 border border-brand-100">
                        <FiTrendingUp size={32} />
                    </div>
                    <h3 className="text-4xl font-black text-brand-900 mb-1 leading-none">Insights</h3>
                    <p className="text-xs font-black text-brand-300 uppercase tracking-widest leading-loose">Coming Soon</p>
                    <div className="mt-8 w-12 h-1 bg-brand-600 rounded-full group-hover:w-24 transition-all" />
                </motion.div>

            </div>

            {/* ── Supervisor Notice Board ── */}
            <div className="bg-white rounded-3xl p-10 border border-neutral-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-3 tracking-tight">Security Protocol Notice</h3>
                    <p className="text-neutral-500 text-sm max-w-2xl leading-relaxed">
                        As a supervisor, you are responsible for monitoring anomalous user behavior within your designated clusters. Ensure all daily cleanup reports are reviewed by midnight to maintain system data compliance.
                    </p>
                    <button className="mt-8 px-8 py-3 bg-neutral-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-600 transition-all">
                        View Compliance Hub
                    </button>
                </div>
                
                <div className="hidden lg:flex flex-1 justify-end items-center opacity-10">
                    <FiShield size={160} className="transform -rotate-12" />
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;
