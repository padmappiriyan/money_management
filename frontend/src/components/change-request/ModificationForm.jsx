import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiLock, FiEdit3, FiArrowRight } from 'react-icons/fi';

const ModificationForm = ({ transaction, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    field: '',
    newValue: '',
    reason: ''
  });

  const fields = [
    { value: 'amount', label: 'Amount (EUR)' },
    { value: 'senderName', label: 'Sender Name' },
    { value: 'receiverName', label: 'Receiver Name' },
    { value: 'fees', label: 'Fees' },
  ];

  const currentFieldValue = transaction?.[formData.field] || 'Select field first';

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.field || !formData.newValue || !formData.reason) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 flex flex-col gap-5">
      <h3 className="text-xl font-bold text-brand-600 tracking-tighter">Proposed Modifications</h3>

      {/* Field Selection */}
      <div className="flex flex-col gap-1.5 group">
        <label className="text-[9px] font-bold text-slate-400 tracking-widest uppercase ml-1">FIELD TO CHANGE</label>
        <div className="relative">
          <select
            id="field"
            value={formData.field}
            onChange={handleChange}
            className="w-full h-10 pl-4 pr-9 rounded-xl border border-slate-100 bg-slate-50 text-[12px] font-bold text-brand-600 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none cursor-pointer"
            required
          >
            <option value="" disabled>Select a field</option>
            {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-brand-600 transition-colors" size={16} />
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative items-end">
        {/* Connection Arrow for visual cue (Desktop only) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[-1px] z-10 w-5 h-5 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-300">
          <FiArrowRight size={14} />
        </div>

        {/* Current Value (Read-only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-slate-400 tracking-widest uppercase ml-1">CURRENT VALUE</label>
          <div className="h-10 flex items-center px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-400 select-none relative group">
            <span className="truncate">{formData.field ? currentFieldValue : '—'}</span>
            <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          </div>
        </div>

        {/* New Proposed Value */}
        <div className="flex flex-col gap-1.5 group">
          <label className="text-[9px] font-bold text-slate-400 tracking-widest uppercase ml-1">PROPOSED NEW VALUE</label>
          <div className="relative">
            <input
              id="newValue"
              type="text"
              placeholder="Enter new value"
              value={formData.newValue}
              onChange={handleChange}
              className="w-full h-10 pl-4 pr-9 rounded-xl border border-slate-200 bg-white text-[12px]  text-slate-500 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all shadow-sm"
              required
            />
            <FiEdit3 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={14} />
          </div>
        </div>
      </div>

      {/* Mandatory Reason */}
      <div className="flex flex-col gap-1.5 group">
        <div className="flex justify-between items-center ml-1">
          <label className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">REASON FOR REQUEST</label>
          <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">{formData.reason.length} / 500 characters</span>
        </div>
        <textarea
          id="reason"
          placeholder="Correction of input error identified during end-of-day reconciliation..."
          value={formData.reason}
          onChange={handleChange}
          maxLength={500}
          className="w-full h-20 p-4 rounded-xl border border-slate-200 bg-white text-[12px] font-medium text-slate-600 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none shadow-sm"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center md:gap-8 gap-3 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] font-black text-slate-500 hover:text-slate-800 tracking-widest uppercase transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="min-w-[240px] h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center justify-center gap-3 font-black text-[12px] tracking-widest uppercase shadow-[0_10px_20px_rgba(0,66,109,0.2)] hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Submit Change Request'}
          {!loading && <FiArrowRight size={16} />}
        </button>
      </div>
    </form>
  );
};

export default ModificationForm;
