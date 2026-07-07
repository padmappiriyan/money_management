import React from 'react';
import {
    Clock,
    FilePlus,
    CloudUpload,
    Edit3,
    Eye,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const EVENTS = [
    {
        id: 'TRANSACTION_CREATED',
        title: 'Transaction Created',
        description: 'New Transaction created.',
        icon: FilePlus,
        iconBg: 'bg-slate-400',
    },
    {
        id: 'SAVED',
        title: 'Saved',
        description: 'Transaction saved.',
        icon: CloudUpload,
        iconBg: 'bg-emerald-500',
    },
    {
        id: 'CHANGE_REQUESTED_FORM_SUBMITTED',
        title: 'Change Request Form Submitted',
        description: 'Change request form submitted.',
        icon: Edit3,
        iconBg: 'bg-indigo-500',
    },
    {
        id: 'REVIEW_REQUESTED',
        title: 'Review Requested',
        description: 'Review request.',
        icon: Eye,
        iconBg: 'bg-indigo-500',
    },
    {
        id: 'MAKE_EXECUTION_GRAPH',
        title: 'Make Execution Graph',
        description: 'Make execution graph.',
        icon: AlertCircle,
        iconBg: 'bg-rose-500',
    },
];

const ActivityTimeline = ({ request, transaction }) => {
    const createdAt = request?.createdAt ? new Date(request.createdAt) : new Date();
    const transactionDate = transaction?.createdAt ? new Date(transaction.createdAt) : new Date();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-full flex flex-col overflow-hidden max-h-[800px]">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-slate-400" />
                <h2 className="text-[13px] font-bold tracking-wide text-slate-800 uppercase">
                    Activity Timeline
                </h2>
            </div>

            {/* Timeline */}
            <div className="relative overflow-y-auto pr-1">
                {/* Vertical line connecting items */}
                <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

                <div className="space-y-5 relative">
                    {EVENTS.map((item, idx) => {
                        const Icon = item.icon;
                        const eventTime = format(idx < 2 ? transactionDate : createdAt, 'HH:mm');

                        return (
                            <div key={item.id} className="flex gap-4 relative group">
                                {/* Icon container with white ring to cut out the line */}
                                <div className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white bg-white shrink-0">
                                    <div className={`flex items-center justify-center w-full h-full rounded-full ${item.iconBg} text-white shadow-sm transition-transform group-hover:scale-110`}>
                                        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-[14px] font-bold text-slate-900 leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-[12px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                                        {item.description}
                                    </p>
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-tighter mt-0.5">
                                        {eventTime}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActivityTimeline;
