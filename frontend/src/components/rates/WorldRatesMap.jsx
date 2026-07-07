import React from 'react';
import { motion } from 'framer-motion';

const WorldRatesMap = ({ rates = [] }) => {
    const locations = {
        'USD': { x: '18%', y: '40%', name: 'North America' },
        'EUR': { x: '50%', y: '35%', name: 'Europe' },
        'GBP': { x: '47%', y: '32%', name: 'United Kingdom' },
        'BDT': { x: '75%', y: '50%', name: 'Bangladesh' },
        'INR': { x: '72%', y: '52%', name: 'India' },
        'PKR': { x: '69%', y: '50%', name: 'Pakistan' },
        'NPR': { x: '73%', y: '48%', name: 'Nepal' },
        'LKR': { x: '72%', y: '58%', name: 'Sri Lanka' },
        'AED': { x: '60%', y: '48%', name: 'UAE' },
        'SAR': { x: '58%', y: '52%', name: 'Saudi Arabia' }
    };

    return (
        <div className="relative w-full h-full bg-brand-950 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
            {/* Background Map Image */}
            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
                <img 
                    src="/tech_world_map_bg.png" 
                    alt="World Map" 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[20s] ease-linear"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-transparent to-transparent" />
            </div>

            <div className="absolute top-6 left-8 z-20">
                <h3 className="text-white text-lg font-black uppercase tracking-tighter">Global Distribution</h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-brand-300 text-[9px] font-black uppercase tracking-widest leading-none">Live Valuation Nodes</span>
                </div>
            </div>

            {/* Map Pins */}
            {rates.map((r, idx) => {
                const loc = locations[r.sourceCurrency.toUpperCase()];
                if (!loc) return null;

                return (
                    <motion.div
                        key={r.id || idx}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1, duration: 1 }}
                        style={{ left: loc.x, top: loc.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                        <div className="relative group/pin">
                            <motion.div 
                                animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeOut" }}
                                className="absolute inset-0 bg-brand-500 rounded-full"
                            />
                            <div className="w-2.5 h-2.5 bg-white rounded-full border-2 border-brand-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] relative z-10" />
                            
                            {/* Inline Labels (Permanent but subtle) */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity">
                                <span className="text-white font-black text-[9px] whitespace-nowrap">{r.sourceCurrency}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Overlay Stats */}
            <div className="absolute bottom-6 right-8 flex gap-4">
                <div className="text-right">
                    <span className="text-brand-400 text-[8px] font-black uppercase tracking-widest block">Active Corridors</span>
                    <span className="text-white text-xl font-black leading-none">{rates.length}</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-right">
                    <span className="text-brand-400 text-[8px] font-black uppercase tracking-widest block">Global Stability</span>
                    <span className="text-emerald-400 text-xl font-black leading-none">99.9%</span>
                </div>
            </div>
        </div>
    );
};

export default WorldRatesMap;
