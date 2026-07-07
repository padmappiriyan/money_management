import React from 'react';
import { FiUsers } from 'react-icons/fi';

const ParticipantVerification = ({ senderName, receiverName, remarks, onChange, type }) => {
    return (
        <div className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-neutral-100 flex flex-col space-y-8">
            <div className="flex items-center gap-3 text-brand-600">
                <FiUsers size={22} className="shrink-0" />
                <h3 className="text-lg font-bold">Participant Verification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {type === 'send' && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block ml-1">Sender Name (Payor)</label>
                        <input
                            type="text" name="senderName" required value={senderName} onChange={onChange}
                            placeholder="LEGAL FULL NAME"
                            className="w-full bg-[#e0e3e5] border border-neutral-100 px-5 py-4 rounded-xl font-bold uppercase text-[11px] tracking-tight outline-none focus:bg-white focus:ring-4 focus:ring-[#00426d]/5 focus:border-[#00426d]/20 transition-all placeholder:text-black/30"
                        />
                    </div>
                )}
                {type === 'receive' && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block ml-1">Receiver Name (Remittee)</label>
                        <input
                            type="text" name="receiverName" required value={receiverName} onChange={onChange}
                            placeholder="LEGAL FULL NAME"
                            className="w-full bg-[#e0e3e5] border border-neutral-100 px-5 py-4 rounded-xl font-bold uppercase text-[11px] tracking-widest outline-none focus:bg-white focus:ring-4 focus:ring-[#00426d]/5 focus:border-[#00426d]/20 transition-all placeholder:text-black/30"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block ml-1">Internal Audit Remarks</label>
                <textarea
                    name="remarks" value={remarks} onChange={onChange}
                    placeholder="Internal audit notes or compliance references..."
                    className="w-full bg-[#e0e3e5] border border-neutral-100 px-6 py-5 rounded-2xl font-medium text-[12px] h-32 outline-none focus:bg-white focus:ring-4 focus:ring-[#00426d]/5 focus:border-[#00426d]/20 transition-all placeholder:text-black/30"
                ></textarea>
            </div>
        </div>
    );
};

export default ParticipantVerification;
