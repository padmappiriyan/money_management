import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShare2, FiExternalLink } from 'react-icons/fi';
import { format } from 'date-fns';

const TransactionDetailModal = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const totalVolume = transaction.totalPayout || (transaction.amount * transaction.exchangeRate + transaction.fees);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="absolute top-6 right-6 flex items-center gap-3 z-10">

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-10 pt-16 flex flex-col items-center text-center">
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-8 lowercase">
                        view full <span className="text-brand-600">transaction</span> history
                    </h2>

                    <div className="w-full space-y-5 border-y border-neutral-100 py-8 mb-8 text-left">
                        <DetailRow label="Beneficiary Name" value={transaction.receiverName} isBold />
                        <DetailRow label="Transaction ID" value={transaction.id?.slice(-10).toUpperCase() || "MT-98231024"} isMono />
                        <DetailRow label="Native Amount" value={`€${transaction.amount?.toLocaleString()}`} />
                        <DetailRow label="Total Payout (EUR)" value={`€ ${totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} isBrand />
                        <DetailRow label="Date & Time" value={format(new Date(transaction.createdAt), 'MMM dd, yyyy | hh:mm a')} />
                    </div>

                    <div className="w-full space-y-5 px-1 text-left">
                        <DetailRow label="Sent From" value={transaction.senderName || "HQ Master Vault"} />
                        <DetailRow label="Platform Infrastructure" value={transaction.platform?.toUpperCase()} isTag />
                        <DetailRow label="Processing Fees" value={`€ ${transaction.fees?.toLocaleString()}`} />

                    </div>
                </div>


            </motion.div>
        </div>
    );
};

const DetailRow = ({ label, value, isBold, isMono, isBrand, isTag }) => (
    <div className="flex justify-between items-center group w-full border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
        <span className="text-[11px] font-bold text-neutral-400 tracking-tight uppercase shrink-0 mr-4">{label}</span>
        <span className={`text-[13px] tracking-tight text-right ${isBold ? 'font-black text-neutral-900' :
            isMono ? 'font-mono font-bold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded text-[11px]' :
                isBrand ? 'font-black text-brand-600 text-lg' :
                    isTag ? 'bg-slate-100 px-3 py-1 rounded-lg font-black text-[10px] text-slate-500 border border-slate-200' :
                        'font-bold text-neutral-700'
            }`}>
            {value}
        </span>
    </div>
);

export default TransactionDetailModal;
