import React from 'react';
import { FiImage, FiGlobe, FiClock, FiActivity, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';

const PlatformList = ({
    platforms = [],
    onSelect,
    onDelete,
    selectedId
}) => {
    const getLogoUrl = (url) => {
        if (!url) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        return `${baseUrl}${url}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-700 pb-12">
            {/* Recent Platforms Section */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100/50">
                <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-[12px] font-bold uppercase text-brand-600">Recent Platforms</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black bg-brand-50 text-brand-600 px-3 py-1 rounded-full uppercase tracking-tight leading-none shadow-sm">
                            {platforms.length} Platforms Created
                        </span>
                    </div>
                </div>

                <div className={`space-y-4 pr-1 ${platforms.length > 3 ? 'max-h-[480px] overflow-y-auto subtle-scrollbar custom-list-container' : ''}`}>
                    {platforms.length > 0 ? (
                        platforms.map((p) => (
                            <div
                                key={p.id}
                                className={`group p-4 rounded-2xl border transition-all bg-[#eef2ff] cursor-pointer flex flex-col gap-3 ${selectedId === p.id
                                    ? 'bg-[#eef2ff] border-neutral-200 shadow-inner'
                                    : 'bg-[#F8FAFC]/50 border-transparent hover:bg-white hover:border-neutral-100 hover:shadow-lg hover:shadow-black/[0.02]'
                                    }`}
                            >
                                <div className="flex items-center justify-between relative">
                                    <div
                                        onClick={() => onSelect(p)}
                                        className="flex items-center gap-4 flex-1"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${selectedId === p.id
                                            ? 'bg-white border-neutral-100 shadow-sm'
                                            : 'bg-white border-neutral-50 shadow-sm'
                                            }`}>
                                            {p.logoUrl ? (
                                                <img src={getLogoUrl(p.logoUrl)} alt={p.name} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <FiImage size={20} className="text-neutral-300" />
                                            )}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-bold text-neutral-800 ">
                                                {p.name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">
                                                Active Deployment by System
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${p.status === 'active'
                                            ? 'bg-[#4ADE80] text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-neutral-200 text-neutral-500'
                                            }`}>
                                            {p.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(p);
                                            }}
                                            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                                            title="Delete Platform"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline Section */}
                                <div
                                    onClick={() => onSelect(p)}
                                    className="pt-3 border-t bg-white rounded-xl p-1 border-neutral-100 flex items-center justify-between gap-4 opacity-80"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white border border-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
                                            <FiClock size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tight leading-none mb-1">Created At</span>
                                            <span className="text-[11px] font-bold text-neutral-600">{formatDate(p.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 border-b-2 border-dashed border-neutral-100 h-1 mb-2 hidden md:block" />

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white border border-neutral-100 rounded-lg flex items-center justify-center text-brand-200">
                                            <FiActivity size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-tight leading-none mb-1">Modified At</span>
                                            <span className="text-[11px] font-bold text-brand-600">{formatDate(p.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                            <FiGlobe size={32} className="mx-auto text-neutral-200 mb-3" />
                            <p className="text-[11px] font-bold uppercase tracking-tight text-neutral-400">Registry Empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlatformList;



