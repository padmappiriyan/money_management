import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const UserPagination = ({ pagination, onPageChange }) => {
    if (pagination.totalPages <= 1) return null;

    return (
        <div className="px-8 py-6 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/20">
            <p className="text-xs font-bold text-neutral-400">
                Showing <span className="text-neutral-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-neutral-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-neutral-900">{pagination.total}</span> users
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-brand-600 hover:border-brand-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`
                                w-10 h-10 rounded-xl text-xs font-bold transition-all
                                ${pagination.page === i + 1
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-100'
                                    : 'bg-white text-neutral-400 border border-neutral-100 hover:border-brand-100 hover:text-brand-600'
                                }
                            `}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-neutral-100 text-neutral-400 hover:text-brand-600 hover:border-brand-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <FiChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default UserPagination;
