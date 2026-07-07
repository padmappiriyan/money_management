import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiCalendar, FiArrowRight } from 'react-icons/fi';

const ReportAnalytics = ({ platform }) => {
  if (!platform) return null;

  // Prepare chart data (reverse history to show chronological order)
  const chartData = [...platform.history].reverse().map(item => ({
    date: item.date,
    balance: item.balance,
    shortDate: item.date.split('-').slice(1).join('/')
  }));

  return (
    <div className="space-y-10">
      {/* ── Chart Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3.5rem] p-10 border border-neutral-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Balance Trend</h3>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Global Liquidity Timeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-xl text-neutral-500 text-xs font-bold">
            <FiCalendar />
            <span>LAST 30 DAYS</span>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="shortDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                dy={10}
              />
              <YAxis 
                hide 
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '1.5rem' }}
                itemStyle={{ fontSize: '14px', fontWeight: 900, color: '#6366f1' }}
                labelStyle={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#6366f1" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Table Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[3.5rem] border border-neutral-100 shadow-sm overflow-hidden"
      >
        <div className="p-10 border-b border-neutral-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Detailed Records
            <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Showing {platform.history.length} records
            </span>
          </h3>
        </div>

        <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)]">
              <tr className="bg-neutral-50/80 backdrop-blur-md">
                <th className="px-10 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">B/F</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Send</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Paid</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Deposit</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {platform.history.map((day, idx) => (
                <tr key={day.date} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <span className="text-sm font-bold text-slate-900">{day.date}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-sm font-medium text-slate-500">{day.bf.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-sm font-bold text-rose-500">-{day.send.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-sm font-bold text-blue-500">-{day.paid.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className="text-sm font-bold text-emerald-500">-{day.deposit.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm font-black text-slate-900">{day.balance.toLocaleString()}</span>
                        <FiArrowRight size={14} className="text-neutral-200 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportAnalytics;
