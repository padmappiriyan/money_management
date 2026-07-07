import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiActivity } from 'react-icons/fi';

const dummyData = [
  { date: 'Apr 21', ria: 32000, moneygram: 24000, westernUnion: 18000 },
  { date: 'Apr 22', ria: 45000, moneygram: 31000, westernUnion: 22000 },
  { date: 'Apr 23', ria: 38000, moneygram: 29000, westernUnion: 25000 },
  { date: 'Apr 24', ria: 52000, moneygram: 41000, westernUnion: 31000 },
  { date: 'Apr 25', ria: 48000, moneygram: 35000, westernUnion: 28000 },
  { date: 'Apr 26', ria: 65000, moneygram: 48000, westernUnion: 35000 },
  { date: 'Apr 27', ria: 85000, moneygram: 62000, westernUnion: 45000 },
];

const PlatformDistributionChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[3.5rem] p-10 border border-neutral-100 shadow-sm w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center">
            <FiActivity className="w-7 h-7 text-brand-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Platform Dist.</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Transaction volume by provider</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Ria</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Moneygram</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Western Union</span>
          </div>
        </div>
      </div>

      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dummyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#39cf33ff', fontSize: 12, fontWeight: 700 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '1.5rem' }}
              itemStyle={{ fontSize: '13px', fontWeight: 900 }}
              labelStyle={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}
            />
            <Bar dataKey="ria" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="moneygram" fill="#39cf33ff" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="westernUnion" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PlatformDistributionChart;
