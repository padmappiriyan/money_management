import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiActivity } from 'react-icons/fi';

const ReportSummaryCards = ({ platform }) => {
  if (!platform) return null;

  // Get current day data (last element in history because it's sorted descending)
  const current = platform.history[0] || { bf: 0, send: 0, paid: 0, deposit: 0, balance: 0 };

  const cards = [
    {
      label: 'Brought Fwd',
      value: current.bf,
      icon: FiActivity,
      color: 'text-slate-400',
      bg: 'bg-slate-50'
    },
    {
      label: 'Send',
      value: current.send,
      icon: FiArrowUpRight,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      prefix: '-'
    },
    {
      label: 'Paid',
      value: current.paid,
      icon: FiArrowDownLeft,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      prefix: '-'
    },
    {
      label: 'Deposit',
      value: current.deposit,
      icon: FiCreditCard,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      prefix: '-'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-[1.5rem] p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em]">Metrics</span>
          </div>
          
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{card.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xs font-bold ${card.color}`}>{card.prefix}</span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {card.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </motion.div>
      ))}

    </div>
  );
};

export default ReportSummaryCards;
