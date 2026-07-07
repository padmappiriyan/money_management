import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiAlertCircle } from 'react-icons/fi';

const DeleteUserModal = ({ isOpen, onClose, user, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Icon Background (Faint Decoration) ── */}
                    <div className="absolute -top-10 -right-10 text-red-500/5 rotate-12 pointer-events-none">
                        <FiTrash2 size={240} />
                    </div>

                    <div className="relative">
                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                            <FiAlertCircle size={32} />
                        </div>

                        <h3 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2 ">
                            confirm <span className="text-red-600">deletion</span>
                        </h3>
                        <p className="text-neutral-500 text-[15px] font-medium leading-relaxed mb-8 lowercase">
                            are you sure you want to permanently delete <span className="text-neutral-900 font-bold">{user?.name}</span>? 
                            this action will expunge all records and cannot be reversed.
                        </p>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 h-14 rounded-2xl text-neutral-400 font-bold hover:bg-neutral-50 transition-colors lowercase cursor-pointer"
                            >
                                keep account
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 h-14 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 lowercase cursor-pointer"
                            >
                                delete forever
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DeleteUserModal;
