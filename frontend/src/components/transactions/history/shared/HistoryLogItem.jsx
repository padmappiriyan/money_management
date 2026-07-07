import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiArrowUpRight, FiArrowDownLeft, FiMoreHorizontal, 
    FiEye, FiCheckCircle 
} from 'react-icons/fi';

const HistoryLogItem = ({ tx, isAdmin, onView }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] hover:bg-neutral-50/50 transition-all border border-transparent hover:border-neutral-100"
        >
            <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform ${tx.type === 'receive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tx.type === 'receive' ? <FiArrowDownLeft size={20} /> : <FiArrowUpRight size={20} />}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">{tx.id.slice(-8)}</p>
                    <p className="text-sm font-bold text-neutral-900 uppercase">
                        {tx.senderName} 
                        <span className="mx-2 text-neutral-300">to</span> 
                        {tx.receiverName}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-2">
                        <span className="text-neutral-900 border-r pr-2 shadow-sm">{tx.staffId?.name || 'System'}</span>
                        {tx.staffId?.email || 'N/A'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8 mt-4 md:mt-0">
                <div className="text-right">
                    <p className="text-xs font-black text-neutral-900">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-10 h-10 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-brand-600 hover:border-brand-100 shadow-sm transition-all"
                    >
                        <FiMoreHorizontal />
                    </button>
                    
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-neutral-100 shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95">
                                <button 
                                    onClick={() => { onView(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase text-neutral-600 hover:bg-neutral-50 hover:text-brand-600 transition-colors"
                                >
                                    <FiEye size={16} /> View Artifact
                                </button>
                                {isAdmin && (
                                    <button className="w-full flex items-center gap-3 px-4 py-2 text-[11px] font-black uppercase text-blue-600 hover:bg-neutral-50 transition-colors">
                                        <FiCheckCircle size={16} /> Update Record
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HistoryLogItem;
