import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import DailyDrawerReconciliation from './DailyDrawerReconciliation';

const CloseDayConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-transparent rounded-[2.5rem]"
                    >
                        {/* Close Button placed outside or in a sticky header */}
                        <div className="absolute top-4 right-4 z-50">
                            <button 
                                onClick={onClose}
                                className="p-3 text-white bg-slate-900/40 hover:bg-slate-900/60 rounded-full backdrop-blur-sm transition-all"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        {/* Render the reconciliation form inside the modal */}
                        <div className="bg-transparent" onClick={(e) => e.stopPropagation()}>
                            <DailyDrawerReconciliation 
                                isFinalized={true} 
                                isNotStarted={false} 
                                onSaveComplete={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CloseDayConfirmationModal;
