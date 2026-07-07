import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiLayers, FiEdit3, FiX, FiCheckCircle, FiSend, FiArrowDownCircle, FiDatabase, FiCalendar } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';
import { CURRENCY_SYMBOL, CURRENCY_LABEL } from '../../utils/currency';
import { getPlatformStyle } from '../../utils/platformStyles';
import { parseAmount } from '../../utils/excelLedger';

const TYPE_OPTIONS = [
    { label: 'Send', value: 'send', icon: FiSend },
    { label: 'Paid', value: 'paid', icon: FiArrowDownCircle },
    { label: 'Deposit', value: 'deposit', icon: FiDatabase },
];

const INITIAL_FORM = {
    platform: '',
    type: '',
    amount: '',
    remark: '',
};

const INITIAL_ERRORS = {
    platform: '',
    type: '',
    amount: '',
    remark: '',
};

const formatPlatformLabel = (name = '') =>
    name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

const FieldError = ({ message }) =>
    message ? (
        <p className="text-[11px] font-semibold text-red-500 ml-1 mt-1">{message}</p>
    ) : null;

const ExcelEntryForm = ({ platforms = [], onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [submitted, setSubmitted] = useState(false);

    const platformOptions = platforms.map((platform) => ({
        label: formatPlatformLabel(platform.name),
        value: platform.slug || platform.id || platform._id,
    }));

    const clearError = (field) => {
        setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        clearError(name);
    };

    const handleTypeSelect = (type) => {
        setFormData((prev) => ({ ...prev, type }));
        clearError('type');
    };

    const validateForm = () => {
        const nextErrors = { ...INITIAL_ERRORS };

        if (!formData.platform) {
            nextErrors.platform = 'Please select the Platform';
        }

        if (!formData.type) {
            nextErrors.type = 'Please select the type';
        }

        if (!String(formData.amount).trim()) {
            nextErrors.amount = 'Please enter the amount';
        } else if (parseAmount(formData.amount) <= 0) {
            nextErrors.amount = 'Please enter a valid amount greater than zero';
        }

        if (!String(formData.remark).trim()) {
            nextErrors.remark = 'Please enter a remark';
        }

        setErrors(nextErrors);
        return !Object.values(nextErrors).some(Boolean);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);

        if (!validateForm()) {
            return;
        }

        const success = onSubmit?.(formData);
        if (success !== false) {
            setFormData(INITIAL_FORM);
            setErrors(INITIAL_ERRORS);
            setSubmitted(false);
        }
    };

    const handleCancel = () => {
        setFormData(INITIAL_FORM);
        setErrors(INITIAL_ERRORS);
        setSubmitted(false);
        onCancel?.();
    };

    const selectedPlatform = platforms.find(
        (platform) => (platform.slug || platform.id || platform._id) === formData.platform
    );
    const platformStyle = selectedPlatform
        ? getPlatformStyle(selectedPlatform.name, selectedPlatform.slug)
        : null;

    const inputErrorClass = (field) =>
        errors[field]
            ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
            : 'border-neutral-100 bg-neutral-50 focus:border-brand-500 focus:ring-brand-500/20';

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 w-full lg:w-1/2 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
        >
            <div className="px-4 py-3.5 border-b border-neutral-100 bg-gradient-to-r from-brand-50/80 via-white to-white">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                        <FiEdit3 size={15} />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-neutral-900 tracking-tight">
                            New Entry
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Record amount in {CURRENCY_LABEL}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-4 md:p-5 space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider ml-1">
                            01. Select Platform <span className="text-red-500">*</span>
                        </label>
                        <div className={errors.platform ? 'rounded-2xl ring-2 ring-red-200' : ''}>
                            <CustomDropdown
                                label="platform"
                                icon={FiLayers}
                                value={formData.platform}
                                options={platformOptions}
                                onChange={handleChange}
                                placeholder="Choose platform"
                            />
                        </div>
                        {platformStyle && !errors.platform && (
                            <p className={`text-[10px] font-bold ml-1 ${platformStyle.accent}`}>
                                Selected: {platformStyle.displayName}
                            </p>
                        )}
                        <FieldError message={errors.platform} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider ml-1">
                            Amount ({CURRENCY_LABEL}) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-base font-black ${errors.amount ? 'text-red-500' : 'text-brand-600'}`}>
                                {CURRENCY_SYMBOL}
                            </span>
                            <input
                                type="text"
                                name="amount"
                                inputMode="decimal"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0,00"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl font-bold text-sm text-neutral-900 outline-none focus:ring-2 transition-all tabular-nums ${inputErrorClass('amount')}`}
                            />
                        </div>
                        <FieldError message={errors.amount} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider ml-1">
                        02. Select Type <span className="text-red-500">*</span>
                    </label>
                    <div className={`grid grid-cols-3 gap-2 rounded-xl ${errors.type && submitted ? 'ring-2 ring-red-200 p-1' : ''}`}>
                        {TYPE_OPTIONS.map(({ label, value, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleTypeSelect(value)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all
                                    ${formData.type === value
                                        ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/25'
                                        : errors.type
                                            ? 'bg-red-50/40 border-red-200 text-neutral-500 hover:border-red-300'
                                            : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:border-neutral-200 hover:bg-neutral-100'
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>
                    <FieldError message={errors.type} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider ml-1">
                        03. Remark <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="remark"
                        value={formData.remark}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Add a note or reference..."
                        className={`w-full px-4 py-3 border rounded-xl text-sm font-medium text-neutral-800 outline-none resize-none focus:ring-2 transition-all placeholder:text-neutral-400 ${inputErrorClass('remark')}`}
                    />
                    <FieldError message={errors.remark} />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-50">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 text-[10px] font-black uppercase tracking-wider hover:bg-neutral-50 transition-all active:scale-[0.98]"
                    >
                        <FiX size={14} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-brand-600/25 hover:bg-brand-700 transition-all active:scale-[0.98]"
                    >
                        <FiCheckCircle size={14} />
                        Submit
                    </button>
                </div>
            </form>
        </motion.section>
    );
};

export default ExcelEntryForm;
