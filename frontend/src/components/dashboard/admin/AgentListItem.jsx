import React from 'react';
import { MapPin } from 'lucide-react';

const AgentListItem = ({ user, isSelected, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`p-3 rounded-2xl cursor-pointer transition-all border mb-2 group relative overflow-hidden ${
                isSelected 
                ? 'bg-brand-50/50 border-brand-100 shadow-sm' 
                : 'bg-white border-transparent hover:bg-neutral-50/60 hover:border-neutral-100'
            }`}
        >
            <div className="flex items-center gap-3 relative z-10">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    isSelected 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                    : 'bg-neutral-50 text-neutral-400 group-hover:bg-brand-50 group-hover:text-brand-600'
                }`}>
                    {user.name?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h5 className={`font-bold text-[13px] truncate transition-colors ${
                        isSelected ? 'text-brand-900' : 'text-slate-800'
                    }`}>
                        {user.name}
                    </h5>
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">
                        {user.role}
                    </p>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between mt-3 relative z-10">
                <div className="flex items-center gap-1.5 text-neutral-400 font-medium text-[11px]">
                    <MapPin size={10} className={isSelected ? 'text-brand-400' : 'text-neutral-300'} />
                    <span>{user.branch || 'Main Branch'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                        user.status?.toLowerCase() === 'active' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                        {user.status || 'OFFLINE'}
                    </span>
                </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-brand-600" />
            )}
        </div>
    );
};

export default AgentListItem;
