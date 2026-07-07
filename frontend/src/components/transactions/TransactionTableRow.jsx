import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMoreVertical, FiEye, FiFileText, FiLock, FiArrowDownLeft, FiArrowUpRight, FiEdit3 } from 'react-icons/fi';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TransactionTableRow = ({ tx, idx, pInfo, isAdminOrSupervisor, activeDropdown, setActiveDropdown, onView }) => {
    const isDropdownOpen = activeDropdown === (tx.id || idx);
    const navigate = useNavigate();

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="hover:bg-neutral-50/50 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-brand-600"
        >
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    {tx.type?.toLowerCase() === 'receive' ? (
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm shrink-0">
                            <FiArrowDownLeft size={18} />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-sm shrink-0">
                            <FiArrowUpRight size={18} />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-neutral-900 tracking-tight">
                            {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-400 tracking-widest mt-0.5">
                            {format(new Date(tx.createdAt), 'hh:mm a')}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className="text-[12px] font-bold text-slate-500 tracking-tight uppercase">{pInfo.name}</span>
            </td>
            <td className="px-6 py-5">
                <span className="text-[12px] font-bold text-neutral-700 line-clamp-1">{tx.senderName}</span>
            </td>
            <td className="px-6 py-5">
                <span className="text-[12px] font-bold text-neutral-700 line-clamp-1 text-lowercase">{tx.receiverName}</span>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[10px] font-black text-neutral-300">€</span>
                    <span className="text-[13px] font-black text-brand-600 tracking-tighter">
                        {(tx.totalPayout || (tx.amount * tx.exchangeRate + tx.fees)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </td>
            {isAdminOrSupervisor && (
                <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 overflow-hidden shadow-inner font-black text-[10px]">
                            {tx.staffId?.name?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-neutral-600 line-clamp-1">{tx.staffId?.name || 'Unknown'}</span>
                    </div>
                </td>
            )}
            <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2 text-red-600 group-hover:text-amber-500 transition-colors">
                    <FiLock size={16} title="Record Locked" />
                </div>
            </td>
            <td className="px-6 py-5 text-center relative">
                <button
                    className="p-2 hover:bg-neutral-100 cursor-pointer rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(isDropdownOpen ? null : (tx.id || idx));
                    }}
                >
                    <FiMoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveDropdown(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 top-full w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-100 z-[80] py-2 overflow-hidden"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView(tx);
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full px-5 py-3 text-left text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-3"
                                >
                                    <FiEye size={16} className="text-neutral-400" /> View Transaction
                                </button>
                                <button className="w-full px-5 py-3 text-left text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-3">
                                    <FiFileText size={16} className="text-neutral-400" /> Download Receipt
                                </button>
                                <div className="h-[1px] bg-neutral-100 my-1 mx-4" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/transactions/${tx.id || tx._id}/change-request`);
                                        setActiveDropdown(null);
                                    }}
                                    className="w-full px-5 py-3 text-left text-[11px] font-bold text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-3"
                                >
                                    <FiEdit3 size={16} /> Request Change
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </td>
        </motion.tr>
    );
};

export default TransactionTableRow;
