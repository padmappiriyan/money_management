import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const flagMap = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'BDT': 'bd', 'INR': 'in',
    'PKR': 'pk', 'NPR': 'np', 'LKR': 'lk', 'AED': 'ae', 'SAR': 'sa', 'AUD': 'au', 'CAD': 'ca', 'SGD': 'sg', 'JPY': 'jp', 'CHF': 'ch', 'CNY': 'cn', 'KES': 'ke', 'MYR': 'my', 'RUB': 'ru', 'THB': 'th'
};

const countryNames = {
    'USD': 'United States', 'EUR': 'Euro', 'GBP': 'United Kingdom', 'BDT': 'Bangladesh',
    'INR': 'India', 'PKR': 'Pakistan', 'NPR': 'Nepal', 'LKR': 'Sri Lanka',
    'AED': 'United Arab Emirates', 'SAR': 'Saudi Arabia', 'AUD': 'Australia',
    'CAD': 'Canada', 'SGD': 'Singapore', 'JPY': 'Japan', 'CHF': 'Switzerland',
    'CNY': 'China', 'KES': 'Kenya', 'MYR': 'Malaysia', 'RUB': 'Russia', 'THB': 'Thailand'
};

const PublicRateList = ({ rates = [] }) => {
    return (
        <div className="w-full flex flex-col gap-[2px] bg-[#a8ccdf]">
            <AnimatePresence>
                {rates.map((r, index) => {
                    const flagCode = flagMap[r.sourceCurrency.toUpperCase()] || 'un';
                    const countryName = countryNames[r.sourceCurrency.toUpperCase()] || r.sourceCurrency;

                    return (
                        <motion.div
                            key={r.id || r.sourceCurrency}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ 
                                scale: 1.02, 
                                zIndex: 10,
                                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
                            }}
                            transition={{ 
                                delay: index * 0.03, 
                                duration: 0.3,
                                scale: { type: "spring", stiffness: 300, damping: 20 } 
                            }}
                            className="flex w-full overflow-hidden shadow-sm relative group cursor-pointer"
                        >
                            {/* Left Column: Country */}
                            <div className="bg-[#123689] group-hover:bg-[#163f9e] transition-colors duration-300 flex-[3] flex items-center gap-5 px-6 py-4 border-r-[2px] border-[#a8ccdf]">
                                <motion.div 
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    className="w-9 h-9 rounded-full overflow-hidden shadow-[inset_0_0_2px_rgba(255,255,255,0.4)] flex-shrink-0 bg-white border border-transparent"
                                >
                                    {flagCode === 'eu' ? (
                                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-yellow-400 font-bold text-sm" style={{ backgroundImage: "radial-gradient(circle, #2563eb, #1e3a8a)" }}>
                                            €
                                        </div>
                                    ) : (
                                        <img
                                            src={`https://flagcdn.com/w80/${flagCode}.png`}
                                            alt={r.sourceCurrency}
                                            className="w-full h-full object-cover scale-150"
                                        />
                                    )}
                                </motion.div>
                                <span className="font-bold text-white text-[18px] tracking-wide group-hover:pl-1 transition-all duration-300">
                                    {countryName}
                                </span>
                            </div>

                            {/* Right Column: Rate Value Phase */}
                            <div className="bg-[#1d4bb7] group-hover:bg-[#2355cc] transition-colors duration-300 flex-[1] flex items-center justify-end px-6 py-4">
                                <motion.span 
                                    className="font-bold text-white text-[18px] md:text-[20px] tracking-widest inline-block"
                                    initial={{ opacity: 0.9 }}
                                    whileHover={{ scale: 1.05, opacity: 1, textShadow: "0px 0px 8px rgba(255,255,255,0.5)" }}
                                >
                                    {r.rate.toFixed(4).replace(/\.?0+$/, '')}
                                </motion.span>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default PublicRateList;
