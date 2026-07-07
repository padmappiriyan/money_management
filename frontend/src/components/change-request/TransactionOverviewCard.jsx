import React from 'react';
import { FiShield, FiClock, FiLock } from 'react-icons/fi';
import { format } from 'date-fns';

const TransactionOverviewCard = ({ transaction }) => {
  if (!transaction) return null;

  const data = [
    { label: 'TRANSACTION ID', value: transaction.txnId || `TXN_${transaction.id?.slice(-8).toUpperCase()}`, isBold: true, color: 'text-brand-600' },
    { label: 'DATE / TIME', value: format(new Date(transaction.createdAt), 'MMM dd, yyyy | HH:mm:ss') + ' EST' },
    { label: 'PLATFORM', value: transaction.platform?.toUpperCase(), icon: true },
    { label: 'ORIGINAL AMOUNT', value: `€${transaction.amount?.toLocaleString()} EUR`, isBold: true },
    { label: 'SENDER', value: transaction.senderName },
    { label: 'RECEIVER', value: transaction.receiverName },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
      {/* Top Status Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full tracking-tighter uppercase border border-slate-200">
        <FiLock size={12} />
        LOCKED - READ ONLY
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 p-8 pt-12">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest  mb-1">
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[15px] font-bold ${item.isBold ? item.color || 'text-slate-900' : 'text-slate-600'} tracking-tight`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionOverviewCard;
