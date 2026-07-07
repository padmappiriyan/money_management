import React from 'react';
import {
    Workflow,
    CheckCircle2,
    Search,
    Cpu,
    Shield,
    FileText
} from 'lucide-react';

const STEPS = [
    { id: 'REMARK', title: 'Verify Remark', icon: Search, color: 'emerald' },
    { id: 'ASSUMPTION', title: 'Make Assumption', icon: Cpu, color: 'indigo' },
    { id: 'REVIEW', title: 'Final Review', icon: Shield, color: 'amber' },
    { id: 'DECISION', title: 'Make Decision', icon: FileText, color: 'rose' },
];

const MakeExectionGraph = ({ status }) => {
    // Force PENDING status for all, but with vibrant "Premium" colors as requested
    const currentStepIndex = -1; 

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-8">
                <Workflow className="w-5 h-5 text-indigo-600" />
                <h2 className="text-[13px] font-bold tracking-wide text-slate-800 uppercase">
                    Approval Execution Graph
                </h2>
            </div>

            {/* Graph */}
            <div className="flex justify-between items-start w-full relative">
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const color = step.color;

                    // Color mapping for "Always Colorful" Pending state
                    const colorClasses = {
                        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
                        indigo: 'border-indigo-100 bg-indigo-50 text-indigo-600',
                        amber: 'border-amber-100 bg-amber-50 text-amber-600',
                        rose: 'border-rose-100 bg-rose-50 text-rose-600',
                    };

                    return (
                        <div key={step.id} className="flex flex-col items-center relative flex-1">
                            {/* Connecting Line (Colorful even if pending) */}
                            {index < STEPS.length - 1 && (
                                <div className="absolute top-[23px] left-[50%] w-full h-[2px] bg-slate-100 z-0 opacity-50"></div>
                            )}

                            {/* Icon Box (Always Colorful as requested) */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border-2 z-10 ring-4 ring-white shadow-sm transition-all duration-300 ${colorClasses[color]}`}>
                                <Icon className="w-6 h-6" strokeWidth={2} />
                            </div>

                            {/* Text (Always Colorful labels) */}
                            <div className="text-center px-1">
                                <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight ${colorClasses[color].split(' ')[2]}`}>
                                    {step.title}
                                </h3>
                                <p className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${colorClasses[color].split(' ')[2]}`}>
                                    PENDING
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MakeExectionGraph;
