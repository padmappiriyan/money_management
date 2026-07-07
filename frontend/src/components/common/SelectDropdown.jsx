import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectDropdown = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Find the currently selected label
    const selectedOption = React.useMemo(() => {
        for (const opt of options) {
            if (opt.group) {
                const found = opt.items.find(item => item.value === value);
                if (found) return found;
            } else {
                if (opt.value === value) return opt;
            }
        }
        return null;
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 bg-neutral-50 border border-neutral-200 text-brand-800 text-[11px] font-bold rounded-lg px-3 py-1.5 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-brand-300 cursor-pointer transition-all duration-200"
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Card Options */}
            {isOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-100 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="max-h-60 overflow-y-auto no-scrollbar py-1">
                        {options.map((opt, idx) => {
                            if (opt.group) {
                                return (
                                    <div key={idx} className="flex flex-col">
                                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-3 py-1.5 bg-slate-50/50 leading-none">
                                            {opt.group}
                                        </div>
                                        <div className="flex flex-col py-0.5">
                                            {opt.items.map((item) => {
                                                const isSelected = item.value === value;
                                                return (
                                                    <button
                                                        key={item.value}
                                                        type="button"
                                                        onClick={() => handleSelect(item.value)}
                                                        className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${
                                                            isSelected
                                                                ? 'bg-brand-50 text-brand-700'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-900'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            } else {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${
                                            isSelected
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-brand-900'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            }
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectDropdown;
