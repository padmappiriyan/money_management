import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FiChevronDown } from 'react-icons/fi';

const RevenueAnalyticsChart = ({ data, onRangeChange, currentRange }) => {
    // Custom Tooltip for hovering over the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            try {
                // Try to format label closely, fallback if invalid
                const formattedLabel = format(parseISO(label), 'dd MMM yyyy');
                return (
                    <div className="bg-white p-3 rounded-xl border border-neutral-100 shadow-xl">
                        <p className="text-xs font-bold text-neutral-400 mb-2">{formattedLabel}</p>
                        {payload.map((entry, index) => (
                            <p key={index} className="text-sm font-black tracking-tight" style={{ color: entry.color }}>
                                {entry.name}: {entry.value?.toLocaleString()}
                            </p>
                        ))}
                    </div>
                );
            } catch {
                return null;
            }
        }
        return null;
    };

    // Format X Axis Date (e.g., "Mon", "Tue")
    const formatXAxis = (tickItem) => {
        try {
            return format(parseISO(tickItem), 'EEE');
        } catch {
            return tickItem; 
        }
    };
    
    const chartData = Array.isArray(data) ? data : [];

    return (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-neutral-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full relative z-10">
            {/* Header Area */}
            <div className="flex flex-wrap items-start justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-[20px] font-black text-[#1E293B] tracking-tight">Revenue Analytics</h3>
                    <p className="text-[12px] font-semibold text-neutral-400 mt-1">Income vs Expenses over the selected period</p>
                </div>
                
                {/* Simulated Custom Dropdown matching the UI */}
                <div className="relative group">
                    <select 
                        value={currentRange}
                        onChange={(e) => onRangeChange(e.target.value)}
                        className="appearance-none bg-white border border-neutral-100 text-[#1E293B] text-[11px] font-bold px-4 py-2 pr-10 rounded-xl cursor-pointer hover:bg-neutral-50 hover:border-neutral-200 outline-none transition-all shadow-sm"
                    >
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="year">Last 12 months</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none text-sm" />
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[280px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatXAxis} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis 
                                tickFormatter={(val) => val === 0 ? '€0k' : `€${val / 1000}k`} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                                dx={-5}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            
                            <Area 
                                type="monotone" 
                                dataKey="deposit" 
                                name="Income"
                                stroke="#6366F1" 
                                strokeWidth={2.5}
                                fillOpacity={1} 
                                fill="url(#colorDeposit)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="send" 
                                name="Expense"
                                stroke="#F43F5E" 
                                strokeWidth={2.5}
                                fillOpacity={1} 
                                fill="url(#colorSend)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center border-t border-dashed border-neutral-100">
                        <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">No Analytics Data Ready</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueAnalyticsChart;
