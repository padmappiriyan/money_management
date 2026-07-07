import React from 'react';

const ReviewTabPlaceholder = ({ icon, title, description }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-6 text-center opacity-40">
            {icon}
            <div className="flex flex-col gap-2">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</p>
                <p className="text-xs font-bold text-slate-400 max-w-[240px]">{description}</p>
            </div>
        </div>
    );
};

export default ReviewTabPlaceholder;
