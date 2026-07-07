import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiX, FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { bulkUploadUsers, downloadUserTemplate } from '../../api/userApi';

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' }); 
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'text/plain'];
        if (selectedFile && (allowedMimes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setStatus({ type: null, message: '' });
        } else {
            setStatus({ type: 'error', message: `Invalid file type: ${selectedFile?.type || 'unknown'}. Please select a valid CSV file.` });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'text/plain'];
        if (droppedFile && (allowedMimes.includes(droppedFile.type) || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            setStatus({ type: null, message: '' });
        } else {
            setStatus({ type: 'error', message: 'Please drop a valid CSV file.' });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setStatus({ type: null, message: '' });
        try {
            await bulkUploadUsers(file);
            setStatus({ type: 'success', message: 'Bulk upload started successfully! Results will appear in the activity log.' });
            setFile(null);
            if (onSuccess) onSuccess();
            // setTimeout(onClose, 3000); // Keep it open to show success
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to start bulk upload.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const data = await downloadUserTemplate();
            const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'client_template.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Template download failed', error);
            setStatus({ type: 'error', message: 'Failed to download template.' });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 transition-all duration-300">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white rounded-[1.25rem] shadow-2xl w-full max-w-[420px] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-bold text-[#1e293b] tracking-tight">Bulk Client Upload</h2>
                            <p className="text-[13px] font-medium text-slate-400">Upload multiple clients via CSV</p>
                        </div>
                        <button onClick={onClose} className="p-1 -mr-1 text-slate-400 hover:text-slate-600 transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Download Template Section */}
                        <div className="p-4 rounded-xl bg-[#f0f4ff] flex items-center justify-between border border-[#e2e8f0]/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#6366f1] shadow-sm">
                                    <FiFileText size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-[#1e293b]">Need a template?</span>
                                    <span className="text-[11px] font-medium text-slate-400">Download CSV format</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleDownloadTemplate}
                                className="h-9 px-4 rounded-lg bg-white border border-[#e2e8f0] text-[#6366f1] text-[12px] font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all"
                            >
                                <FiDownload size={14} />
                                Download
                            </button>
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                            className={`relative border-2 border-dashed rounded-xl py-8 px-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group
                                ${file ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#e2e8f0] hover:border-[#6366f1] hover:bg-[#f8faff]'}
                            `}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                                ${file ? 'bg-emerald-500 text-white' : 'bg-white border border-[#e2e8f0] text-[#6366f1] shadow-sm'}
                            `}>
                                {file ? <FiCheckCircle size={24} /> : <FiUpload size={22} />}
                            </div>

                            <div className="text-center space-y-0.5">
                                <h3 className="text-[15px] font-bold text-[#1e293b]">
                                    {file ? file.name : 'Click or drag CSV file to upload'}
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV FILES ONLY'}
                                </p>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl flex items-center gap-3 text-[13px] font-bold
                                    ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}
                                `}
                            >
                                {status.type === 'success' ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                                {status.message}
                            </motion.div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-5 pt-1">
                            <button
                                onClick={onClose}
                                className="text-[14px] font-bold text-slate-500 hover:text-[#1e293b] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className={`h-11 px-8 rounded-lg font-bold text-white text-[14px] transition-all
                                    ${!file || isUploading 
                                        ? 'bg-[#a5b4fc] cursor-not-allowed' 
                                        : 'bg-[#6366f1] hover:bg-[#4f46e5] shadow-lg shadow-indigo-100'}
                                `}
                            >
                                {isUploading ? 'Uploading...' : 'Upload Clients'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BulkUploadModal;
