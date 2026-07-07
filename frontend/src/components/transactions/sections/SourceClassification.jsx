import React from 'react';
import { motion } from 'framer-motion';
import { FiGlobe } from 'react-icons/fi';

const SourceClassification = ({ platform, type, onPlatformSelect, onTypeSelect, platformList = [], hidePlatformSelection = false }) => {
    const getLogoUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        return `${baseUrl}${url}`;
    };

    return (
        <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 flex flex-col space-y-10">
            <div className="flex items-center gap-3 text-brand-600">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                    <FiGlobe size={18} />
                </div>
                <h3 className="text-lg font-bold tracking-tight ">Source Classification</h3>
            </div>

            {!hidePlatformSelection && (
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-tight block ml-1">Select Transfer Brand</label>
                    <div className="grid grid-cols-3 gap-4">
                        {platformList.length > 0 ? (
                            platformList.map((p) => (
                                <motion.button
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    key={p.slug}
                                    onClick={() => onPlatformSelect(p.slug)}
                                    className={`
                                        relative flex flex-col items-center justify-center rounded-[1rem] h-20 transition-all duration-500 overflow-hidden border
                                        ${platform === p.slug
                                            ? `bg-brand-600 border-brand-600 text-white shadow-2xl shadow-brand-600/30 scale-105 z-10`
                                            : `bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-neutral-100 hover:border-neutral-200`
                                        }
                                    `}
                                >
                                    <div className="w-18 h-18 flex items-center justify-center p-1">
                                        {p.logoUrl ? (
                                            <img
                                                src={getLogoUrl(p.logoUrl)}
                                                alt={p.name}
                                                className={`w-full h-full object-contain transition-all duration-300 ${platform === p.slug ? 'opacity-100 scale-125' : 'opacity-60 hover:opacity-100'}`}
                                            />
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-center leading-none">{p.name}</span>
                                        )}
                                    </div>
                                    {platform === p.slug && (
                                        <div className="absolute top-1 right-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        </div>
                                    )}
                                </motion.button>
                            ))
                        ) : (
                            <div className="col-span-3 py-6 px-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-center">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No active sources available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}


            <div className="space-y-4">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">Transaction Type</label>
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                    {['send', 'receive'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => onTypeSelect(t)}
                            className={`flex-1 py-3 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-brand-600 text-white shadow-md' : 'text-neutral-500'}`}
                        >
                            {t === 'receive' ? 'Paid' : t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SourceClassification;
