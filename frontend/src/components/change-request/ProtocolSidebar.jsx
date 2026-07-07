import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

const ProtocolSidebar = ({ auditTrail = [] }) => {
  return (
    <div className="flex flex-col gap-10 sticky top-12">

      {/* ── Audit Trail ── */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Audit Trail</h4>

        </div>

        <div className="flex flex-col gap-8 relative pl-6 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
          {auditTrail.length > 0 ? auditTrail.map((log, idx) => (
            <div key={idx} className="relative flex flex-col gap-1 group">
              {/* Timeline Dot */}
              <div className={`absolute -left-[24px] top-1.5 w-3 h-3 rounded-full border-2 ${idx === 0 ? 'bg-emerald-500 border-emerald-100' : 'bg-slate-200 border-white'} shadow-sm group-hover:scale-110 transition-transform`} />

              <span className={`text-[10px] font-black tracking-widest uppercase ${idx === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {log.action}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-bold text-slate-800 tracking-tight">{log.detail}</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-tighter mt-1">{log.time}</span>
              </div>
            </div>
          )) : (
            <div className="text-[12px] font-medium text-slate-400 italic">No previous modifications logged</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProtocolSidebar;
