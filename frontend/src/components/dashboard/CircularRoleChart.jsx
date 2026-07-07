import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

const CircularRoleChart = ({ stats, loading }) => {
    // Calculate Percentages (Relative to Total Nodes)
    const total = stats.total || 1;
    const adminPct = Math.round((stats.admin / total) * 100);
    const supervisorPct = Math.round((stats.supervisor / total) * 100);
    const userPct = Math.round((stats.user / total) * 100);

    return (
        <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
            
            {/* ── Outer Ring: Standard Users (Emerald) ── */}
            <div className="absolute inset-0">
                <CircularProgressbar
                    value={loading ? 0 : userPct}
                    strokeWidth={8}
                    styles={buildStyles({
                        pathColor: '#10b981',
                        trailColor: '#f1f5f9',
                        strokeLinecap: 'round',
                        pathTransitionDuration: 1.5,
                    })}
                />
            </div>

            {/* ── Middle Ring: Supervisors (Indigo) ── */}
            <div className="absolute inset-8">
                <CircularProgressbar
                    value={loading ? 0 : supervisorPct}
                    strokeWidth={10}
                    styles={buildStyles({
                        pathColor: '#4f46e5',
                        trailColor: 'transparent',
                        strokeLinecap: 'round',
                        pathTransitionDuration: 1.8,
                    })}
                />
            </div>

            {/* ── Inner Ring: Admins (Brand Blue) ── */}
            <div className="absolute inset-16">
                <CircularProgressbar
                    value={loading ? 0 : adminPct}
                    strokeWidth={12}
                    styles={buildStyles({
                        pathColor: '#0061FF',
                        trailColor: 'transparent',
                        strokeLinecap: 'round',
                        pathTransitionDuration: 2.1,
                    })}
                />
                
                {/* Center Core Count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <motion.h4 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-black text-neutral-900 tracking-tighter"
                    >
                        {loading ? '...' : stats.total}
                    </motion.h4>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-0.5 italic">Accounts</p>
                </div>
            </div>

            {/* Decorative Ring */}
            <div className="absolute inset-2 border-2 border-dashed border-neutral-100/50 rounded-full -z-10 animate-[spin_20s_linear_infinite]" />
        </div>
    );
};

export const ChartLegend = ({ stats }) => (
    <div className="mt-12 grid grid-cols-3 gap-6 w-full max-w-[340px]">
        <LegendItem color="bg-brand-500" label="Admins" count={stats.admin} />
        <LegendItem color="bg-indigo-600" label="Supers" count={stats.supervisor} />
        <LegendItem color="bg-emerald-500" label="Users" count={stats.user} />
    </div>
);

const LegendItem = ({ color, label, count }) => (
    <div className="flex flex-col items-center group">
        <div className={`w-3 h-3 rounded-full mb-2 ${color} group-hover:scale-125 transition-transform`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{label}</span>
        <p className="text-xs font-bold text-neutral-900 mt-1">{count}</p>
    </div>
);

export default CircularRoleChart;
