import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-lg text-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-slate-900 font-black mt-0.5">
                    {payload[0].value}{' '}
                    <span className="text-[11px] font-semibold text-slate-400">amendments</span>
                </p>
            </div>
        );
    }
    return null;
};

const ChangeRequestChart = ({ data, loading }) => {
    const [activeTab, setActiveTab] = useState('volume');

    if (loading || !data) {
        return <div className="bg-white rounded-2xl border border-slate-200 h-[280px] animate-pulse" />;
    }

    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    // Latest non-zero or last bar
    const highlighted = data[data.length - 1]?.count ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm"
        >
            {/* Top row: tabs (left) + label + total value (right) */}
            <div className="flex items-start justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                    {[
                        { id: 'volume', label: 'Total Volume' },
                        { id: 'avg', label: 'Avg. Value' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Volume label + number */}
                <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Volume</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                        {total}{' '}
                        <span className="text-sm font-bold text-slate-400">requests</span>
                    </p>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex-1 w-full min-h-[160px]">
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                            width={28}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#f8fafc', radius: 6 }}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24} animationDuration={1000}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        index === data.length - 1
                                            ? '#2563eb'   /* highlighted bar = bright blue */
                                            : '#e2e8f0'   /* rest = light grey */
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ChangeRequestChart;
