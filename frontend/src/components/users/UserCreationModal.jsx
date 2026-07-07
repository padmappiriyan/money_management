import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import UserCreationForm from '../auth/UserCreationForm';

const UserCreationModal = ({ isOpen, onClose, onSuccess }) => {
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
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Close Button ── */}
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all z-10"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="p-2 overflow-y-auto max-h-[90vh]">
                        <UserCreationForm onSuccess={() => {
                            onSuccess();
                            // Optional: Close modal after success (done by onSuccess in parent usually)
                        }} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserCreationModal;
