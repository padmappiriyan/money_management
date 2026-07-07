import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDropdown = ({ 
    label, 
    options, 
    value, 
    onChange, 
    icon: Icon,
    placeholder = 'Select Option'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/10 shadow-sm' : 'hover:border-neutral-200'}`}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className={`transition-colors duration-300 ${isOpen ? 'text-brand-500' : 'text-neutral-400'}`} size={18} />}
                    <span className={`text-[11px] font-medium  ${value && value !== 'all' ? 'text-brand-900' : 'text-neutral-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={18} 
                    className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} 
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-100 w-full mt-2 bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden py-2"
                    >
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange({ target: { name: label, value: option.value } });
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-6 py-3.5 text-[11px] font-medium tracking-wide transition-all duration-200 flex items-center justify-between
                                        ${(value && value === option.value) 
                                            ? 'bg-brand-50 text-brand-600' 
                                            : 'text-slate-600 hover:bg-neutral-50 hover:text-brand-500'
                                        }`}
                                >
                                    {option.label}
                                    {(value && value === option.value) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-800" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
