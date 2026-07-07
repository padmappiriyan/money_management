import React from 'react';
import { FiSearch, FiLayers, FiCalendar, FiDownload } from 'react-icons/fi';

const TransactionFilters = ({ filters, onFilterChange, platformList, onExport, isExporting }) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex flex-col lg:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#00426d] transition-colors" />
                <input
                    type="text"
                    name="keyword"
                    placeholder="Search sender, receiver or ID..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-[#00426d]/5 focus:border-[#00426d]/20 transition-all font-medium text-sm text-neutral-800"
                    value={filters.keyword}
                    onChange={onFilterChange}
                />
            </div>

            {/* Platform Selector */}
            <div className="w-full lg:w-48 relative">
                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <select
                    name="platform"
                    value={filters.platform}
                    onChange={onFilterChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-[#00426d]/5 appearance-none font-medium text-sm text-neutral-800 cursor-pointer"
                >
                    <option value="">All Platforms</option>
                    {platformList.map(p => (
                        <option key={p.id} value={p.id.toLowerCase()}>{p.label}</option>
                    ))}
                </select>
            </div>

            {/* Date Inputs */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-40">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                        type="date"
                        name="startDate"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-100 focus:outline-none text-sm font-medium text-neutral-800 cursor-pointer"
                        value={filters.startDate}
                        onChange={onFilterChange}
                    />
                </div>
                <span className="text-neutral-300 font-bold">-</span>
                <div className="relative flex-1 lg:w-40">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                        type="date"
                        name="endDate"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50/50 border border-neutral-100 focus:outline-none text-sm font-medium text-neutral-800 cursor-pointer"
                        value={filters.endDate}
                        onChange={onFilterChange}
                    />
                </div>
            </div>

            <div className="flex-grow"></div>

            {/* Actions */}
            <button
                onClick={onExport}
                disabled={isExporting}
                className={`flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-black/10 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isExporting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <FiDownload size={16} />
                )}
                {isExporting ? 'Exporting...' : 'Export'}
            </button>
        </div>
    );
};

export default TransactionFilters;
