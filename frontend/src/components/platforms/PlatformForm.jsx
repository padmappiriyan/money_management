import React, { useState, useEffect } from 'react';
import { FiPlusCircle, FiUpload, FiArrowRight, FiX } from 'react-icons/fi';

const PlatformForm = ({
    initialData = null,
    onSubmit,
    onCancel,
    loading
}) => {
    const [formData, setFormData] = useState({
        name: '',
        status: 'active'
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                status: initialData.status || 'active'
            });
            const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
            setLogoPreview(initialData.logoUrl ? `${baseUrl}${initialData.logoUrl}` : null);
        } else {
            resetForm();
        }
    }, [initialData]);

    const resetForm = () => {
        setFormData({ name: '', status: 'active' });
        setLogo(null);
        setLogoPreview(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('status', formData.status);
        if (logo) data.append('logo', logo);

        onSubmit(data, !!initialData);
        if (!initialData) resetForm();
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-6 border border-neutral-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-left-4 duration-700 h-fit">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-50">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600">
                    <FiPlusCircle size={18} />
                </div>
                <h2 className="text-lg font-bold text-brand-600 ">
                    {initialData ? 'Update Platform' : 'New Platform Source'}
                </h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Name */}
                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-neutral-400 uppercase ml-1">Display Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. MoneyGram"
                            className="w-full px-6 py-4 rounded-2xl bg-[#F8FAFC] border border-transparent focus:bg-white focus:border-neutral-200 focus:outline-none focus:ring-4 focus:ring-brand-600/5 transition-all text-[14px] font-bold text-neutral-700 placeholder:text-neutral-300"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Status Deployment */}
                    <div className="space-y-3">
                        <label className="text-[13px] font-bold text-neutral-400 uppercase  ml-1">Select Status</label>
                        <div
                            onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                            className="flex items-center gap-5 bg-[#F8FAFC] px-6 py-4 rounded-2xl border border-transparent cursor-pointer hover:bg-neutral-50 transition-all group"
                        >
                            <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.status === 'active' ? 'bg-brand-600 shadow-lg shadow-brand-600/20' : 'bg-neutral-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.status === 'active' ? 'left-7 shadow-sm' : 'left-1'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[12px] font-black uppercase tracking-widest ${formData.status === 'active' ? 'text-brand-600' : 'text-neutral-400'}`}>
                                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[13px] font-bold text-neutral-400 uppercase  ml-1">Brand Identity</label>
                    <div className="relative group min-h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-neutral-100 rounded-[2rem] bg-[#F8FAFC]/50 hover:bg-white hover:border-brand-200 transition-all cursor-pointer overflow-hidden">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleLogoChange}
                            accept="image/*"
                        />

                        {logoPreview ? (
                            <div className="relative group/preview">
                                <img src={logoPreview} alt="Preview" className="w-20 h-20 object-contain z-0 transition-transform group-hover/preview:scale-110" />
                                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-600">Change</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-neutral-400 group-hover:text-brand-600 transition-colors">
                                    <FiUpload size={20} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[13px] font-bold text-neutral-800">Choose Brand Asset</p>
                                    <p className="text-[9px] text-neutral-400 font-bold mt-1 uppercase tracking-[0.2em] leading-none">400x400px Recommended</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-50">
                    <button
                        type="button"
                        onClick={() => { resetForm(); onCancel(); }}
                        className="text-[11px] font-bold text-neutral-400 uppercase  hover:text-rose-500 transition-colors flex items-center gap-2"
                    >
                        Discard
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl text-[13px] font-bold cursor-pointer shadow-2xl shadow-brand-600/30 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{initialData ? 'Save Changes' : 'Create Platform'}</span>
                                <FiArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );

};

export default PlatformForm;
