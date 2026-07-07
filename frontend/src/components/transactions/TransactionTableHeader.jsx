import React from 'react';

const TransactionTableHeader = ({ isAdminOrSupervisor }) => {
    return (
        <thead>
            <tr className="bg-[#f2f4f6]">
                <th className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-neutral-400">Date & Time</th>
                <th className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-neutral-400">Platform</th>
                <th className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-neutral-400">Sender</th>
                <th className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-neutral-400">Receiver</th>
                <th className="px-6 py-5 text-right text-[10px] font-black tracking-widest text-neutral-400">Volume</th>
                {isAdminOrSupervisor && (
                    <th className="px-6 py-5 text-left text-[10px] font-black tracking-widest text-neutral-400">Staff</th>
                )}
                <th className="px-6 py-5 text-right text-[10px] font-black tracking-widest text-neutral-400">Status</th>
                <th className="px-6 py-5 text-center text-[10px] font-black tracking-widest text-neutral-400">Action</th>
            </tr>
        </thead>
    );
};

export default TransactionTableHeader;
