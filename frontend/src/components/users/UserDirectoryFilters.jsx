const UserDirectoryFilters = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'All' },
        { id: 'admin', label: 'Admins' },
        { id: 'supervisor', label: 'Supervisors' },
        { id: 'user', label: 'Users' }
    ];

    return (
        <div className="flex items-center bg-white gap-8 py-1.5 px-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">System Directory</h2>
            <div className="flex items-center gap-4">
                {filters.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => onFilterChange(role.id)}
                        className={`text-[12px] font-bold transition-all duration-300 relative ${currentFilter === role.id
                            ? 'text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 px-3 py-1.5'
                            }`}
                    >
                        {role.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UserDirectoryFilters;
