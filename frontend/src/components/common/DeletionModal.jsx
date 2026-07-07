import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DeletionModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemLabel = ""
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-neutral-100 overflow-hidden text-center"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-neutral-50 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all shadow-sm border border-neutral-100/50"
                    >
                        <FiX size={18} />
                    </button>

                    <div className="flex flex-col items-center gap-6">
                        {/* Title & Description */}
                        <div className="space-y-4 pt-4">
                            <h2 className="text-[24px] font-black text-neutral-800 tracking-tight leading-none">
                                {title}
                            </h2>
                            <p className="text-[14px] font-bold text-neutral-400 leading-relaxed max-w-xs mx-auto">
                                {message}
                                {itemLabel && (
                                    <span className="block mt-2 text-brand-600 font-black uppercase tracking-widest text-[12px]">
                                        "{itemLabel}"
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 w-full pt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-neutral-100 text-[14px] font-bold text-neutral-500 hover:bg-neutral-50 hover:border-neutral-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-4 px-6 rounded-2xl bg-red-600 text-white text-[14px] font-bold shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeletionModal;
