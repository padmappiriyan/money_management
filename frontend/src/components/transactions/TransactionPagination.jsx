import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const TransactionPagination = ({ currentPage, totalPages, totalEntries, onPageChange, loading }) => {
    return (
        <div className="px-6 py-5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black tracking-widest text-neutral-400">
                    Page <span className="text-neutral-900">{currentPage}</span> of <span className="text-neutral-900">{totalPages || 1}</span>
                    <span className="mx-3 opacity-20">|</span>
                    Total <span className="text-neutral-900">{totalEntries}</span> entries found
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2.5 rounded-xl border border-neutral-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <FiChevronLeft className="text-neutral-800" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2.5 rounded-xl border border-neutral-200 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <FiChevronRight className="text-neutral-800" />
                </button>
            </div>
        </div>
    );
};

export default TransactionPagination;
