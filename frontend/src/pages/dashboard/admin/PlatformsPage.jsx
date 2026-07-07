import React, { useEffect, useState } from 'react';
import useSettings from '../../../hooks/useSettings';
import {
    FiSearch,
    FiShield,
    FiTerminal,
    FiCpu
} from 'react-icons/fi';
import PlatformForm from '../../../components/platforms/PlatformForm';
import PlatformList from '../../../components/platforms/PlatformList';
import DeletionModal from '../../../components/common/DeletionModal';
import { toast } from 'react-hot-toast';

const PlatformsPage = () => {
    const {
        allPlatforms,
        loading,
        error,
        success,
        loadAllPlatforms,
        createPlatform,
        updatePlatform,
        deletePlatform,
        resetStatus
    } = useSettings();

    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, platform: null });

    useEffect(() => {
        loadAllPlatforms();
    }, [loadAllPlatforms]);

    useEffect(() => {
        if (success) {
            setSelectedPlatform(null);
            setDeleteModal({ isOpen: false, platform: null });
            resetStatus();
            toast.success('Operation completed successfully');
            loadAllPlatforms();
        }
        if (error) {
            toast.error(error);
            resetStatus();
        }
    }, [success, error, resetStatus, loadAllPlatforms]);

    const handleFormSubmit = (data, isUpdate) => {
        if (isUpdate) {
            updatePlatform(selectedPlatform.id, data);
        } else {
            createPlatform(data);
        }
    };

    const handleCancel = () => {
        setSelectedPlatform(null);
    };

    const handlePlatformDelete = (p) => {
        setDeleteModal({ isOpen: true, platform: p });
    };

    const confirmPlatformDelete = () => {
        if (deleteModal.platform) {
            deletePlatform(deleteModal.platform.id);
        }
    };


    const filteredPlatforms = allPlatforms.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Page Context Description */}
                    <div className="px-6 py-2 pb-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-600" />
                            <h2 className="text-[13px] font-black uppercase text-brand-600">Platform Identity Hub</h2>
                        </div>
                        <p className="text-sm font-medium text-neutral-500 leading-relaxed max-w-2xl">
                            Register and categorize your transaction sources here. This system helps you maintain a clear, organized identity for each platform, ensuring your reports are accurate and professionally classified.
                        </p>
                    </div>

                    <PlatformForm
                        initialData={selectedPlatform}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>

                {/* Right Column: Search & List */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-end">
                        <div className="relative group w-full">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-16 pr-8 py-3.5 rounded-2xl bg-white border border-neutral-100 focus:border-neutral-200 focus:outline-none focus:ring-4 focus:ring-brand-600/5 transition-all text-[13px] font-bold text-neutral-600 placeholder:text-neutral-400 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <PlatformList
                        platforms={filteredPlatforms}
                        onSelect={setSelectedPlatform}
                        onDelete={handlePlatformDelete}
                        selectedId={selectedPlatform?.id}
                    />
                </div>
            </div>

            {/* Confirmation Modals */}
            <DeletionModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, platform: null })}
                onConfirm={confirmPlatformDelete}
                itemLabel={deleteModal.platform?.name}
            />
        </div>
    );



};

export default PlatformsPage;
