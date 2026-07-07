import React from 'react';
import { Search, Filter, Layers, Briefcase, Calendar, X, RefreshCcw } from 'lucide-react';
import CustomDropdown from '../../ui/CustomDropdown';

const AdminFilterPanel = ({ filters, setFilters, onApply, onClear, platforms = [], embedded = false }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`[DEBUG] Filter Change -> ${name}:`, value);
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const platformOptions = [
        { label: 'All Platforms', value: 'all' },
        ...platforms.map(p => ({
            label: p.name ? p.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : '',
            value: p.id || p._id
        }))
    ];

    const statusOptions = [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Offline', value: 'offline' }
    ];

    const roleOptions = [
        { label: 'All Roles', value: 'all' },
        { label: 'Admin', value: 'admin' },
        { label: 'Supervisor', value: 'supervisor' },
        { label: 'User', value: 'user' }
    ];

    return (
        <div className={embedded ? "p-6 space-y-6" : "bg-white rounded-4xl p-3.5 shadow-sm border border-neutral-100 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500"}>
            {/* Top Row: Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Bar (mapped to name) */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input
                        type="text"
                        name="name"
                        value={filters.name}
                        onChange={handleChange}
                        onKeyDown={(e) => e.key === 'Enter' && onApply()}
                        placeholder="Search by name..."
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-neutral-400"
                    />
                </div>

                <CustomDropdown
                    label="platformId"
                    icon={Filter}
                    value={filters.platformId}
                    options={platformOptions}
                    onChange={handleChange}
                    placeholder="Select Platform"
                />

                {/* Status Select */}
                <CustomDropdown
                    label="status"
                    icon={Layers}
                    value={filters.status}
                    options={statusOptions}
                    onChange={handleChange}
                    placeholder="Select Status"
                />

                {/* Role Select */}
                <CustomDropdown
                    label="role"
                    icon={Briefcase}
                    value={filters.role}
                    options={roleOptions}
                    onChange={handleChange}
                    placeholder="Select Role"
                />
            </div>

            {/* Bottom Row: Date Range & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 border-t border-neutral-50">
                <div className="flex flex-wrap gap-6">
                    {/* From Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium text-brand-800 uppercase  ml-1">Last Updated From</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input
                                type="date"
                                name="updatedFrom"
                                value={filters.updatedFrom}
                                onChange={handleChange}
                                className="pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-neutral-600"
                            />
                        </div>
                    </div>

                    {/* To Date */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium text-brand-800 uppercase ml-1">Last Updated To</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input
                                type="date"
                                name="updatedTo"
                                value={filters.updatedTo}
                                onChange={handleChange}
                                className="pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-neutral-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClear}
                        className="flex items-center gap-2 px-6 py-3 text-brand-800 font-bold text-[10px]  uppercase hover:bg-brand-50 rounded-xl transition-all active:scale-95"
                    >
                        <X size={14} /> Clear All Filters
                    </button>
                    <button
                        onClick={onApply}
                        className="flex items-center gap-2 px-8 py-3 bg-brand-800 text-white font-bold text-[10px]  uppercase rounded-xl shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95"
                    >
                        <RefreshCcw size={14} /> Refresh Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminFilterPanel;
