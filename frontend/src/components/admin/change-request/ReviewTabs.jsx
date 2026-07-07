import React from 'react';
import { motion } from 'framer-motion';

const ReviewTabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="flex items-center border-b border-slate-200 gap-8 overflow-x-auto">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative py-4 text-[14px] font-medium  uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"
                        />
                    )}
                </button>
            ))}
        </div>
    );
};

export default ReviewTabs;
